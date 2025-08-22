import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/InterviewRoom.css";

import Navbar from '../components/Navbar'

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type =
    (queryParams.get("type") as "behavioral" | "technical") || "behavioral";

  // Handle ending the interview
  const handleEndInterview = () => {
    // Here you would typically send a request to your backend to end the interview session
    // For now, we'll just navigate back to the homepage
    navigate("/");
  };

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions] = useState<number>(3); // Set how many questions for the interview
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample behavioral interview questions wrapped in useMemo to avoid dependency array issues
  const behavioralQuestions = useMemo(
    () => [
      "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      "Describe a situation where you had to meet a tight deadline. What did you do?",
      "Give me an example of when you showed leadership qualities.",
      "Tell me about a time when you failed. How did you deal with it?",
      "Describe a situation where you had to solve a difficult problem. What did you do?",
    ],
    []
  );

  // Sample technical interview questions wrapped in useMemo to avoid dependency array issues
  const technicalQuestions = useMemo(
    () => [
      "What is the time complexity of quicksort in the worst case scenario?",
      "Explain the difference between a stack and a queue.",
      "How would you implement a linked list in JavaScript/TypeScript?",
      "What is the difference between an abstract class and an interface?",
      "Explain the concept of closure in JavaScript.",
    ],
    []
  );

  // Setup webcam feed when component mounts
  useEffect(() => {
    let videoStream: MediaStream | null = null;

    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        videoStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsConnected(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setIsConnected(false);
      }
    }

    setupWebcam();

    // Set initial question
    const questions =
      type === "behavioral" ? behavioralQuestions : technicalQuestions;
    setCurrentQuestion(questions[0]);
    setQuestionIndex(0);
    setIsLastQuestion(totalQuestions <= 1); // Check if this is the only question

    // Cleanup function to stop video stream when component unmounts
    return () => {
      if (videoStream) {
        const tracks = videoStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [type, behavioralQuestions, technicalQuestions, totalQuestions]);

  // Function to handle recording
  const toggleRecording = () => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);

    // Here you would typically start/stop actual recording
    // For now, just changing the state for UI purposes

    if (newRecordingState) {
      // If starting recording, keep current question
      // Reset hasRecorded when starting a new recording
      if (questionIndex === totalQuestions - 1) {
        // If this is the last question, we're recording it now
        setHasRecorded(false);
      }
    } else {
      // If stopping recording, mark that we've recorded at least once
      setHasRecorded(true);

      // Check if we just finished the last question
      if (questionIndex === totalQuestions - 1) {
        // We've completed the last question
        setIsLastQuestion(true);
      } else {
        // Move to the next question if we're not at the end
        const nextQuestionIndex = questionIndex + 1;

        // Prepare the next question when stopping recording
        const questions =
          type === "behavioral" ? behavioralQuestions : technicalQuestions;
        // To ensure we don't repeat questions, select based on the index
        // Use modulo in case we have fewer questions than totalQuestions
        const nextIndex = nextQuestionIndex % questions.length;
        setCurrentQuestion(questions[nextIndex]);
        setQuestionIndex(nextQuestionIndex);

        // Check if the next question will be the last one
        setIsLastQuestion(nextQuestionIndex === totalQuestions - 1);
      }
    }
  };

  return (
    <>
    <Navbar/>
    <div className="interview-room">
      <div className="interview-header">
        <h2>
          {type === "behavioral" ? "Behavioral" : "Technical"} Interview
          {sessionId && (
            <span className="session-id">
              {" "}
              (Session: {sessionId.substring(0, 8)})
            </span>
          )}
        </h2>
        <div className="interview-status">
          {isConnected ? (
            <span className="status-connected">Connected</span>
          ) : (
            <span className="status-disconnected">Disconnected</span>
          )}
        </div>
      </div>

      <div className="question-container">
        <div className="question-box">
          <h3>
            Question {questionIndex + 1} of {totalQuestions}:
          </h3>
          <p>{currentQuestion}</p>
        </div>
      </div>

      <div className="interview-content">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-feed"
          />

          {isConnected && (
            <div className="video-overlay">
              {!isRecording ? (
                // First question or just loaded the page
                (questionIndex === 0 && !hasRecorded) ||
                // Last question that hasn't been recorded yet
                (isLastQuestion &&
                  questionIndex === totalQuestions - 1 &&
                  !hasRecorded) ? (
                  <button
                    className="recording-button start-button"
                    onClick={toggleRecording}
                  >
                    Start Recording
                  </button>
                ) : (
                  <div className="instruction-overlay">
                    {hasRecorded ? "Ready for next question" : "Ready to start"}
                  </div>
                )
              ) : (
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  Recording Answer {questionIndex + 1} of {totalQuestions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="interview-controls">
        {isRecording ? (
          <button
            className="control-button stop-button"
            onClick={toggleRecording}
          >
            Stop Recording
          </button>
        ) : hasRecorded &&
          isLastQuestion &&
          questionIndex === totalQuestions - 1 ? (
          <button
            className="control-button end-button"
            onClick={handleEndInterview}
          >
            End Interview
          </button>
        ) : (
          hasRecorded &&
          !isRecording && (
            <button
              className="recording-button start-button"
              onClick={toggleRecording}
              style={{ marginTop: "10px" }}
            >
              {questionIndex < totalQuestions - 1
                ? "Next Question"
                : "Start Recording"}
            </button>
          )
        )}
      </div>
    </div>
    </>
  );
}
