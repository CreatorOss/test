# 🚀 Quick Start Guide - Final Sendec System

## ⚡ 30-Second Setup

```bash
# 1. Navigate to project
cd sendec-server

# 2. Start orchestrator (background)
node final-sendec-system.js &

# 3. Start web server (background)  
npx http-server . -p 8080 &

# 4. Open demo
open http://127.0.0.1:8080/final-sendec-client.html
```

## 🌐 Public Demo (Ngrok)

```bash
# Install ngrok (if needed)
# Download from https://ngrok.com/

# Create public tunnel
ngrok http 8080

# Share the https://xxxxx.ngrok.io/final-sendec-client.html URL
```

## 🎮 Demo Actions

### 1. **Load Protected Content**
- Click "Load Protected Content"
- Opens symbol-based encrypted shell
- Demonstrates AES-256-GCM encryption

### 2. **Trigger Attack**
- Click "Trigger Attack (demo)"
- Simulates security breach
- Shows rate limiting and detection

### 3. **Self-Destruct Vote**
- Click "Cast Self-Destruct Vote (demo)" twice
- First vote: registers (1/2)
- Second vote: triggers destruction (2/2)
- Demonstrates democratic quorum

### 4. **Key Rotation**
- Click "Force Rotate Seeds"
- Refreshes cryptographic materials
- Shows security maintenance

## 📊 Monitoring

### Real-time Status
- Service health monitoring
- AI node status tracking
- Live process information
- Activity logs with timestamps

### API Endpoints
```bash
# System status
curl http://127.0.0.1:6000/status

# Generate JWT
curl http://127.0.0.1:6000/generate-jwt?node=coordinator

# Trigger attack
curl -X POST http://127.0.0.1:6000/trigger-attack
```

## 🔧 Troubleshooting

### Services Not Starting
```bash
# Check if ports are free
netstat -tulpn | grep -E ':(3000|5000|5501|5502|6000|8080)'

# Kill existing processes
pkill -f "final-sendec-system"
pkill -f "http-server"

# Restart
node final-sendec-system.js &
npx http-server . -p 8080 &
```

### Demo Not Working
```bash
# Test orchestrator
curl http://127.0.0.1:6000/status

# Test web server
curl http://127.0.0.1:8080/final-sendec-client.html

# Check logs
tail -f *.log
```

## 📱 Presentation Mode

### Slides
- Open: `http://127.0.0.1:8080/presentation-slides.html`
- Navigate: Arrow keys or buttons
- 7 slides total, 4-minute presentation

### Demo Script
- Follow: `DEMO_SCRIPT.md`
- Timing: 30s per section
- Total: 4 minutes

## 🎯 Key Features to Highlight

1. **Matrix Effect** - Visual appeal
2. **Real-time Monitoring** - Live status updates
3. **Interactive Controls** - One-click actions
4. **Democratic Voting** - Multi-AI consensus
5. **Cryptographic Security** - Industry standards

## ✅ Success Indicators

- [ ] Matrix background animating
- [ ] Services showing "running: true"
- [ ] Buttons responding with log updates
- [ ] Self-destruct reaching quorum
- [ ] Status updates in real-time

**🎉 Ready for Demo!**