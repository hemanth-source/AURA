import Quiz from "../components/Quiz";

function QuizPage({ transcript }) {
    return (
        <div className="home-container">
            <div className="upload-wrapper glass-box page-panel">
                <Quiz transcript={transcript} />
            </div>
        </div>
    );
}

export default QuizPage;
