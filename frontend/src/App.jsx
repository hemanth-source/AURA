import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Avatar from "./components/Avatar";

// Pages
import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChatPage from "./pages/ChatPage";

function App() {
    const [summary, setSummary] = useState("");
    const [transcript, setTranscript] = useState("");
    
    // Lift speaking state so Avatar can access it persistently
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [highlightData, setHighlightData] = useState({ index: -1, length: 0, text: "" });

    return (
        <BrowserRouter>
            <div className="app-container">
                {/* 3D Background Layer */}
                <div className="avatar-wrapper">
                    <Avatar isSpeaking={isSpeaking} summary={summary} highlightData={highlightData} />
                </div>

                {/* UI Overlay Layer */}
                <div className="ui-layer">
                    <Navbar />
                    <div className="ui-content">
                        <Routes>
                            <Route 
                                path="/" 
                                element={<Home summary={summary} setSummary={setSummary} setTranscript={setTranscript} setIsSpeaking={setIsSpeaking} setHighlightData={setHighlightData} />} 
                            />
                            <Route path="/quiz" element={<QuizPage transcript={transcript} />} />
                            <Route path="/flashcards" element={<FlashcardsPage transcript={transcript} />} />
                            <Route path="/progress" element={<AnalyticsPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;