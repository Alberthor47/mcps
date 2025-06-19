import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Ollama } from 'ollama';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
}

export class OllamaMCPClient {
    private client: Client | undefined;
    private transport: StdioClientTransport | undefined;
    private ollama: Ollama;
    private availableTools: MCPTool[] = [];
    private rl: readline.Interface;

    constructor() {
        this.ollama = new Ollama({ 
            host: process.env.OLLAMA_HOST || 'http://localhost:11434' 
        });
        this.rl = readline.createInterface({ input, output });
    }

    async initialize(): Promise<void> {
        console.log(chalk.blue('🚀 Initializing Ollama MCP Client...'));

        // Create transport and client
        console.log(chalk.yellow('🔗 Starting MongoDB MCP Server...'));
        const connectionString = process.env.MONGODB_CONNECTION_STRING || '';
        this.transport = new StdioClientTransport({
            command: '/usr/local/bin/npx',
            args: [
                "-y",
                "mongodb-mcp-server",
                "--connectionString",
                "mongodb://admin:password123@localhost:27017/testdb?authSource=admin"
            ],
        });

        this.client = new Client({
            name: 'ollama-mcp-client',
            version: '1.0.0'
        });

        try {
            await this.client.connect(this.transport);
            console.log(chalk.green('✅ Connected to MongoDB MCP server'));
        } catch (error) {
            console.error(chalk.red('❌ Failed to connect to MCP server:'), error);
            throw error;
        }

        // Get available tools
        await this.loadAvailableTools();
    }

    private async loadAvailableTools(): Promise<void> {
        try {
            if (!this.client) {
                throw new Error('Client not initialized');
            }

            const tools = await this.client.listTools();
            this.availableTools = tools.tools.map(tool => ({
                name: tool.name,
                description: tool.description || '',
                inputSchema: tool.inputSchema
            }));

            console.log(chalk.yellow(`📋 Available MongoDB tools:`));
            this.availableTools.forEach(tool => {
                console.log(chalk.gray(`  • ${tool.name}: ${tool.description}`));
            });
        } catch (error) {
            console.error(chalk.red('❌ Error loading tools:'), error);
        }
    }

    private generateSystemPrompt(): string {
        const toolsDescription = this.availableTools.map(tool => 
            `- ${tool.name}: ${tool.description}`
        ).join('\n');

        return `You are an AI assistant that can interact with a MongoDB database through MCP (Model Context Protocol) tools.

                Available MongoDB MCP tools:
                ${toolsDescription}

                When a user asks a question that requires database interaction, you should:
                1. Analyze the user's natural language query
                2. Determine which MCP tool(s) to use
                3. Format the appropriate parameters for the tool call
                4. Present the results in a user-friendly way

                For database queries, always respond with a JSON object containing the tool call:
                {
                    "action": "call_tool",
                    "tool_name": "tool_name_here",
                    "arguments": {
                        "parameter1": "value1",
                        "parameter2": "value2"
                    }
                }

                Available MongoDB operations:
                - find: Query documents in a collection
                - aggregate: Run aggregation pipelines
                - count: Count documents
                - insert-one/insert-many: Insert documents
                - update-one/update-many: Update documents
                - create-index: Create database indexes

                For queries that don't require database interaction, respond normally.
        `;
    }

    private async callOllama(prompt: string): Promise<string> {
        try {
            const response = await this.ollama.chat({
                model: process.env.OLLAMA_MODEL || '',
                messages: [
                    {
                        role: 'system',
                        content: this.generateSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            return response.message.content;
        } catch (error) {
            console.error(chalk.red('❌ Error calling Ollama:'), error);
            return 'Sorry, I encountered an error processing your request.';
        }
    }

    private async executeMCPTool(toolName: string, args: any): Promise<any> {
        try {
            if (!this.client) {
                throw new Error('Client not initialized');
            }

            const result = await this.client.callTool({
                name: toolName,
                arguments: args
            });
            return result;
        } catch (error) {
            console.error(chalk.red(`❌ Error executing tool ${toolName}:`), error);
            throw error;
        }
    }

    private parseToolCall(response: string): { toolName: string; args: any } | null {
        try {
            // Look for JSON-like structures in the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.action === 'call_tool' && parsed.tool_name && parsed.arguments) {
                return {
                    toolName: parsed.tool_name,
                    args: parsed.arguments
                };
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    async processQuery(userQuery: string): Promise<void> {
        console.log(chalk.cyan(`\n🤔 Processing: "${userQuery}"`));

        // Get AI response
        const aiResponse = await this.callOllama(userQuery);
        console.log(chalk.blue('\n🤖 AI Analysis:'));
        console.log(aiResponse);

        // Check if AI wants to call a tool
        const toolCall = this.parseToolCall(aiResponse);

        if (toolCall) {
            console.log(chalk.yellow(`\n🔧 Executing MongoDB tool: ${toolCall.toolName}`));
            console.log(chalk.gray(`Arguments: ${JSON.stringify(toolCall.args, null, 2)}`));

            try {
                const toolResult = await this.executeMCPTool(toolCall.toolName, toolCall.args);
                console.log(chalk.green('\n📊 Database Result:'));

                // Extract and display the actual content
                if (toolResult.content && Array.isArray(toolResult.content)) {
                    toolResult.content.forEach((item: any) => {
                        if (item.type === 'text') {
                        console.log(item.text);
                        }
                    });
                } else {
                    console.log(JSON.stringify(toolResult, null, 2));
                }

                // Get AI to interpret the results
                const interpretationPrompt = `The database query returned the following results. Please interpret and summarize them for the user in a friendly way:
                    User's original question: ${userQuery}
                    Database results: ${JSON.stringify(toolResult, null, 2)}
                `;

                const interpretation = await this.callOllama(interpretationPrompt);
                console.log(chalk.green('\n💡 Summary:'));
                console.log(interpretation);
            } catch (error) {
                console.error(chalk.red('❌ Tool execution failed:'), error);
            }
        }
    }

    async startInteractiveSession(): Promise<void> {
        console.log(chalk.green('\n🎯 Starting interactive session. Type "exit" to quit, "tools" to list available tools.\n'));

        while (true) {
            try {
                const query = await this.rl.question(chalk.yellow('You: '));
                
                if (query.toLowerCase() === 'exit') {
                    break;
                }

                if (query.toLowerCase() === 'tools') {
                    await this.loadAvailableTools();
                    continue;
                }

                if (query.trim()) {
                    await this.processQuery(query);
                }
                
                console.log('\n' + '─'.repeat(50) + '\n');
            } catch (error) {
                console.error(chalk.red('❌ Error:'), error);
            }
        }

        await this.cleanup();
    }

    async cleanup(): Promise<void> {
        console.log(chalk.blue('\n👋 Cleaning up...'));
        this.rl.close();
        if (this.client) {
            await this.client.close();
        }
        if (this.transport) {
            await this.transport.close();
        }
    }
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const client = new OllamaMCPClient();
    
    process.on('SIGINT', async () => {
        await client.cleanup();
        process.exit(0);
    });

    try {
        await client.initialize();
        await client.startInteractiveSession();
    } catch (error) {
        console.error(chalk.red('❌ Failed to start client:'), error);
        process.exit(1);
    }
}
