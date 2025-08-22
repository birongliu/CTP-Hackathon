import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { startInterview } from "../services/interviewService";
import '../styles/HomePage.css'

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";


export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const navigate = useNavigate();

  const loadMe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setUserEmail(data.user?.email ?? null);
    } catch {
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUserEmail(null);
    navigate("/signin");
  };

  useEffect(() => {
    loadMe();
  }, []);

  const loggedIn = !!userEmail;

  const handleNewInterview = () => {
    setShowTypeSelection(true);
  };

  const handleStartInterview = async (type: "behavioral" | "technical") => {
    try {
      setIsStartingInterview(true);
      setShowTypeSelection(false);

      // Create the interview session
      const response = await startInterview(type, 3); // 3 questions per interview

      // Navigate directly to the interview with the session ID
      navigate(`/interview/${response.session_id}?type=${type}`);
    } catch (error) {
      console.error("Error starting interview:", error);
      // If there's an error, we might want to show a message or redirect to sign in
      if ((error as Error).message === "Not authenticated") {
        navigate("/signin", {
          state: {
            message: "Please sign in to start an interview",
          },
        });
      } else {
        // Just navigate to the regular interview page as a fallback
        navigate(`/interview?type=${type}`);
      }
    } finally {
      setIsStartingInterview(false);
    }
  };

  return (
      <div className="home-page">
        <div className="bg-glow-tl" />
        <div className="bg-glow-br" />

      {/* Header */}
      <header className="user-box">
          {loading ? (
            <span className="text-muted">Checking session…</span>
          ) : loggedIn ? (
            <div className="user-row">
              <div className="avatar-circle">
                {(userEmail![0] || "U").toUpperCase()}
              </div>
              <div className="user-meta">
                <div className="user-email">{userEmail}</div>
                <button onClick={handleSignOut} className="logout-btn">
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-muted">You're not signed in.</div>
          )}
        </header>

      {/* Hero */}
        <main className="hero">
          <h1 className="hero-title">Welcome to Interview Prep</h1>
          <p className="hero-subtitle">
            Practice <strong>behavioral</strong> and <strong>technical</strong>{" "}
            interviews with an AI coach. You’ll get instant feedback, scores, and
            tips to improve faster.
          </p>

          <div className="hero-actions">
            <button
              onClick={handleNewInterview}
              className="button button-primary"
              disabled={isStartingInterview}
            >
              {isStartingInterview
                ? "Starting..."
                : "Start a New Interview"}
            </button>
            <Link to="/interviews" className="button button-ghost">
              View My Interview History
            </Link>
          </div>
        </main>

        {/* Interview Type Selection Modal */}
        {showTypeSelection && (
          <div className="modal-overlay" onClick={() => !isStartingInterview && setShowTypeSelection(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Select Interview Type</h3>
              <p className="modal-text">
                Choose the type of interview you want to practice:
              </p>

              <div className="modal-buttons">
                <button
                  onClick={() => handleStartInterview("behavioral")}
                  className="type-button"
                  disabled={isStartingInterview}
                >
                  <span className="type-icon">💬</span>
                  <span className="type-title">Behavioral</span>
                  <span className="type-desc">
                    Practice STAR-method answers, soft skills, and teamwork
                    scenarios
                  </span>
                </button>

                <button
                  onClick={() => handleStartInterview("technical")}
                  className="type-button"
                  disabled={isStartingInterview}
                >
                  <span className="type-icon">💻</span>
                  <span className="type-title">Technical</span>
                  <span className="type-desc">
                    Practice algorithms, data structures, and coding concepts
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowTypeSelection(false)}
                className="modal-close-button"
                disabled={isStartingInterview}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Access Cards */}
        <section className="cards">
          <div className="card">
            <h3 className="card-title">Behavioral Practice</h3>
            <p className="card-text">
              Work through STAR-style prompts and get actionable feedback.
            </p>
            <button
              onClick={() => handleStartInterview("behavioral")}
              className="card-link"
              disabled={isStartingInterview}
            >
              Begin behavioral →
            </button>
          </div>
          <div className="card">
            <h3 className="card-title">Technical Practice</h3>
            <p className="card-text">
              Answer data structures & algorithms questions and get scored.
            </p>
            <button
              onClick={() => handleStartInterview("technical")}
              className="card-link"
              disabled={isStartingInterview}
            >
              Begin technical →
            </button>
          </div>
          <div className="card">
            <h3 className="card-title">Your Progress</h3>
            <p className="card-text">
              Review past sessions, answers, and AI evaluations over time.
            </p>
            <Link to="/interviews" className="card-link">
              Open history →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <span className="text-muted">
            © {new Date().getFullYear()} InterTech · Practice & Grow
          </span>
        </footer>
      </div>
  );
}
