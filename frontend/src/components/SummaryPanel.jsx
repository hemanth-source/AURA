function SummaryPanel({ summary }) {
    return (
        <div className="panel summary-panel">
            <h2>📝 Lecture Summary</h2>
            <div className="summary-content">
                {summary ? <p>{summary}</p> : <p className="placeholder">Upload a lecture to see the summary here...</p>}
            </div>
        </div>
    );
}

export default SummaryPanel;