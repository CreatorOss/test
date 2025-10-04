// Enhanced Symbol Dictionary for Multi-AI Sendec System
module.exports = {
  // Core UI Components
  "⟐": [
    {type: "component", name: "header", priority: "high", aiRole: "coordinator"},
    {type: "component", name: "titleBar", priority: "medium", aiRole: "interpreter"},
    {type: "component", name: "navigationBar", priority: "low", aiRole: "guard"}
  ],
  "⧈": [
    {type: "component", name: "chatBox", priority: "critical", aiRole: "coordinator"},
    {type: "component", name: "messageArea", priority: "high", aiRole: "interpreter"},
    {type: "component", name: "conversationPanel", priority: "medium", aiRole: "guard"}
  ],
  "◈": [
    {type: "action", name: "startRTC", priority: "critical", aiRole: "coordinator"},
    {type: "action", name: "initializeCall", priority: "high", aiRole: "guard"},
    {type: "action", name: "connectPeer", priority: "medium", aiRole: "interpreter"}
  ],
  "⟡": [
    {type: "control", name: "priority", priority: "high", aiRole: "coordinator"},
    {type: "control", name: "urgency", priority: "medium", aiRole: "guard"},
    {type: "control", name: "importance", priority: "low", aiRole: "interpreter"}
  ],
  
  // Advanced Components
  "✶": [
    {type: "component", name: "usersList", priority: "medium", aiRole: "coordinator"},
    {type: "component", name: "participantGrid", priority: "high", aiRole: "interpreter"},
    {type: "component", name: "memberPanel", priority: "low", aiRole: "guard"}
  ],
  "✹": [
    {type: "component", name: "controls", priority: "high", aiRole: "guard"},
    {type: "component", name: "toolbar", priority: "medium", aiRole: "coordinator"},
    {type: "component", name: "actionPanel", priority: "low", aiRole: "interpreter"}
  ],
  "✺": [
    {type: "meta", name: "translate", priority: "medium", aiRole: "interpreter"},
    {type: "meta", name: "localize", priority: "low", aiRole: "coordinator"},
    {type: "meta", name: "internationalize", priority: "high", aiRole: "guard"}
  ],
  "✻": [
    {type: "meta", name: "record", priority: "critical", aiRole: "guard"},
    {type: "meta", name: "capture", priority: "high", aiRole: "coordinator"},
    {type: "meta", name: "log", priority: "medium", aiRole: "interpreter"}
  ],
  "✼": [
    {type: "component", name: "fileShare", priority: "high", aiRole: "coordinator"},
    {type: "component", name: "documentExchange", priority: "medium", aiRole: "interpreter"},
    {type: "component", name: "assetTransfer", priority: "low", aiRole: "guard"}
  ],
  "✽": [
    {type: "action", name: "leaveRoom", priority: "medium", aiRole: "guard"},
    {type: "action", name: "exitSession", priority: "high", aiRole: "coordinator"},
    {type: "action", name: "disconnect", priority: "critical", aiRole: "interpreter"}
  ],
  "✾": [
    {type: "control", name: "setTheme", priority: "low", aiRole: "interpreter"},
    {type: "control", name: "changeAppearance", priority: "medium", aiRole: "coordinator"},
    {type: "control", name: "customizeUI", priority: "high", aiRole: "guard"}
  ],
  "✿": [
    {type: "component", name: "notification", priority: "high", aiRole: "guard"},
    {type: "component", name: "alert", priority: "critical", aiRole: "coordinator"},
    {type: "component", name: "toast", priority: "medium", aiRole: "interpreter"}
  ],
  "❂": [
    {type: "meta", name: "presence", priority: "medium", aiRole: "coordinator"},
    {type: "meta", name: "availability", priority: "high", aiRole: "guard"},
    {type: "meta", name: "status", priority: "low", aiRole: "interpreter"}
  ],
  "❃": [
    {type: "component", name: "pin", priority: "medium", aiRole: "interpreter"},
    {type: "component", name: "bookmark", priority: "low", aiRole: "coordinator"},
    {type: "component", name: "favorite", priority: "high", aiRole: "guard"}
  ],
  "❄": [
    {type: "action", name: "toggleMute", priority: "high", aiRole: "guard"},
    {type: "action", name: "silenceAudio", priority: "critical", aiRole: "coordinator"},
    {type: "action", name: "muteParticipant", priority: "medium", aiRole: "interpreter"}
  ],
  "❅": [
    {type: "control", name: "setQuality", priority: "medium", aiRole: "interpreter"},
    {type: "control", name: "adjustResolution", priority: "high", aiRole: "coordinator"},
    {type: "control", name: "optimizePerformance", priority: "low", aiRole: "guard"}
  ],
  
  // Security & AI Specific Symbols
  "🔒": [
    {type: "security", name: "encrypt", priority: "critical", aiRole: "guard"},
    {type: "security", name: "secure", priority: "high", aiRole: "coordinator"},
    {type: "security", name: "protect", priority: "medium", aiRole: "interpreter"}
  ],
  "🤖": [
    {type: "ai", name: "aiAssistant", priority: "high", aiRole: "coordinator"},
    {type: "ai", name: "botHelper", priority: "medium", aiRole: "interpreter"},
    {type: "ai", name: "intelligentAgent", priority: "critical", aiRole: "guard"}
  ],
  "⚡": [
    {type: "action", name: "quickAction", priority: "high", aiRole: "guard"},
    {type: "action", name: "fastExecute", priority: "critical", aiRole: "coordinator"},
    {type: "action", name: "instantTrigger", priority: "medium", aiRole: "interpreter"}
  ],
  "🔥": [
    {type: "emergency", name: "selfDestruct", priority: "critical", aiRole: "guard"},
    {type: "emergency", name: "emergencyShutdown", priority: "critical", aiRole: "coordinator"},
    {type: "emergency", name: "systemPurge", priority: "critical", aiRole: "interpreter"}
  ]
};