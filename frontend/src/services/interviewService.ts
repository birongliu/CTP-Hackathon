import { supabase } from "../supabaseClient";
const API_BASE_URL = "http://localhost:5000";
// Get the current auth token
const getAuthHeader = async () => {
  const session = await supabase.auth.getSession();
  console.log(session);
  if (session.data.session) {
    console.log("sessions", session);
    return {
      Authorization: `Bearer ${session.data.session.access_token}`,
    };
  }
  throw new Error("Not authenticated");
};

// Start a new interview session
export const startInterview = async (
  track: "behavioral" | "technical",
  numQuestions = 5
) => {
  try {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ track, num_questions: numQuestions }),
    });

    if (!response.ok) {
      throw new Error("Failed to start interview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error starting interview:", error);
    throw error;
  }
};

// Submit a text answer
export const submitTextAnswer = async (sessionId: string, answer: string) => {
  try {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/api/interview/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ session_id: sessionId, answer }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
};

// Submit an audio recording to be transcribed by Groq on the backend
export const submitAudioAnswer = async (sessionId: string, audioBlob: Blob) => {
  try {
    console.log("Starting authentication process...");
    const headers = await getAuthHeader();
    console.log("Authentication successful");

    // Validate the audio blob
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("Empty audio recording");
    }

    console.log(
      `Preparing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`
    );

    // Create a new FormData instance
    const formData = new FormData();

    // Use a more specific file name with timestamp
    const timestamp = new Date().getTime();
    const fileName = `recording_${timestamp}.webm`;

    // Append the audio file to the form data
    formData.append("audio", audioBlob, fileName);
    formData.append("session_id", sessionId);

    // Log FormData entries for debugging
    for (const entry of formData.entries()) {
      console.log(
        `FormData entry - ${entry[0]}: ${typeof entry[1]} (${
          entry[1] instanceof Blob ? `${entry[1].size} bytes` : "text"
        })`
      );
    }

    console.log("Submitting audio to server for transcription...");
    const startTime = Date.now();

    const response = await fetch(`${API_BASE_URL}/api/interview/answer`, {
      method: "POST",
      headers: {
        ...headers,
        // Note: Don't set Content-Type here, it will be set automatically with boundary
      },
      body: formData,
    });

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Server processing completed in ${processingTime} seconds`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Failed to submit audio: ${errorText}`);
    }

    console.log("Successfully processed audio response");
    return await response.json();
  } catch (error) {
    console.error("Error submitting audio:", error);
    throw error;
  }
};

// Get interview summary
export const getInterviewSummary = async (sessionId: string) => {
  try {
    const headers = await getAuthHeader();

    const response = await fetch(
      `${API_BASE_URL}/api/interview/summary?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          ...headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get summary");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting summary:", error);
    throw error;
  }
};

// Get user's past interviews
export const getUserInterviews = async () => {
  try {
    const headers = await getAuthHeader();

    const response = await fetch(
      `${API_BASE_URL}/api/interview/user-interviews`,
      {
        method: "GET",
        headers: {
          ...headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get user interviews");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting user interviews:", error);
    throw error;
  }
};

// For technical interviews, retrieve audio recordings
export const getTechnicalAudio = async (
  sessionId: string,
  turnIndex?: number
) => {
  try {
    const headers = await getAuthHeader();

    let url = `${API_BASE_URL}/api/interview/technical-audio?session_id=${sessionId}`;
    if (turnIndex !== undefined) {
      url += `&turn_index=${turnIndex}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get technical audio");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting technical audio:", error);
    throw error;
  }
};
