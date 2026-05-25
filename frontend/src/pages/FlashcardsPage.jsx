import Flashcards from "../components/Flashcards";

function FlashcardsPage({ transcript }) {
    return (
        <div className="home-container">
            <div className="upload-wrapper glass-box page-panel">
                <Flashcards transcript={transcript} />
            </div>
        </div>
    );
}

export default FlashcardsPage;
