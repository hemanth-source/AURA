import { useState, useRef } from "react";
import API from "../api/api";

function UploadLecture({ setSummary, setTranscript }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            chunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            let options = { mimeType: "audio/webm" };
            let recorder;
            try {
                recorder = new MediaRecorder(stream, options);
            } catch (e) {
                // Fallback for Safari/iOS
                recorder = new MediaRecorder(stream);
            }

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                const ext = recorder.mimeType && recorder.mimeType.includes("webm") ? "webm" : "wav";
                const fileObj = new File([blob], `live_recording.${ext}`, { type: blob.type });
                setFile(fileObj);

                // Release microphone tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start(250); // get chunks every 250ms
            setIsRecording(true);
            setRecordingDuration(0);
            setAudioUrl(null);
            setFile(null);

            timerIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access error:", err);
            alert("Could not access microphone. Please ensure microphone permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setFile(null);
        setAudioUrl(null);
        setRecordingDuration(0);
        chunksRef.current = [];
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const [errorMsg, setErrorMsg] = useState("");

    const uploadLecture = async () => {
        if (!file) return alert("Please select a file or record audio first");
        setLoading(true);
        setErrorMsg("");
        
        const formData = new FormData();
        // Ensure file is appended with proper filename
        formData.append("file", file, file.name || "live_recording.webm");

        try {
            console.log("Starting upload of:", file.name, "Type:", file.type, "Size:", file.size);
            const response = await API.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log("Upload success! Response:", response.data);
            
            setSummary(response.data.summary);
            setTranscript(response.data.transcript);
            
            // Background track analytics
            API.post("/analytics/increment/total_lectures").catch(err => 
                console.warn("Analytics error ignored:", err)
            );
        } catch (error) {
            console.error("Upload failed detailed error:", error);
            let msg = error.message || "Unknown error occurred during upload.";
            if (error.response) {
                msg = `Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                msg = "Network Error: No response received from server. Check that backend is running.";
            }
            setErrorMsg(msg);
        }
        setLoading(false);
    };

    const clearSelection = () => {
        setFile(null);
        setAudioUrl(null);
        setRecordingDuration(0);
    };

    return (
        <div className="upload-panel glass-box">
            <div className="upload-text">
                <h3>🎙️ Lecture Input System</h3>
                <p>Record a live lecture in real-time or upload an existing audio file to transcribe, summarize, and study.</p>
            </div>

            {isRecording ? (
                <div className="recording-panel">
                    <div className="recording-status">
                        <span className="recording-pulse"></span>
                        <span className="recording-time">Recording: {formatTime(recordingDuration)}</span>
                    </div>
                    <div className="recording-controls">
                        <button className="primary-btn stop-btn" onClick={stopRecording}>
                            ⏹️ Stop
                        </button>
                        <button className="secondary-btn" onClick={cancelRecording}>
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="upload-controls-wrapper">
                    {!file ? (
                        <div className="upload-options">
                            <div className="upload-file-option">
                                <input
                                    type="file"
                                    className="file-input"
                                    accept="audio/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </div>
                            <div className="or-divider">OR</div>
                            <button className="primary-btn mic-record-btn" onClick={startRecording}>
                                🎙️ Record Live
                            </button>
                        </div>
                    ) : (
                        <div className="selected-item-panel">
                            <div className="selected-info">
                                <span className="file-icon">🎵</span>
                                <span className="file-name">
                                    {file.name === "live_recording.webm" || file.name === "live_recording.wav"
                                        ? `Live Recording (${formatTime(recordingDuration)})`
                                        : file.name}
                                </span>
                                <button className="clear-btn" onClick={clearSelection}>❌</button>
                            </div>
                            {audioUrl && (
                                <div className="preview-container">
                                    <audio src={audioUrl} controls className="audio-preview" />
                                </div>
                            )}
                            <button className="primary-btn upload-submit-btn" onClick={uploadLecture} disabled={loading}>
                                {loading ? "Processing Lecture..." : "✨ Transcribe & Summarize"}
                            </button>
                            {errorMsg && (
                                <div className="error-message-box" style={{
                                    color: '#f87171',
                                    fontSize: '0.85rem',
                                    marginTop: '0.75rem',
                                    textAlign: 'left',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    lineHeight: '1.4'
                                }}>
                                    ⚠️ <strong>Upload Error:</strong> {errorMsg}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadLecture;