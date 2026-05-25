import { useState, useEffect, useRef } from "react";
import API from "../api/api";

function ChatPanel() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    
    const messagesEndRef = useRef(null);

    // Load active session on mount
    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const startNewChat = () => {
        setSessionId(null);
        setMessages([]);
        setQuestion("");
    };

    const askQuestion = async () => {
        if (!question.trim()) return;
        const currentQuestion = question.trim();
        setQuestion("");
        setLoading(true);

        const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 1. Add User Message
        const userMsg = { sender: "user", text: currentQuestion, timestamp: timestampStr };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        try {
            const response = await API.post("/ask", { question: currentQuestion });
            const aiText = response.data.answer;
            
            // 2. Add AI Message
            const aiMsg = { sender: "aura", text: aiText, timestamp: timestampStr };
            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);

            // 3. Persist session to localStorage
            const storedSessions = JSON.parse(localStorage.getItem("aura_chat_sessions") || "[]");
            let activeSessionId = sessionId;
            
            if (!activeSessionId) {
                activeSessionId = Date.now().toString();
                setSessionId(activeSessionId);
                
                const truncatedTitle = currentQuestion.substring(0, 40) + (currentQuestion.length > 40 ? "..." : "");
                const newSession = {
                    id: activeSessionId,
                    title: truncatedTitle,
                    timestamp: new Date().toLocaleString(),
                    messages: finalMessages
                };
                localStorage.setItem("aura_chat_sessions", JSON.stringify([newSession, ...storedSessions]));
            } else {
                const updatedSessions = storedSessions.map(sess => {
                    if (sess.id === activeSessionId) {
                        return {
                            ...sess,
                            messages: finalMessages
                        };
                    }
                    return sess;
                });
                localStorage.setItem("aura_chat_sessions", JSON.stringify(updatedSessions));
            }
        } catch (e) {
            console.error(e);
            const errorMsg = { sender: "aura", text: "Failed to connect to AURA's server. Please try again.", timestamp: timestampStr };
            setMessages([...updatedMessages, errorMsg]);
        }
        setLoading(false);
    };

    return (
        <div className="panel chat-panel">
            <div className="chat-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>💬 Ask AURA</h2>
                {messages.length > 0 && (
                    <button className="secondary-btn" onClick={startNewChat} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        ➕ New Chat
                    </button>
                )}
            </div>
            
            <div className="chat-history scrollable-chat">
                {messages.length === 0 ? (
                    <div className="chat-placeholder">
                        <div className="placeholder-icon">🔮</div>
                        <p>Ask me anything about the lecture summary!</p>
                        <span className="placeholder-hint">Type below to start your conversation.</span>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`chat-bubble ${msg.sender}`}>
                            <div className="bubble-sender">{msg.sender === "user" ? "You" : "AURA"}</div>
                            <p>{msg.text}</p>
                            <span className="bubble-timestamp">{msg.timestamp}</span>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="chat-bubble aura loading-bubble">
                        <div className="bubble-sender">AURA</div>
                        <div className="typing-loader">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question..."
                    className="chat-input"
                    style={{ flexGrow: 1 }}
                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                    disabled={loading}
                />
                <button className="primary-btn" onClick={askQuestion} disabled={loading || !question.trim()}>
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
}

export default ChatPanel;