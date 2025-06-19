#!/usr/bin/env node

import { OllamaMCPClient } from './dist/mcp-client.js';
import chalk from 'chalk';

async function runDemo() {
    console.log(chalk.blue('🚀 Starting Ollama MCP Client Demo'));
    console.log(chalk.gray('This demo will show you how to interact with MongoDB using natural language.'));
    console.log(chalk.gray('Make sure you have:'));
    console.log(chalk.gray('  - MongoDB running (docker-compose up -d in copilot-mcp folder)'));
    console.log(chalk.gray('  - Ollama running with gemma3:1b model'));
    console.log(chalk.gray(''));

    const client = new OllamaMCPClient();

    try {
        await client.initialize();

        // Demo queries
        const demoQueries = [
            "What collections are available in the database?",
            "Show me all users in the users collection",
            "How many users are there in total?",
            "Find users with the name John",
            "Insert a new user with name Alice and age 25"
        ];

        console.log(chalk.yellow('\n📋 Demo Queries:'));
        demoQueries.forEach((query, index) => {
            console.log(chalk.gray(`  ${index + 1}. ${query}`));
        });

        console.log(chalk.green('\n🎯 Starting interactive session...'));
        console.log(chalk.green('Try asking questions like the ones above, or type "exit" to quit.\n'));

        await client.startInteractiveSession();
    } catch (error) {
        console.error(chalk.red('❌ Demo failed:'), error);
        console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
        console.log(chalk.gray('  - Check if MongoDB is running: docker ps'));
        console.log(chalk.gray('  - Check if Ollama is running: ollama list'));
        console.log(chalk.gray('  - Verify gemma3:1b model is available: ollama pull gemma3:1b'));
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runDemo();
}
