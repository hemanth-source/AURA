import UploadLecture from "../components/UploadLecture";

function Home({ summary, setSummary, setTranscript, setIsSpeaking, setHighlightData }) {

    const speakSummary = () => {
        if (!summary) return;
        
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        setTimeout(() => {
            // Strip markdown formatting for better speech output and display
            const cleanText = summary.replace(/[*_#`~>=-]/g, '');
            setHighlightData({ index: -1, length: 0, text: cleanText });
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Tweak voice settings for a better sound
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onboundary = (e) => {
                if (e.name === 'word') {
                    // Extract length of current word
                    const textFromIndex = cleanText.substring(e.charIndex);
                    const match = textFromIndex.match(/^[^\s]+/);
                    const length = match ? match[0].length : 1;
                    setHighlightData({ index: e.charIndex, length, text: cleanText });
                }
            };
            utterance.onend = () => {
                setIsSpeaking(false);
                setHighlightData({ index: -1, length: 0, text: cleanText });
            };
            utterance.onerror = (e) => {
                console.error("Speech synthesis error:", e);
                setIsSpeaking(false);
                setHighlightData({ index: -1, length: 0, text: cleanText });
            };
            
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    return (
        <div className="home-container">
            <div className="upload-wrapper">
                <UploadLecture setSummary={setSummary} setTranscript={setTranscript} />
                
                {summary && (
                    <div className="glass-box" style={{ marginTop: '1rem', textAlign: 'center', padding: '1rem' }}>
                        <button 
                            className="primary-btn" 
                            onClick={speakSummary} 
                            style={{ width: '100%', fontSize: '1.1rem' }}
                        >
                            ▶️ Sensei, read the summary!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;