# 🛡️ Final Sendec System - Multi-AI Quorum Security Platform

> **Advanced AI Orchestration with Cryptographic Security, Democratic Decision Making, and Real-time Monitoring**

## 🎯 Overview

Final Sendec System adalah platform keamanan canggih yang menggabungkan:
- **Multi-AI Coordination** - Orkestra AI dengan decision making demokratis
- **Shamir Secret Sharing** - Distributed cryptographic key management
- **Quorum Voting** - Threshold-based consensus untuk keputusan kritis
- **Self-Destruction Protocol** - Ultimate fail-safe dengan multi-AI approval
- **Real-time Monitoring** - Live status tracking dan alert system
- **Telegram Integration** - Remote monitoring dan notification system

## 🚀 Quick Start Demo

### 1. Start the System
```bash
cd sendec-server
node final-sendec-system.js
```

### 2. Start Web Server
```bash
npx http-server . -p 8080
```

### 3. Access Demo
- **Main Demo**: http://127.0.0.1:8080/final-sendec-client.html
- **Admin API**: http://127.0.0.1:6000/status
- **Protected Shell**: http://127.0.0.1:8080/index-shell.html

### 4. For Public Demo (Ngrok)
```bash
ngrok http 8080
# Share the https://xxxxx.ngrok.io/final-sendec-client.html URL
```

## 🏗️ Architecture

```
🎛️ ORCHESTRATOR (Port 6000)
├── 🤖 AI Nodes (coordinator, guard, interpreter)
├── 🔐 Shamir Secret Sharing (Port 5000)
├── 🗳️ Self-Destruct Quorum (Port 5501)
├── 🔑 Token Generator (Port 5502)
├── 📱 Telegram Integration (Port 5503)
└── 🌐 Original Sendec Server (Port 3000)
```

## 📁 Core Files

### 🎯 Demo Files
- **`final-sendec-client.html`** - Main demo interface with Matrix effect
- **`final-sendec-system.js`** - Master orchestrator and admin API
- **`index-shell.html`** - Protected content shell

### 🔐 Security Components
- **`token-service-sss.js`** - Shamir Secret Sharing implementation
- **`self-destruct-quorum.js`** - Multi-AI voting system
- **`telegram-quorum-server.js`** - Telegram integration server
- **`encrypt.js`** - AES-256-GCM encryption utilities
- **`split_master.js`** - Master key splitting utility

### 🤖 AI Integration
- **`telegram-trigger-client.js`** - AI node trigger client
- **`node-submit-share.js`** - Share submission client
- **`generate-ai-jwt.js`** - JWT token generator
- **`setup-telegram.js`** - Telegram bot setup utility

### 📊 Monitoring & Control
- **`telegram-dashboard.html`** - Web-based monitoring dashboard
- **`telegram-integration.js`** - Telegram alert system
- **`detector.js`** - Rate limiting and anomaly detection

## 🎮 Demo Flow

### 1. **System Status** (Real-time)
- Live monitoring semua AI nodes
- Service health checks
- Process status tracking

### 2. **Protected Content Loading**
- Symbol-based encryption
- Multi-AI interpretation
- Ephemeral key management

### 3. **Attack Simulation**
- Rate limiting demonstration
- Anomaly detection
- Alert system activation

### 4. **Self-Destruct Voting**
- Democratic decision making
- JWT-authenticated votes
- Quorum threshold (2/3)
- Complete data purge

### 5. **Key Rotation**
- Ephemeral token rotation
- Seed regeneration
- Security refresh

## 🔑 Security Features

### 🛡️ Multi-Layer Protection
- **RSA-2048 Signatures** - JWT authentication untuk semua AI nodes
- **AES-256-GCM Encryption** - Protected content encryption
- **Shamir Secret Sharing** - Distributed key management (3/5 threshold)
- **Quorum Voting** - Democratic consensus (2/3 threshold)
- **Rate Limiting** - DDoS protection dengan automatic blocking

### 🔐 Cryptographic Components
- **Master Key**: 256-bit AES key untuk content encryption
- **Share Distribution**: 5 shares dengan threshold 3 untuk reconstruction
- **JWT Tokens**: RSA-signed dengan 60s expiration
- **Ephemeral Seeds**: Short-lived tokens untuk session management

### 🗳️ Democratic Decision Making
- **Coordinator AI**: Strategic decision making
- **Guard AI**: Security monitoring dan threat detection
- **Interpreter AI**: Symbol analysis dan content interpretation
- **Quorum Requirement**: Minimal 2 dari 3 AI harus setuju untuk destruksi

## 📱 Telegram Integration

### Setup
```bash
node setup-telegram.js
# Follow prompts to configure BOT_TOKEN and CHAT_ID
```

### Features
- **Real-time Alerts** - Vote notifications, system status
- **Remote Triggering** - JWT-authenticated commands
- **Health Monitoring** - AI node status tracking
- **Custom Alerts** - Priority-based notifications

## 🧪 Testing & Validation

### Manual Testing
```bash
# Test orchestrator API
curl http://127.0.0.1:6000/status

# Generate demo JWT
curl http://127.0.0.1:6000/generate-jwt?node=coordinator

# Trigger attack simulation
curl -X POST http://127.0.0.1:6000/trigger-attack

# Test self-destruct vote
curl -X POST http://127.0.0.1:5501/self-destruct-quorum \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"coordinator","jwtToken":"<JWT_TOKEN>"}'
```

### Automated Testing
```bash
# Test Telegram integration
node telegram-trigger-client.js heartbeat coordinator active

# Test custom alerts
node telegram-trigger-client.js alert guard "Security Alert" "Test message" critical

# Test destruction trigger
node telegram-trigger-client.js trigger coordinator "Emergency test"
```

## 🎤 Presentation Script (4 minutes)

### 1. **Opening** (30s)
"Final Sendec System: AI orchestration dengan keamanan kriptografi, quorum voting, dan monitoring real-time."

### 2. **Demo Interface** (40s)
- Matrix effect background
- Real-time service monitoring
- Interactive controls

### 3. **Status Monitoring** (30s)
- Live AI node status
- Service health checks
- Real-time logs

### 4. **Attack Simulation** (30s)
- Trigger attack demonstration
- Anomaly detection
- Alert system activation

### 5. **Self-Destruct Voting** (60s)
- Democratic decision making
- Quorum threshold demonstration
- Complete system destruction

### 6. **Key Rotation** (30s)
- Security refresh demonstration
- Ephemeral token management

### 7. **Closing** (30s)
- Recap key features
- Security benefits
- AI collaboration showcase

## 🔧 Configuration

### Environment Variables
```bash
# Telegram Integration (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Security Settings
SSS_THRESHOLD=3          # Shamir threshold
QUORUM_THRESHOLD=2       # Self-destruct quorum
ROTATION_INTERVAL=30000  # Key rotation interval (ms)
```

### File Structure
```
sendec-server/
├── 📄 README.md                    # This documentation
├── 🎯 final-sendec-client.html     # Main demo interface
├── 🎛️ final-sendec-system.js       # Master orchestrator
├── 🔐 Security Components/
│   ├── token-service-sss.js
│   ├── self-destruct-quorum.js
│   ├── encrypt.js
│   └── split_master.js
├── 🤖 AI Integration/
│   ├── telegram-trigger-client.js
│   ├── node-submit-share.js
│   └── generate-ai-jwt.js
├── 📊 Monitoring/
│   ├── telegram-dashboard.html
│   ├── telegram-integration.js
│   └── detector.js
├── 🔑 Keys/
│   ├── coordinator.key/.pub
│   ├── guard.key/.pub
│   └── interpreter.key/.pub
└── 📋 Configuration/
    ├── pubkeys.json
    ├── telegram-config.js
    └── symbol_dict.js
```

## 🏆 Competition Features

### For Qodo.ai Judges
- **Live Demo**: Interactive real-time demonstration
- **Security Focus**: Advanced cryptographic implementations
- **AI Collaboration**: Multi-agent democratic decision making
- **Visual Appeal**: Matrix effect dengan smooth animations
- **Technical Depth**: Shamir SSS, JWT auth, quorum consensus
- **Practical Application**: Real-world security scenarios

### Key Differentiators
1. **Democratic AI Decision Making** - No single point of failure
2. **Cryptographic Security** - Industry-standard encryption
3. **Real-time Monitoring** - Live system health tracking
4. **Self-Destruction Protocol** - Ultimate security fail-safe
5. **Telegram Integration** - Remote monitoring capabilities
6. **Interactive Demo** - Engaging user experience

## 📞 Support & Contact

For technical questions or demo setup assistance:
- Check logs in respective service log files
- Use `curl` commands for API testing
- Monitor orchestrator output for debugging
- Test Telegram integration with setup script

---

**🎯 Ready for Competition Demo!**

This system demonstrates advanced AI coordination, cryptographic security, and democratic decision making in a visually appealing, technically sophisticated package perfect for Qodo.ai competition presentation.