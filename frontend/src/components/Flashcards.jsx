import { useState, useRef } from "react";
import api from "../api/api";

function Flashcards({ transcript }) {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Swipe and Drag States
    const [dragOffset, setDragOffset] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
    const [isAnimating, setIsAnimating] = useState(false);
    
    const dragStartRef = useRef({ x: 0, time: 0 });
    const isDraggingRef = useRef(false);

    const generateFlashcards = async () => {
        if (!transcript) return alert("Please upload a lecture first!");
        setLoading(true);
        try {
            const res = await api.post("/flashcards", { text: transcript });
            setFlashcards(res.data.flashcards);
            api.post("/analytics/increment/flashcards_reviewed").catch(err => 
                console.warn("Analytics error ignored:", err)
            );
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (error) {
            console.error("Failed to generate flashcards", error);
        }
        setLoading(false);
    };

    const handleStart = (clientX) => {
        if (isAnimating) return;
        dragStartRef.current = { x: clientX, time: Date.now() };
        isDraggingRef.current = true;
        setDragOffset(0);
        setSwipeDirection(null);
    };

    const handleMove = (clientX) => {
        if (!isDraggingRef.current || isAnimating) return;
        const diffX = clientX - dragStartRef.current.x;
        setDragOffset(diffX);
        
        if (diffX > 50) {
            setSwipeDirection("right");
        } else if (diffX < -50) {
            setSwipeDirection("left");
        } else {
            setSwipeDirection(null);
        }
    };

    const handleEnd = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        
        const dragDuration = Date.now() - dragStartRef.current.time;
        const dragDist = Math.abs(dragOffset);
        
        // Click to flip vs drag/swipe threshold (8px, 250ms)
        if (dragDist < 8 && dragDuration < 250) {
            setIsFlipped(!isFlipped);
            setDragOffset(0);
            setSwipeDirection(null);
            return;
        }

        const threshold = 100; // swipe offset threshold
        if (dragOffset > threshold) {
            triggerSwipeOut("right");
        } else if (dragOffset < -threshold) {
            triggerSwipeOut("left");
        } else {
            // Snap back
            setIsAnimating(true);
            setDragOffset(0);
            setSwipeDirection(null);
            setTimeout(() => setIsAnimating(false), 200);
        }
    };

    const triggerSwipeOut = (dir) => {
        setIsAnimating(true);
        const finalOffset = dir === "right" ? 500 : -500;
        setDragOffset(finalOffset);
        
        setTimeout(() => {
            setIsFlipped(false);
            // Swiping either way goes to the next card in a loop!
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
            
            // Slide in the new card from the opposite side
            const incomingOffset = dir === "right" ? -500 : 500;
            setDragOffset(incomingOffset);
            setSwipeDirection(null);
            
            setTimeout(() => {
                setDragOffset(0);
                setTimeout(() => {
                    setIsAnimating(false);
                }, 200);
            }, 50);
        }, 200);
    };

    const nextCard = () => {
        triggerSwipeOut("right");
    };

    const prevCard = () => {
        setIsAnimating(true);
        setDragOffset(-500);
        setTimeout(() => {
            setIsFlipped(false);
            // Clicked Prev button -> Go backward in loop!
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
            setDragOffset(500);
            setTimeout(() => {
                setDragOffset(0);
                setTimeout(() => {
                    setIsAnimating(false);
                }, 200);
            }, 50);
        }, 200);
    };

    return (
        <div className="panel flashcards-panel">
            <h2>✨ AI Flashcards</h2>
            {flashcards.length === 0 ? (
                <button className="primary-btn" onClick={generateFlashcards} disabled={loading || !transcript}>
                    {loading ? "Generating Magic..." : "Generate Flashcards"}
                </button>
            ) : (
                <div className="flashcard-container">
                    <div className="flashcard-deck">
                        {/* Background Stack Card (Visual Decorator) */}
                        {flashcards.length > 1 && (
                            <div className="flashcard-stack-bg" style={{
                                transform: 'translateY(12px) scale(0.96) rotate(-2.5deg)',
                                opacity: 0.45,
                                zIndex: 1
                            }}>
                                <div className="flashcard-inner">
                                    <div className="flashcard-front">
                                        <div className="card-badge question">Next</div>
                                        <p>{flashcards[(currentIndex + 1) % flashcards.length].question}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interactive Foreground Card */}
                        <div 
                            className={`flashcard interactive ${isFlipped ? "flipped" : ""} ${swipeDirection ? `swiping-${swipeDirection}` : ""}`} 
                            style={{
                                transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`,
                                transition: isAnimating ? 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.2)' : 'none',
                                cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                                zIndex: 2
                            }}
                            onMouseDown={(e) => handleStart(e.clientX)}
                            onMouseMove={(e) => handleMove(e.clientX)}
                            onMouseUp={handleEnd}
                            onMouseLeave={handleEnd}
                            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                            onTouchEnd={handleEnd}
                        >
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <div className="card-badge question">Question</div>
                                    <p>{flashcards[currentIndex].question}</p>
                                    <span className="flip-hint">🖱️ Swipe left/right for next | Click to flip</span>
                                </div>
                                <div className="flashcard-back">
                                    <div className="card-badge answer">Answer</div>
                                    <p>{flashcards[currentIndex].answer}</p>
                                    <span className="flip-hint">Click anywhere to flip back</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flashcard-controls" style={{ zIndex: 5, marginTop: '0.5rem' }}>
                        <button className="icon-btn" onClick={prevCard}>◀ Prev</button>
                        <span>{currentIndex + 1} / {flashcards.length}</span>
                        <button className="icon-btn" onClick={nextCard}>Next ▶</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Flashcards;
