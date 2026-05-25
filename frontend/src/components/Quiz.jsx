import { useState } from "react";
import api from "../api/api";

function Quiz({ transcript }) {
    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const generateQuiz = async () => {
        if (!transcript) return alert("Please upload a lecture first!");
        setLoading(true);
        try {
            const res = await api.post("/quiz", { text: transcript });
            setQuizData(res.data.quiz);
            api.post("/analytics/increment/quizzes_taken");
            setSubmitted(false);
            setUserAnswers({});
        } catch (error) {
            console.error("Failed to generate quiz", error);
        }
        setLoading(false);
    };

    const handleSelect = (qIndex, option) => {
        if (submitted) return;
        setUserAnswers({ ...userAnswers, [qIndex]: option });
    };

    const submitQuiz = () => {
        setSubmitted(true);
    };

    const calculateScore = () => {
        let score = 0;
        quizData.forEach((q, i) => {
            if (userAnswers[i] === q.answer) score++;
        });
        return score;
    };

    return (
        <div className="panel quiz-panel">
            <h2>🧠 Knowledge Check</h2>
            {quizData.length === 0 ? (
                <button className="primary-btn" onClick={generateQuiz} disabled={loading || !transcript}>
                    {loading ? "Crafting Quiz..." : "Generate Quiz"}
                </button>
            ) : (
                <div className="quiz-container">
                    {quizData.map((q, qIndex) => (
                        <div key={qIndex} className="quiz-question">
                            <h3>{qIndex + 1}. {q.question}</h3>
                            <div className="quiz-options">
                                {q.options.map((opt, oIndex) => {
                                    let className = "quiz-option";
                                    if (userAnswers[qIndex] === opt) className += " selected";
                                    if (submitted) {
                                        if (opt === q.answer) className += " correct";
                                        else if (userAnswers[qIndex] === opt) className += " incorrect";
                                    }
                                    return (
                                        <button 
                                            key={oIndex} 
                                            className={className} 
                                            onClick={() => handleSelect(qIndex, opt)}
                                            disabled={submitted}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {submitted ? (
                        <div className="quiz-results fade-in">
                            <h3>Score: {calculateScore()} / {quizData.length}</h3>
                            <button className="secondary-btn" onClick={generateQuiz}>Try Another</button>
                        </div>
                    ) : (
                        <button className="primary-btn submit-quiz-btn" onClick={submitQuiz} disabled={Object.keys(userAnswers).length !== quizData.length}>
                            Submit Answers
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Quiz;
