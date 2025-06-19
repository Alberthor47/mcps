# MCP + MongoDB Project

A comprehensive project demonstrating how to use an existing a new (created by us) **MCP (Model Context Protocol) client** to interact with **MongoDB MCP server** through natural language queries.

## 🎯 **Project Overview**

This project showcases the integration of:
- **GitHub Copilot** in agent mode as an MCP client
- **Ollama** with gemma3:1b model for local AI processing
- **MongoDB MCP Server** for database operations
- **Model Context Protocol** for standardized AI-tool communication
- **Natural Language Processing** for intuitive database queries

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Query    │───▶│  Ollama Client   │───▶│  MongoDB MCP    │
│ (Natural Lang.) │    │   (gemma3:1b)    │    │     Server      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Query Translation│    │   MongoDB DB    │
                       │   & Response     │    │   (Docker)      │
                       └──────────────────┘    └─────────────────┘
```

## 📁 **Project Structure**

```
mcps/
├── README.md                     # This file
├── copilot-mcp/                  # MongoDB setup & data
│   ├── docker-compose.yml        # MongoDB container config
│   ├── users.csv                 # Sample data
│   └── import-csv.sh             # Data import script
├── ollama-mcp-client/            # Main MCP client application
│   ├── src/
│   │   ├── mcp-client.ts         # Full MCP implementation
│   │   └── demo.js               # Demo script
│   ├── package.json              # Dependencies & scripts
│   ├── .env                      # Environment configuration
│   ├── tsconfig.json             # TypeScript config
│   └── README.md                 # Client-specific docs
└── slides/                       # Project presentation
    ├── slides.md
    ├── slides.html
    └── slides.pdf
```

## 🚀 **Quick Start**

### **Prerequisites**

1. **Ollama** with gemma3:1b model installed and running
2. **Docker & Docker Compose** for MongoDB
3. **Node.js 18+** and npm
4. **npx** available in PATH

### **1. Start MongoDB Database**

```bash
cd copilot-mcp
docker-compose up -d
```

This will:
- Start MongoDB on port 27017
- Create admin user (admin/password123)
- Import sample data from users.csv (marvel characters from kaggle)

### **2. Set Up Ollama MCP Client**

```bash
cd ollama-mcp-client
npm install
```

### **3. Configure Environment**

The `.env` file should contain:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:1b
MDB_MCP_CONNECTION_STRING=mongodb://admin:password123@localhost:27017/testdb?authSource=admin
```

### **4. Run the Client**

```bash
npm run dev
```

## 💬 **Usage Examples**

Once the client is running, you can ask natural language questions:

```
You: Show me all users
🤖 AI will translate this to a MongoDB find query

You: Count how many users we have
🤖 AI will use MongoDB count operation

You: Find users with admin privileges
🤖 AI will query for specific user attributes

You: List all collections in the database
🤖 AI will use database inspection tools
```

## 🛠️ **Available Commands**

### **MongoDB Management**
```bash
# Start MongoDB
cd copilot-mcp && docker-compose up -d

# Stop MongoDB
cd copilot-mcp && docker-compose down

# View MongoDB logs
cd copilot-mcp && docker-compose logs -f
```

### **Ollama MCP Client**
```bash
cd ollama-mcp-client

# Run the MCP client
npm run dev

# Build TypeScript
npm run build

# Run demo
node demo.js
```

Enjoy exploring your data with natural language! 🚀
