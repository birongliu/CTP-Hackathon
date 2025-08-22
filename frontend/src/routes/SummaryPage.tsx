import { useState, useEffect } from "react";
import { useParams, useNavigate, redirect } from "react-router-dom";
import {
  getInterviewSummary,
  getTechnicalAudio,
} from "../services/interviewService";
import "../styles/InterviewRoom.css";

interface Evaluation {
  score: number;
  feedback: string;
}

export default function SummaryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [coachTip, setCoachTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setIsLoading(false);
      return;
    }

    async function fetchSummary() {
      try {
        // Get interview summary

      if (!sessionId) {
        return redirect("/");
      }

        const summary = await getInterviewSummary(sessionId);
        setQuestions(summary.questions);
        setAnswers(summary.answers);
        setEvaluations(summary.evaluations);
        setCoachTip(summary.coach_tip);

        // Try to get technical audio recordings if available
        try {
          const audioResponse = await getTechnicalAudio(sessionId);
          if (audioResponse.audio_files) {
            setAudioFiles(audioResponse.audio_files);
          }
        } catch (e) {
          // Not a technical interview or no audio available - ignore
          console.log("No technical audio available");
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError("Failed to load interview summary");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, [sessionId]);

  const getTotalScore = () => {
    if (!evaluations.length) return 0;

    const validScores = evaluations
      .filter((evals) => evals.score !== null)
      .map((evals) => evals.score);

    if (!validScores.length) return 0;

    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return (sum / validScores.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#22c55e"; // Green
    if (score >= 6) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="interview-room">
        <div className="interview-header">
          <h2>Interview Summary</h2>
        </div>
        <div
          className="summary-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading summary...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-room">
        <div className="interview-header">
          <h2>Interview Summary</h2>
        </div>
        <div
          className="summary-container"
          style={{ padding: "20px", textAlign: "center" }}
        >
          <h3>Error</h3>
          <p>{error}</p>
          <button className="control-button" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-room">
      <div className="interview-header">
        <h2>
          Interview Summary
          {sessionId && (
            <span className="session-id">
              {" "}
              (Session: {sessionId.substring(0, 8)})
            </span>
          )}
        </h2>
        <div className="score-display">
          Overall:{" "}
          <span style={{ color: getScoreColor(parseFloat(getTotalScore())) }}>
            {getTotalScore()}/10
          </span>
        </div>
      </div>

      <div
        className="summary-container"
        style={{
          padding: "20px",
          overflowY: "auto",
          height: "calc(100vh - 120px)",
        }}
      >
        <div
          className="coach-tip"
          style={{
            padding: "15px",
            backgroundColor: "rgba(30, 58, 138, 0.2)",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Coach Tip</h3>
          <p style={{ margin: 0 }}>{coachTip}</p>
        </div>

        {questions.map((question, index) => (
          <div
            key={index}
            className="qa-pair"
            style={{
              marginBottom: "30px",
              backgroundColor: "rgba(30, 41, 59, 0.3)",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Question {index + 1}</h3>
            <p style={{ fontWeight: "bold" }}>{question}</p>

            <h4>Your Answer:</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {answers[index] || "No answer recorded"}
            </p>

            {evaluations[index] && evaluations[index].score !== null && (
              <div
                className="evaluation"
                style={{
                  padding: "15px",
                  backgroundColor: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "6px",
                  marginTop: "15px",
                  borderLeft: `4px solid ${getScoreColor(
                    evaluations[index].score
                  )}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Evaluation</h4>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: getScoreColor(evaluations[index].score),
                    }}
                  >
                    {evaluations[index].score}/10
                  </span>
                </div>
                <p style={{ margin: 0 }}>{evaluations[index].feedback}</p>
              </div>
            )}

            {/* Show audio player for technical interviews if available */}
            {audioFiles.length > 0 &&
              audioFiles.find((file) =>
                file.filename.startsWith(`q${index + 1}_`)
              ) && (
                <div className="audio-player" style={{ marginTop: "15px" }}>
                  <h4>Recording:</h4>
                  <audio
                    controls
                    src={`/api/audio/${sessionId}/${
                      audioFiles.find((file) =>
                        file.filename.startsWith(`q${index + 1}_`)
                      ).filename
                    }`}
                  />
                </div>
              )}
          </div>
        ))}

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            marginBottom: "30px",
          }}
        >
          <button className="control-button" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
