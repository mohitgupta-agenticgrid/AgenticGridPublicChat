// Chat application with ElevenLabs integration
class ChatApp {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupEventListeners();
        this.setupSpeechRecognition();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        // this.statusText = document.querySelector('.status-text');
        this.thankYouScreen = document.getElementById('thankYouScreen');
        this.startNewChatBtn = document.getElementById('startNewChatBtn');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        // this.statusDot = document.getElementById('statusDot');
        // this.themeSwitcher = document.getElementById('themeSwitcher');
        // this.endChatBtn = document.getElementById('endChatBtn');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.greeting = document.getElementById('greeting');
        this.profilePic = document.getElementById('profilePic');
        // this.addBtn = document.getElementById('addBtn');
        // this.addOptionsPopup = document.getElementById('addOptionsPopup');
    }

    initializeState() {
        this.isRecording = false;
        this.websocket = null;
        this.connectionState = 'disconnected'; // disconnected, connecting, connected
        this.chatStarted = false;
        // this.avatarUrl = 'src/assets/Jordan.png'; // Default avatar
        this.greetings = [
            "What can I help with?",
            "What's on your mind today?",
            "Where should we begin?",
            "Ready when you are.",
            "What's on the agenda today?",
            "What are you working on?",
            "How can I help today?",
            "What would you like to do?",
            "Need a hand with something?",
            "What's next on your list?",
            "Shall we get started?"
        ];
        
        // --- DEMO MODE ---
        this.isDemoMode = false; 
        
        // ElevenLabs Configuration
        this.config = {
            apiKey: 'sk_5c628e4d89f6eb497c3ae1905da4bb52eca53055b01baf5c',
            agentId: 'agent_6901k4w82bgzf9hrm1fd3xwft4vn',
            wsUrl: 'wss://api.elevenlabs.io/v1/convai/conversation'
        };

        const urlParams = new URLSearchParams(window.location.search);
        const agentIdFromUrl = urlParams.get('agentid');
        const avatarFromUrl = urlParams.get('avatar');

        if (agentIdFromUrl) {
            this.config.agentId = agentIdFromUrl;
            console.log("Agent ID from URL:", agentIdFromUrl);
        } else {
            console.log("No Agent ID in URL, using default.");
        }

        if (avatarFromUrl) {
            const decodedAvatarUrl = decodeURIComponent(avatarFromUrl);
            this.profilePic.src = decodedAvatarUrl;
            this.avatarUrl = decodedAvatarUrl;
        }

        if (this.isDemoMode) {
            this.updateStatus('Demo Mode');
            this.setInputEnabled(true);
            // this.statusDot.classList.add('active');
        } else {
            this.setInputEnabled(false);
            this.initializeWebSocket();
        }
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.messageInput.addEventListener('input', () => this.autoResizeInput());
        this.voiceButton.addEventListener('click', () => this.toggleVoiceRecording());
        this.startNewChatBtn.addEventListener('click', () => window.location.reload());
        // this.themeSwitcher.addEventListener('click', () => this.toggleTheme());
        // this.endChatBtn.addEventListener('click', () => this.endChat());
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        /*
        this.addBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.addOptionsPopup.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!this.addBtn.contains(event.target) && !this.addOptionsPopup.contains(event.target)) {
                this.addOptionsPopup.classList.remove('show');
            }
        });
        */

        this.loadTheme();
    }

    setRandomGreeting() {
        const randomIndex = Math.floor(Math.random() * this.greetings.length);
        this.greeting.textContent = this.greetings[randomIndex];
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('chatTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('open');
        const tooltip = this.sidebarToggle.getAttribute('data-tooltip');
        if (this.sidebar.classList.contains('open')) {
            this.sidebarToggle.setAttribute('data-tooltip', 'Close sidebar');
        } else {
            this.sidebarToggle.setAttribute('data-tooltip', 'Open sidebar');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        this.themeSwitcher.classList.add('toggled');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('chatTheme', 'dark');
        } else {
            localStorage.setItem('chatTheme', 'light');
        }
        setTimeout(() => this.themeSwitcher.classList.remove('toggled'), 500);
    }

    endChat() {
        const goodbyeMessage = "It was great chatting with you! This session will now end. Have a wonderful day! 👋";
        this.showMessage(goodbyeMessage, 'ai');
        this.setInputEnabled(false);

        const chatContainer = document.querySelector('.chat-container');
        chatContainer.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        chatContainer.style.transform = 'scale(0.8) translateY(50px)';
        chatContainer.style.opacity = '0';

        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'end_of_conversation' }));
            this.websocket.close();
        }

        setTimeout(() => {
            this.thankYouScreen.style.display = 'flex';
        }, 500);
    }

    initializeWebSocket() {
        if (this.connectionState === 'connecting' || this.connectionState === 'connected') return;

        this.connectionState = 'connecting';
        this.updateStatus('Connecting to AI...');
        // this.statusDot.classList.remove('active');
        const wsUrl = `${this.config.wsUrl}?agent_id=${this.config.agentId}&xi_api_key=${this.config.apiKey}`;
        
        try {
            this.websocket = new WebSocket(wsUrl);
            this.websocket.onopen = () => {
                this.connectionState = 'connected';
                this.updateStatus('Ready to chat');
                this.setInputEnabled(true);
                // this.statusDot.classList.add('active');
                const initMessage = {
                    type: 'conversation_initiation',
                    conversation_config: { text_only: true, voice: null }
                };
                this.websocket.send(JSON.stringify(initMessage));
            };
            this.websocket.onmessage = (event) => this.handleWebSocketMessage(event.data);
            this.websocket.onclose = () => {
                this.connectionState = 'disconnected';
                this.updateStatus('Disconnected');
                // this.statusDot.classList.remove('active');
                // setTimeout(() => {
                //     if (this.connectionState === 'disconnected') this.initializeWebSocket();
                // }, 3000);
            };
            this.websocket.onerror = () => {
                this.connectionState = 'disconnected';
                this.updateStatus('Connection error');
                // this.statusDot.classList.remove('active');
                this.showMessage('Connection to AI failed. Please check your credentials and try refreshing the page.', 'ai');
            };
        } catch (error) {
            this.connectionState = 'disconnected';
            this.updateStatus('Connection failed');
            // this.statusDot.classList.remove('active');
            this.showMessage('Failed to connect to AI. Please check your internet connection.', 'ai');
        }
    }

    handleWebSocketMessage(data) {
        try {
            const message = JSON.parse(data);
            this.hideTypingIndicator();
            if (message.type === 'audio') return;
            const responseText = message.agent_response_event?.agent_response || message.text || message.agent_response;
            if (responseText) this.showMessage(responseText, 'ai');
        } catch (error) {
            if (typeof data === 'string' && data.trim()) {
                this.hideTypingIndicator();
                this.showMessage(data.trim(), 'ai');
            }
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceButton.classList.add('recording');
                this.updateStatus('Listening...');
            };
            this.recognition.onresult = (event) => {
                this.messageInput.value = event.results[0][0].transcript;
                this.messageInput.dispatchEvent(new Event('input'));
            };
            this.recognition.onend = () => {
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
                this.updateStatus('Ready to chat');
            };
            this.recognition.onerror = () => {
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
                this.updateStatus('Voice recognition error');
                setTimeout(() => this.updateStatus('Ready to chat'), 2000);
            };
        }
    }

    toggleVoiceRecording() {
        if (!this.recognition) return;
        this.isRecording ? this.recognition.stop() : this.recognition.start();
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = `${Math.min(this.messageInput.scrollHeight, 120)}px`;
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        if (!this.chatStarted) {
            this.welcomeScreen.style.display = 'none';
            this.chatMessages.style.display = 'block';
            this.chatStarted = true;
        }
        
        this.showMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeInput();
        this.showTypingIndicator();

        if (this.isDemoMode) {
            this.handleDemoMessage(message);
            return;
        }

        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            this.initializeWebSocket();
            return;
        }

        try {
            this.websocket.send(JSON.stringify({ text: message, type: 'user_message' }));
        } catch (error) {
            this.hideTypingIndicator();
            this.showMessage('Failed to send message.', 'ai');
        }
    }

    handleDemoMessage(userMessage) {
        const responses = [
            "This is a simulated response for UI testing purposes. Everything looks great!",
            "In demo mode, I can't connect to the real agent, but the UI is working perfectly.",
            "Here's another example of how an AI message appears. The bubbles and animations are smooth.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setTimeout(() => {
            this.hideTypingIndicator();
            this.showMessage(randomResponse, 'ai');
        }, 1200);
    }

    showMessage(text, sender) {
        const messageRow = document.createElement('div');
        messageRow.className = `message-row ${sender}-message-row`;

        if (sender === 'ai') {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'chat-avatar';
            avatarDiv.innerHTML = `<img src="${this.avatarUrl}" alt="AI Avatar">`;
            messageRow.appendChild(avatarDiv);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
        
        messageRow.appendChild(messageDiv);
        this.chatMessages.appendChild(messageRow);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingRow = document.createElement('div');
        typingRow.className = 'message-row ai-message-row';
        typingRow.id = 'typingIndicatorRow';
        typingRow.innerHTML = `
            <div class="chat-avatar"><img src="${this.avatarUrl}" alt="AI Avatar"></div>
            <div class="message-bubble ai-message typing">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        this.chatMessages.appendChild(typingRow);
        this.updateStatus('AI is thinking...');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingRow = document.getElementById('typingIndicatorRow');
        if (typingRow) typingRow.remove();
        this.updateStatus(this.isDemoMode ? 'Demo Mode' : 'Ready to chat');
    }

    setInputEnabled(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        this.voiceButton.disabled = !enabled;
        this.sendButton.style.opacity = enabled ? '1' : '0.5';
        this.voiceButton.style.opacity = enabled ? '1' : '0.5';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    updateStatus(text) {
        // This function is now empty to prevent status text from appearing.
    }

    showConfigurationMessage() {
        this.updateStatus('Configuration needed');
        const configMessage = `
            <div class="message-row ai-message-row">
                <div class="message-bubble ai-message">
                    <div class="message-content">
                        <p>🔧 <strong>Configuration Required</strong></p>
                        <p>Update the <code>config</code> object in <code>script.js</code> with your ElevenLabs credentials.</p>
                    </div>
                </div>
            </div>`;
        this.chatMessages.innerHTML = configMessage;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new ChatApp();
    app.setRandomGreeting();
    console.log("Current URL:", window.location.href);
    console.log("Using Agent ID:", app.config.agentId);
    console.log("Using Avatar:", app.profilePic.src);
});
