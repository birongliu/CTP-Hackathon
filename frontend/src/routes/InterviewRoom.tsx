import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/InterviewRoom.css";
import {
  startInterview,
  submitAudioAnswer,
} from "../services/interviewService";

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type =
    (queryParams.get("type") as "behavioral" | "technical") || "behavioral";

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions] = useState<number>(3); // Set how many questions for the interview
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackReviewed, setFeedbackReviewed] = useState<boolean>(false);
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(
    sessionId || null
  );
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  
  // Handle ending the interview
  const handleEndInterview = () => {
    // Navigate to summary page
    navigate(`/summary/${sessionId}`);
  };

  // Use a ref to keep track of audio chunks to avoid closure issues
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Start the interview session or get the first question
  useEffect(() => {
    let isMounted = true;

    async function initializeInterview() {
      if (!interviewSessionId) {
        try {
          setIsLoading(true);
          const response = await startInterview(type, totalQuestions);
          if (isMounted) {
            setInterviewSessionId(response.session_id);
            setCurrentQuestion(response.question);
            setQuestionIndex(0);
            setIsLastQuestion(totalQuestions <= 1);
          }
        } catch (error) {
          console.error("Error starting interview:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        // Use the provided session ID and set default questions until connected to backend
        const questions =
          type === "behavioral" ? behavioralQuestions : technicalQuestions;
        setCurrentQuestion(questions[0]);
        setQuestionIndex(0);
        setIsLastQuestion(totalQuestions <= 1);
      }
    }

    initializeInterview();

    return () => {
      isMounted = false;
    };
  }, [
    interviewSessionId,
    totalQuestions,
    type,
    behavioralQuestions,
    technicalQuestions,
  ]);

  // Setup webcam and audio recording when component mounts
  useEffect(() => {
    let isMounted = true;

    async function setupMediaDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
        }

        // Initialize media recorder for audio
        if (isMounted) {
          const audioStream = new MediaStream(stream.getAudioTracks());

          // Configure MediaRecorder with better options for compatibility
          // Check which MIME types are supported
          const mimeTypes = [
            "audio/webm",
            "audio/webm;codecs=opus",
            "audio/ogg;codecs=opus",
            "audio/mp4",
          ];

          const supportedType =
            mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
          console.log(`Using MIME type: ${supportedType || "default"}`);

          const recorder = new MediaRecorder(audioStream, {
            mimeType: supportedType,
            audioBitsPerSecond: 128000, // Higher quality audio
          });

          // Request data every 1 second for more reliable recordings
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              console.log(`Audio chunk received: ${event.data.size} bytes`);
              // Update the ref
              audioChunksRef.current = [...audioChunksRef.current, event.data];
            }
          };

          recorder.onstop = async () => {
            // Use the ref for reliable access to the chunks
            const chunks = audioChunksRef.current;
            console.log(
              `Recording stopped, processing ${chunks.length} chunks`
            );

            if (chunks.length === 0) {
              console.error("No audio data recorded");
              setIsLoading(false); // Reset loading state if no audio chunks
              return;
            }

            // Create audio blob with proper MIME type
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            console.log(
              `Created audio blob: ${audioBlob.size} bytes, from ${chunks.length} chunks`
            );

            // Debug: log each chunk size
            chunks.forEach((chunk, index) => {
              console.log(`Chunk ${index}: ${chunk.size} bytes`);
            });

            // Reset chunks for next recording
            audioChunksRef.current = [];

            if (audioBlob.size === 0) {
              console.error("Empty audio blob created");
              setIsLoading(false); // Reset loading state if empty blob
              return;
            }

            if (interviewSessionId) {
              try {
                // Note: loading state is already set in toggleRecording
                console.log(
                  `Submitting answer for question ${questionIndex + 1}`
                );
                const response = await submitAudioAnswer(
                  interviewSessionId,
                  audioBlob
                );
                console.log("Got response from server:", response);

                // Handle the response from Groq transcription
                if (response.evaluation) {
                  setFeedback(
                    `Score: ${response.evaluation.score}/10 - ${response.evaluation.feedback}`
                  );
                  console.log(
                    `Feedback received: ${response.evaluation.feedback}`
                  );
                  setFeedbackReviewed(false); // Reset feedback review state
                }

                // Move to next question or end interview
                if (response.done) {
                  console.log("Interview complete");
                  setIsLastQuestion(true);
                } else if (response.next_question) {
                  console.log(`Next question: ${response.next_question}`);
                  setCurrentQuestion(response.next_question);
                  const nextIndex = questionIndex + 1;
                  setQuestionIndex(nextIndex);
                  const isLastQ = nextIndex >= totalQuestions - 1;
                  console.log(
                    `Is last question: ${isLastQ} (index: ${nextIndex}, total: ${totalQuestions})`
                  );
                  setIsLastQuestion(isLastQ);
                } else {
                  console.error("No next question provided in response");
                }
              } catch (error) {
                console.error("Error submitting audio:", error);
              } finally {
                setIsLoading(false);
              }
            }
          };

          setMediaRecorder(recorder);
          setIsConnected(true);

          // Start recording data at intervals when the recorder is started
          if (recorder.state === "inactive") {
            console.log("MediaRecorder initialized and ready");
          }
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        if (isMounted) {
          setIsConnected(false);
        }
      }
    }

    setupMediaDevices();

    // Cleanup function to stop all media when component unmounts
    return () => {
      isMounted = false;
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Clean up any interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      setMediaRecorder(null);
    };
  }, [interviewSessionId, questionIndex, totalQuestions]);

  // Function to handle moving to the next question
  const handleNextQuestion = () => {
    console.log("Moving to next question...");
    // Reset recording state for the next question
    setHasRecorded(false);
    setFeedback(null);
    setFeedbackReviewed(false);

    // Start recording for the next question
    // We're relying on the current question and index set by the API response
    if (!isRecording) {
      toggleRecording();
    }
  };

  // Function to handle recording
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      audioChunksRef.current = []; // Reset the audio chunks

      // Clear any feedback when starting a new recording
      if (hasRecorded) {
        setFeedback(null);
        setFeedbackReviewed(false);
      }

      if (mediaRecorder) {
        console.log("Starting audio recording...");
        try {
          // Clear any existing interval
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }

          // Request data every 300ms for more reliable capture
          mediaRecorder.start(300);

          // Force getting data at regular intervals
          recordingIntervalRef.current = window.setInterval(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.requestData();
              console.log("Requested data from MediaRecorder");
            }
          }, 1000);
        } catch (err) {
          console.error("Error starting recording:", err);
        }
      } else {
        console.error("MediaRecorder not initialized");
      }
    } else {
      // Stop recording and show loading immediately
      setIsRecording(false);
      setHasRecorded(true);
      setIsLoading(true); // Show loading state immediately

      // Clear any recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        console.log("Stopping audio recording...");
        try {
          // Request a final chunk of data before stopping
          mediaRecorder.requestData();
          // Stop the recorder
          mediaRecorder.stop();
        } catch (err) {
          console.error("Error stopping recording:", err);
          setIsLoading(false); // Reset loading state if error occurs
        }
      } else {
        console.error("MediaRecorder not active");
        setIsLoading(false); // Reset loading state if not active
      }
    }
  };

  return (
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

          {feedback && (
            <div className="feedback-box">
              <h4>Feedback:</h4>
              <p>{feedback}</p>
              {!feedbackReviewed ? (
                <button
                  className="review-feedback-button"
                  onClick={() => setFeedbackReviewed(true)}
                >
                  Review Feedback
                </button>
              ) : (
                <div className="feedback-reviewed">
                  <span>✓ Feedback reviewed</span>
                </div>
              )}
            </div>
          )}
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
              {isLoading ? (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Transcribing and analyzing your answer...</span>
                </div>
              ) : !isRecording ? (
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
                    {hasRecorded
                      ? `Click "Next Question" to continue with question ${
                          questionIndex + 1
                        }`
                      : "Ready to start recording your answer"}
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
        {isLoading ? (
          <button className="control-button" disabled>
            {questionIndex === 0
              ? "Loading first question"
              : "Analyzing Response..."}
          </button>
        ) : isRecording ? (
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
            View Summary
          </button>
        ) : (
          hasRecorded &&
          !isRecording &&
          feedbackReviewed && (
            <button
              className="recording-button start-button"
              onClick={handleNextQuestion}
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
  );
}
