import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import "../styles/InterviewRoom.css"; // Reuse base styles
import "../styles/InterviewSummary.css"; // Summary specific styles

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface InterviewQuestion {
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
}

interface InterviewData {
  sessionId: string;
  type: string;
  questions: InterviewQuestion[];
  overallScore?: number;
  overallFeedback?: string;
  date: string;
}

export default function InterviewSummary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterviewSummary() {
      if (!sessionId) {
        setError("No interview session ID provided");
        setIsLoading(false);
        return;
      }

      try {
        // Get authentication session
        const session = await supabase.auth.getSession();

        // Prepare auth header
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (session.data.session) {
          headers[
            "Authorization"
          ] = `Bearer ${session.data.session.access_token}`;
        }

        // Fetch the interview summary data from API
        const response = await fetch(
          `${API_BASE_URL}/api/interview/summary?session_id=${sessionId}`,
          {
            method: "GET",
            headers,
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch interview summary: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Interview summary data:", data);

        // Process and format the data
        const formattedData: InterviewData = {
          sessionId: sessionId || "",
          type: "Interview", // Default type since it's not in the response
          questions: [],
          date: new Date().toLocaleString(), // Current date since timestamp is not provided
        };

        // Extract questions and answers directly from the response
        if (
          data.questions &&
          Array.isArray(data.questions) &&
          data.answers &&
          Array.isArray(data.answers)
        ) {
          // Map questions and answers to the expected format
          data.questions.forEach((question: string, index: number) => {
            formattedData.questions.push({
              question,
              answer: data.answers[index] || "No answer recorded",
            });
          });
        }

        // Add feedback to questions if available
        if (data.evaluations && Array.isArray(data.evaluations)) {
          data.evaluations.forEach(
            (
              evaluation: { feedback?: string; score?: number },
              index: number
            ) => {
              if (formattedData.questions[index] && evaluation) {
                formattedData.questions[index].feedback = evaluation.feedback;
                formattedData.questions[index].score = evaluation.score;
              }
            }
          );
        }

        // Add the coach tip if available
        if (data.coach_tip) {
          formattedData.overallFeedback = data.coach_tip;
        }

        setInterviewData(formattedData);
      } catch (err) {
        console.error("Error fetching interview summary:", err);
        setError(
          `Failed to load interview summary: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterviewSummary();
  }, [sessionId]);

  const handleStartNewInterview = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="interview-room">
          <div
            className="loading-indicator"
            style={{ margin: "50px auto", textAlign: "center" }}
          >
            <div className="loading-spinner"></div>
            <span>Loading interview summary...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !interviewData) {
    return (
      <>
        <Navbar />
        <div className="interview-room">
          <div
            className="error-box"
            style={{
              margin: "20px",
              padding: "20px",
              background: "#ffebee",
              border: "1px solid #ffcdd2",
              borderRadius: "4px",
            }}
          >
            <h3>Error</h3>
            <p>{error || "Failed to load interview summary"}</p>
            <button
              onClick={() => navigate("/")}
              className="control-button"
              style={{ marginTop: "20px" }}
            >
              Return Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="interview-room">
        <div className="interview-header">
          <h2>
            {interviewData.type} Interview Summary
            <span className="session-id">
              {" "}
              (Session: {sessionId?.substring(0, 8)})
            </span>
          </h2>
          <div className="interview-date">{interviewData.date}</div>
        </div>

        {interviewData.overallFeedback && (
          <div className="summary-overall-box">
            <h3>Coach Tip</h3>
            <div className="summary-feedback">
              <p>{interviewData.overallFeedback}</p>
            </div>
          </div>
        )}

        <div className="summary-questions-container">
          <h3>Questions & Answers</h3>

          {interviewData.questions.map((qa, index) => (
            <div key={index} className="summary-qa-box">
              <h4>Question {index + 1}:</h4>
              <p className="summary-question">{qa.question}</p>

              <h4>Your Answer:</h4>
              <p className="summary-answer">
                {qa.answer || "No answer recorded"}
              </p>

              {qa.feedback && (
                <div className="summary-feedback">
                  <h4>Feedback:</h4>
                  {qa.score !== undefined && (
                    <div className="summary-question-score">
                      Score: {qa.score}/5
                    </div>
                  )}
                  <p>{qa.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="summary-actions">
          <button
            onClick={handleStartNewInterview}
            className="control-button"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "#fff",
            }}
          >
            Start New Interview
          </button>
          <Link
            to="/interviews"
            className="control-button"
            style={{
              textDecoration: "none",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.16)",
              marginLeft: "10px",
            }}
          >
            View All Interviews
          </Link>
        </div>
      </div>
    </>
  );
}
