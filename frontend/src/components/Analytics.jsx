import { useState, useEffect } from "react";
import api from "../api/api";

function Analytics() {
    const [stats, setStats] = useState({
        total_lectures: 0,
        flashcards_reviewed: 0,
        quizzes_taken: 0
    });

    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get("/analytics");
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    };

    const loadChatSessions = () => {
        const sessions = JSON.parse(localStorage.getItem("aura_chat_sessions") || "[]");
        setChatSessions(sessions);
    };

    // Poll for updates every 5 seconds so it feels real-time
    useEffect(() => {
        fetchAnalytics();
        loadChatSessions();
        const interval = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(interval);
    }, []);

    const deleteSession = (sessionId, event) => {
        event.stopPropagation(); // prevent modal opening
        const confirmed = window.confirm("Are you sure you want to delete this chat history?");
        if (!confirmed) return;
        
        const updated = chatSessions.filter(sess => sess.id !== sessionId);
        localStorage.setItem("aura_chat_sessions", JSON.stringify(updated));
        setChatSessions(updated);
        if (selectedSession && selectedSession.id === sessionId) {
            setSelectedSession(null);
        }
    };

    return (
        <div className="panel analytics-panel" style={{ position: 'relative' }}>
            <h2>📈 Learning Progress</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{stats.total_lectures}</div>
                    <div className="stat-label">Lectures Uploaded</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📇</div>
                    <div className="stat-value">{stats.flashcards_reviewed}</div>
                    <div className="stat-label">Flashcard Decks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.quizzes_taken}</div>
                    <div className="stat-label">Quizzes Completed</div>
                </div>
            </div>

            {/* Previous Chat History Section */}
            <div className="chat-archives-section" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📜 Previous Chat History
                </h3>
                
                {chatSessions.length === 0 ? (
                    <div className="empty-history-box" style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed var(--panel-border)', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontSize: '2rem' }}>💬</span>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>No archived chats found. Start questioning AURA in the Chat page!</p>
                    </div>
                ) : (
                    <div className="archives-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {chatSessions.map((session) => (
                            <div 
                                key={session.id} 
                                className="archive-item glass-box" 
                                onClick={() => setSelectedSession(session)}
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '0.75rem 1rem', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s ease',
                                    borderRadius: '10px',
                                    border: '1px solid var(--panel-border)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden', marginRight: '1rem' }}>
                                    <span style={{ fontWeight: '600', color: '#f3f4f6', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '0.95rem' }}>
                                        {session.title || "Chat Session"}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        📅 {session.timestamp} • {session.messages.length} messages
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button 
                                        className="secondary-btn" 
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
                                    >
                                        🔍 View
                                    </button>
                                    <button 
                                        className="icon-btn delete-archive-btn"
                                        onClick={(e) => deleteSession(session.id, e)}
                                        style={{ color: '#ef4444', fontSize: '1rem', padding: '0.25rem' }}
                                        title="Delete chat session"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Session Details Modal Overlay */}
            {selectedSession && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setSelectedSession(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.25s ease'
                    }}
                >
                    <div 
                        className="modal-content glass-box"
                        onClick={(e) => e.stopPropagation()} // prevent overlay click closing modal
                        style={{
                            width: '90%',
                            maxWidth: '550px',
                            maxHeight: '80vh',
                            background: 'var(--panel-bg)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            animation: 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '85%' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f3f4f6', wordBreak: 'break-word' }}>
                                    {selectedSession.title}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    📅 Created on {selectedSession.timestamp}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedSession(null)} 
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#f3f4f6', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Transcript Body */}
                        <div className="modal-transcript-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '200px', maxHeight: '45vh' }}>
                            {selectedSession.messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    style={{
                                        alignSelf: msg.sender === "user" ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        background: msg.sender === "user" ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))' : 'rgba(255, 255, 255, 0.05)',
                                        border: msg.sender === "user" ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.sender === "user" ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: msg.sender === "user" ? '#a78bfa' : '#60a5fa', letterSpacing: '0.5px' }}>
                                        {msg.sender === "user" ? "You" : "AURA"}
                                    </span>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#f3f4f6', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </p>
                                    <span style={{ fontSize: '0.65rem', alignSelf: 'flex-end', opacity: 0.5, color: '#f3f4f6' }}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.75rem', marginTop: '1rem', textAlign: 'right' }}>
                            <button 
                                className="primary-btn" 
                                onClick={() => setSelectedSession(null)}
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                            >
                                Close Transcript
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analytics;
