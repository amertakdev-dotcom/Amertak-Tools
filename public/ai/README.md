# អមតៈ - Amertak AI Assistant

## Changes Made

This refactored version of the AI Assistant features:

### 📁 File Structure
```
public/ai/
├── index.html          # Clean HTML with external script references
├── css/
│   └── styles.css      # Tailwind CSS + custom styles
├── js/
│   ├── config.js       # API configuration & chat history management
│   └── app.js          # Main application logic
└── README.md           # This file
```

### ✨ Key Features

#### 1. **Tailwind CSS Integration**
- Converted all inline styles to Tailwind CSS classes
- Custom CSS in separate `styles.css` file for glass morphism and animations
- Cleaner, more maintainable codebase

#### 2. **Separated Files**
- **config.js**: API configuration, model management, AI identity, and chat history storage
- **app.js**: UI logic, message handling, file management, and API interactions
- **styles.css**: All custom CSS including glass effects, animations, and Khmer support

#### 3. **Chat History Storage**
- Messages automatically saved to `localStorage`
- Recent chat context (last 10 messages) included in API requests for smart responses
- Maintains up to 50 messages in history
- History persists across browser sessions
- Easy to export chat history as JSON

#### 4. **Smart AI Behavior**
- AI doesn't mention creator by default - only mentions when explicitly asked
- Remembers recent chat context for smarter responses
- Maintains conversation thread awareness
- Chat history stored in `amertak_chat_history` localStorage key

#### 5. **Khmer Language Support**
- Responds in Khmer language (ខ្មែរ)
- Automatic translation of English queries to Khmer responses
- Proper font support with Poppins and custom styling

### 🔧 Configuration

The API configuration is in `js/config.js`:
```javascript
const GEMINI_API_KEY = "your_api_key_here";
```

Add your Google Gemini API key to enable the AI assistant.

### 💾 Chat History API

The `ChatHistory` class provides:
- `loadHistory()` - Load from localStorage
- `addMessage(content, role, timestamp)` - Add message to history
- `getHistory()` - Get all messages
- `getRecentContext(count)` - Get last N messages for API context
- `clearHistory()` - Clear all history
- `export()` - Export as JSON

### 🚀 Usage

1. Add your Google Gemini API key to `js/config.js` or `.env` file
2. Open `index.html` in a browser
3. Start chatting - history is saved automatically
4. Switch between Chat, Math, History, and Contact modes
5. Attach files with the attachment button

### 📝 Mode Prompts

Four modes available:
- **ជជែក (Chat)**: General conversation
- **គណិតវិទ្យា (Math)**: Mathematics problem solving
- **ប្រវត្តិវិទ្យា (History)**: Historical information
- **ទាក់ទង (Contact)**: Contact and support

Each mode has pre-filled prompt suggestions for quick access.

### 🎨 Design System

- **Glass Morphism**: Frosted glass effect with backdrop blur
- **Gradient Borders**: Animated RGB border around input
- **Smooth Animations**: Message slide-in effects and loading pulses
- **Responsive Design**: Works on mobile and desktop
- **Dark-Friendly**: Light theme with good contrast

### 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 🔒 Security Notes

- API keys should be stored securely (consider backend proxy)
- Chat history stored locally - not synced to servers
- No personal data collected beyond chat content

### 🛠️ Development

To modify the AI identity or system prompt:

```javascript
// In js/config.js
const AI_IDENTITY = {
    name: "អមតៈ - Amertak",
    getSystemPrompt: function(includeCreatorInfo = false) {
        // Customize here
    }
};
```

### 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 📄 License

This is part of the Amertak project. All rights reserved.

---

**Version**: 2.0 (Refactored with Tailwind CSS)  
**Last Updated**: 2026-07-02
