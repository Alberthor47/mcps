# Example of MongoDB MCP Integration x GitHub Copilot

This project demonstrates a complete **Model Context Protocol (MCP)** implementation that connects AI assistants like GitHub Copilot to a MongoDB database through a standardized interface.

To demonstrate how MCP works, we're using GitHub Copilot (no matter the model) as MCP Client to interact to MongoDB MCP server which in turn connects to a MongoDB database running in a Docker container. The database contains a dataset of Marvel characters, allowing for rich AI interactions.

## Architecture

```text
GitHub Copilot (MCP Client)
    ↓ MCP Protocol
MongoDB Server(MCP Server)
    ↓ MongoDB Driver
MongoDB Database (Docker)
    ↓ Contains
Marvel Characters Data
```

## Quick Start

You can quickly set up this project using Docker and Docker Compose. The following steps will guide you through the process of running a MongoDB instance with pre-populated Marvel character data, ready for AI interactions.

### Prerequisites

- Docker and Docker Compose
- VS Code with GitHub Copilot
- Node.js (for MCP server)

### 1. Start MongoDB Container

```bash
docker-compose up -d
```

### 2. Database Configuration

Replace the connection string in `.vscode/mcp.json` with your MongoDB connection details:

```json
{
    "mongodb_connection_string": "mongodb://admin:password123@localhost:27017/testdb?authSource=admin"
}
```

### 3. Data Import

The database is automatically populated with Marvel character data when the container starts for the first time.

## Usage Examples

Once configured, AI assistants can interact with the database using natural language:

- *"Show me the first 10 Marvel characters"*
- *"Find all female characters from Earth-616"*
- *"What are the different universes in the database?"*
- *"Count how many characters are alive"*

## Management Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Reset Database (Fresh Import)

```bash
docker-compose down -v
docker-compose up -d
```

### View Logs

```bash
docker-compose logs mongodb
```

### Direct Database Access

```bash
docker exec -it mongodb-mcp-test mongosh "mongodb://admin:password123@localhost:27017/testdb?authSource=admin"
```

## Learn More

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MongoDB MCP Server Documentation](https://github.com/mongodb-js/mongodb-mcp-server)
