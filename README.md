# Microservices Communication Platform

A TypeScript-based microservices architecture demonstrating inter-service communication using RabbitMQ message broker. This project showcases modern development practices including containerization, comprehensive testing, and monorepo organization.

## 🏗️ Architecture Overview

```
┌─────────────────┐    RabbitMQ    ┌─────────────────┐
│   Service A     │◄──────────────►│   Service B     │
│   (Publisher)   │                │   (Consumer)    │
│   Port: 3001    │                │   Port: 3002    │
└─────────────────┘                └─────────────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        │
                ┌───────▼────────┐
                │  Common Package │
                │ (Shared Utils)  │
                └────────────────┘
```

### Components

- **Service A**: HTTP API that publishes messages to RabbitMQ queues
- **Service B**: HTTP API that consumes messages from RabbitMQ queues + logging endpoint
- **Common Package**: Shared utilities for RabbitMQ connection management
- **RabbitMQ**: Message broker for asynchronous communication

## 🛠️ Technology Stack & Choices

### Core Technologies
- **Node.js 20** - Runtime environment
- **TypeScript** - Type safety and developer experience
- **Express.js** - Fast, minimalist web framework
- **RabbitMQ** - Reliable message broker for microservices communication

### Development Tools
- **npm Workspaces** - Monorepo management
- **Jest + ts-jest** - Testing framework with TypeScript support
- **Supertest** - HTTP integration testing
- **ESLint** - Code linting and quality
- **Docker & Docker Compose** - Containerization and orchestration

### Why These Choices?

#### RabbitMQ over Other Message Brokers
- **Reliability**: Built-in message persistence and delivery guarantees
- **Flexibility**: Supports multiple messaging patterns (pub/sub, request/reply, etc.)
- **Management UI**: Built-in web interface for monitoring
- **Protocol Support**: AMQP standard compliance
- **Clustering**: Easy horizontal scaling

#### Express.js over Alternatives
- **Simplicity**: Minimal setup, extensive ecosystem
- **Performance**: Lightweight and fast
- **Middleware**: Rich plugin ecosystem
- **Community**: Large community support

#### TypeScript Benefits
- **Type Safety**: Catch errors at compile time
- **Developer Experience**: Better IDE support and autocomplete
- **Refactoring**: Safer code modifications
- **Documentation**: Types serve as inline documentation

## 📁 Project Structure

```
Mynth/
├── README.md
├── package.json                 # Root package.json with workspaces
├── docker-compose.yml          # Docker orchestration
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── jest.config.js             # Root Jest configuration
├── tsconfig.base.json         # Base TypeScript config
│
├── __tests__/                  # End-to-end tests
│   └── e2e/
│       └── service-communication.e2e.test.ts
│
├── common/                     # Shared utilities package
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── src/
│   │   ├── index.ts           # Package exports
│   │   └── rabbitmq.ts        # RabbitMQ utilities
│   └── __tests__/
│       └── rabbitmq.unit.test.ts
│
└── services/
    ├── service-a/              # Message publisher service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── jest.config.js
    │   ├── src/
    │   │   └── index.ts
    │   └── __tests__/
    │       ├── index.unit.test.ts
    │       └── index.integration.test.ts
    │
    └── service-b/              # Message consumer service
        ├── Dockerfile
        ├── package.json
        ├── tsconfig.json
        ├── jest.config.js
        ├── src/
        │   └── index.ts
        └── __tests__/
            ├── index.unit.test.ts
            └── index.integration.test.ts
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **npm 9+**
- **Docker & Docker Compose** (for containerized setup)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rajarshi-Misra/Monorepo-microservice.git
   cd Monorepo-microservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy and configure environment file
   cp example.env .env
   
   # Edit .env file:
   # For local development:
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   ```

4. **Start RabbitMQ locally**
   ```bash
   # Option 1: Using Docker
   docker run -d --name rabbitmq \
     -p 5672:5672 -p 15672:15672 \
     rabbitmq:3-management
   
   # Option 2: Using Docker Compose (RabbitMQ only)
   docker-compose up rabbitmq -d
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the services**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Configure environment for Docker**
   ```bash
   # Edit .env file:
   RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
   ```

2. **Build and start all services**
   ```bash
   # Build images
   docker-compose build
   
   # Start all services
   docker-compose up
   
   # Or start in background
   docker-compose up -d
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 📖 API Documentation

### Service A (Port 3001)

#### POST /send
Publishes a message to the RabbitMQ queue.

**Request Body:**
```json
{
  "message": "Your message content",
}
```

**Response:**
```json
{
  "status": "Message sent"
}
```

### Service B (Port 3002)

#### POST /log
Logging endpoint for manual message logging.

**Request Body:**
```json
{
  "message": "Log message content"
}
```

**Response:**
```json
{
  "status": "Logged"
}
```

**Error Response (400):**
```json
{
  "error": "Message is required"
}
```

## 🧪 Testing

This project includes comprehensive testing at multiple levels:

### Test Types
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test HTTP endpoints and service interactions  
- **End-to-End Tests**: Test complete workflows across services

### Running Tests

```bash
# Run all tests
npm test

# Run tests by type
npm run test:unit
npm run test:e2e

# Run tests for specific workspace
npm run test --workspace=common
npm run test --workspace=services/service-a
npm run test --workspace=services/service-b

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage
The project maintains high test coverage across all components:
- Common utilities: Unit tests with mocked dependencies
- Services: Unit and integration tests with HTTP endpoint testing
- End-to-end: Full message flow testing

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev:service-a          # Start Service A in development mode
npm run dev:service-b          # Start Service B in development mode

# Building
npm run build                  # Build all packages
npm run build:common           # Build common package only
npm run build:service-a        # Build Service A only
npm run build:service-b        # Build Service B only

# Production
npm run start:service-a        # Start Service A in production
npm run start:service-b        # Start Service B in production

# Linting
npm run lint                   # Lint all code
npm run lint:fix              # Fix linting issues

# Testing
npm test                      # Run all tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
```

### Development Workflow

1. **Make changes** to your code
2. **Run tests** to ensure everything works
3. **Lint your code** for consistency
4. **Test locally** with `npm run dev`
5. **Test with Docker** using `docker-compose up`

### Message Flow Testing

```bash
# Terminal 1: Start services
docker-compose up

# Terminal 2: Send a message
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Service A!"}'

# Check Service B logs to see the message was received
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Local Value | Docker Value |
|----------|-------------|-------------|--------------|
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://guest:guest@localhost:5672` | `amqp://guest:guest@rabbitmq:5672` |

### RabbitMQ Management
Access RabbitMQ management interface at:
- http://localhost:15672
- **Credentials**: guest/guest

## 🐛 Troubleshooting

### Common Issues

#### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:5672
```
**Solution**: Ensure RabbitMQ is running and the `RABBITMQ_URL` is correct for your environment.

#### Module Resolution Error
```
Cannot find module '@mynth/common'
```
**Solution**: Run `npm install` in the root directory to set up workspace symlinks.

#### Docker Build Issues
```
COPY failed: file not found
```
**Solution**: Ensure you're building from the correct context:
```bash
docker-compose build --no-cache
```

#### ESLint Errors with __dirname
**Solution**: The project uses ES modules. Use `import.meta.url` or `process.cwd()` instead of `__dirname`.

### Debug Tips

1. **Check container logs**:
   ```bash
   docker-compose logs service-a
   docker-compose logs service-b
   docker-compose logs rabbitmq
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose exec service-a printenv | grep RABBITMQ
   ```

3. **Test RabbitMQ connection**:
   ```bash
   # Check if RabbitMQ is accessible
   telnet localhost 5672
   ```