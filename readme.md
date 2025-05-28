# Omniminds.ai 🧠

[omniminds.ai](https://www.omniminds.ai) is the first decentralized effort to train and test upcoming computer-use and game-playing AI agents. Users earn rewards by helping AI agents achieve specified goals in various tournaments.

## 🔗 Useful Links

- **Community**: [https://t.me/omnimindsai](https://t.me/omnimindsai)
- **Documentation**: [https://docs.omniminds.ai/](https://docs.omniminds.ai/)
- **Smart Contract**: HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump

## 🎯 Our Vision

We're building a decentralized platform where:

- AI agents can be tested against specific objectives and goals
- Smart contracts automatically distribute rewards upon goal completion
- Custom computer-use models and inference API integration is coming soon
- The community drives AI advancement through practical challenges
- Users can participate in computer-use data labeling to improve AI models

## 🚀 Development Quickstart

### Prerequisites

- Docker and Docker Compose
- Node.js and npm
- OpenAI API key
- Solana CLI tools and wallet

### Environment Setup

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your API keys.

2. Set up Solana keypair:

Install the [Solana CLI](https://solana.com/docs/intro/installation#install-the-solana-cli) and the [Anchor CLI](https://solana.com/docs/intro/installation#install-anchor-cli).

```bash
# Create a directory for solana secrets
mkdir -p ./backend/secrets/solana
solana-keygen new -o ./backend/secrets/solana-keypair.json
```

### Start Development Environment

```bash
# Make sure solana is on devnet
solana config set --url https://api.devnet.solana.com/

# Build and Deploy Contract
cd backend/jailbreak-pool 
anchor build
# To deploy make sure that your previously created keypair has a SOL balance.
anchor deploy

# Start all services
docker compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8001
# MongoDB: mongodb://localhost:27017
# Nginx: http://localhost:80
```

## 🤖 How It Works

### 1. Choose a Tournament

- Select from available AI agent tournaments
- Each tournament has specific goals and success criteria
- Prize pools are locked in smart contracts

### 2. Help AI Agents Achieve Goals

- Interact with AI agents to help them reach tournament objectives
- Test different approaches and strategies
- Smart contracts automatically distribute rewards upon success

### 3. Upcoming Features

- Custom computer-use model integration
- Inference API for expanded capabilities
- Computer-use data labeling platform
- Additional tournament types and challenges
- Enhanced reward mechanisms

## 📊 Tournament System

- Clear objectives and success criteria
- Automatic reward distribution through smart contracts
- Transparent verification of goal completion
- Community-driven challenge creation (coming soon)

## 📞 Contact & Support

For technical support or partnership inquiries, reach out at **contact@omniminds.ai**
