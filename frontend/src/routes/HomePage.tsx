import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { startInterview } from "../services/interviewService";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const T = {
  bg: "#0b1220",
  bg2: "#0f172a",
  surface: "rgba(255,255,255,0.06)",
  surfaceSoft: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.07)",
  text: "#e5e7eb",
  muted: "#94a3b8",
  heading: "#f8fafc",
  accent: "#22c55e",
  accent2: "#16a34a",
};

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
    <div style={styles.page}>
      <div style={styles.bgGlowTL} />
      <div style={styles.bgGlowBR} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand} onClick={() => navigate("/")}>
          <span style={styles.logo}>🤖</span>
          <span style={styles.brandText}>Interview Prep</span>
        </div>

        <nav style={styles.nav}>
          <Link to="/interviews" style={styles.navLink}>
            My Interviews
          </Link>
          <button
            onClick={handleNewInterview}
            style={{
              ...styles.navLink,
              ...styles.ctaLink,
              border: "none",
              cursor: "pointer",
            }}
            disabled={isStartingInterview}
          >
            {isStartingInterview ? "Starting..." : "New Interview"}
          </button>
        </nav>

        <div style={styles.userBox}>
          {loading ? (
            <span style={styles.muted}>Checking session…</span>
          ) : loggedIn ? (
            <div style={styles.userRow}>
              <div style={styles.avatarCircle}>
                {(userEmail![0] || "U").toUpperCase()}
              </div>
              <div style={styles.userMeta}>
                <div style={styles.userEmail}>{userEmail}</div>
                <button onClick={handleSignOut} style={styles.logoutBtn}>
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/signin" style={styles.navLink}>
                Sign In
              </Link>
              <Link to="/signup" style={{ ...styles.navLink, ...styles.pill }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Interview Prep</h1>
        <p style={styles.heroSubtitle}>
          Practice <strong>behavioral</strong> and <strong>technical</strong>{" "}
          interviews with an AI coach. You’ll get instant feedback, scores, and
          tips to improve faster.
        </p>

        <div style={styles.heroActions}>
          <button
            onClick={handleNewInterview}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              border: "none",
              cursor: "pointer",
            }}
            disabled={isStartingInterview}
          >
            {isStartingInterview
              ? "Starting Interview..."
              : "Start a New Interview"}
          </button>
          <Link
            to="/interviews"
            style={{ ...styles.button, ...styles.buttonGhost }}
          >
            View My Interview History
          </Link>
        </div>

        {/* Interview Type Selection Modal */}
        {showTypeSelection && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Select Interview Type</h3>
              <p style={styles.modalText}>
                Choose the type of interview you want to practice:
              </p>

              <div style={styles.modalButtons}>
                <button
                  onClick={() => handleStartInterview("behavioral")}
                  style={{
                    ...styles.typeButton,
                    ...(isStartingInterview ? styles.buttonDisabled : {}),
                  }}
                  disabled={isStartingInterview}
                >
                  <span style={styles.typeIcon}>💬</span>
                  <span style={styles.typeTitle}>Behavioral</span>
                  <span style={styles.typeDesc}>
                    Practice STAR-method answers, soft skills, and teamwork
                    scenarios
                  </span>
                </button>

                <button
                  onClick={() => handleStartInterview("technical")}
                  style={{
                    ...styles.typeButton,
                    ...(isStartingInterview ? styles.buttonDisabled : {}),
                  }}
                  disabled={isStartingInterview}
                >
                  <span style={styles.typeIcon}>💻</span>
                  <span style={styles.typeTitle}>Technical</span>
                  <span style={styles.typeDesc}>
                    Practice algorithms, data structures, and coding concepts
                  </span>
                </button>
              </div>

              <button
                onClick={() => setShowTypeSelection(false)}
                style={styles.closeButton}
                disabled={isStartingInterview}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick cards */}
      <section style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Behavioral Practice</h3>
          <p style={styles.cardText}>
            Work through STAR-style prompts and get actionable feedback.
          </p>
          <button
            onClick={() => handleStartInterview("behavioral")}
            style={{
              ...styles.cardLink,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            disabled={isStartingInterview}
          >
            Begin behavioral →
          </button>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Technical Practice</h3>
          <p style={styles.cardText}>
            Answer data structures & algorithms questions and get scored.
          </p>
          <button
            onClick={() => handleStartInterview("technical")}
            style={{
              ...styles.cardLink,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            disabled={isStartingInterview}
          >
            Begin technical →
          </button>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Progress</h3>
          <p style={styles.cardText}>
            Review past sessions, answers, and AI evaluations over time.
          </p>
          <Link to="/interviews" style={styles.cardLink}>
            Open history →
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <span style={styles.muted}>
          © {new Date().getFullYear()} Interview Prep · Practice & Grow
        </span>
      </footer>
    </div>
  );
}

/* -------------------- styles -------------------- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.08), transparent 55%),
                 radial-gradient(900px 600px at 110% 10%, rgba(59,130,246,0.06), transparent 55%),
                 linear-gradient(180deg, ${T.bg2} 0%, ${T.bg} 100%)`,
    color: T.text,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    position: "relative",
  },
  bgGlowTL: {
    position: "absolute",
    inset: "0 auto auto 0",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,197,94,0.18), transparent 60%)",
    filter: "blur(30px)",
    pointerEvents: "none",
    transform: "translate(-30%, -30%)",
  },
  bgGlowBR: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(148,163,184,0.18), transparent 60%)",
    filter: "blur(40px)",
    pointerEvents: "none",
    transform: "translate(20%, 20%)",
  },

  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 16,
    padding: "14px 22px",
    borderBottom: `1px solid ${T.borderSoft}`,
    position: "sticky",
    top: 0,
    backdropFilter: "blur(8px)",
    background: "rgba(11,18,32,0.78)",
    zIndex: 10,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logo: { fontSize: 22 },
  brandText: { fontWeight: 800, letterSpacing: 0.3, color: T.accent },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  navLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
  },
  userBox: { display: "flex", justifyContent: "flex-end" },
  userRow: { display: "flex", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: T.accent,
    color: "#0b1220",
    fontWeight: 700,
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userEmail: { fontSize: 13, color: "#cbd5e1" },
  logoutBtn: {
    marginTop: 4,
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  authLinks: { display: "flex", alignItems: "center" },
  muted: { color: "#94a3b8" },

  hero: {
    maxWidth: 920,
    margin: "48px auto 0",
    padding: "0 20px",
    textAlign: "center" as const,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 800,
    marginBottom: 12,
    color: "#f8fafc",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    lineHeight: 1.6,
    margin: "0 auto 22px",
    maxWidth: 760,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
    marginTop: 10,
  },
  button: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#0b1220",
  },
  onDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    maxWidth: 1024,
    margin: "34px auto 0",
    padding: "0 20px 36px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: {
    margin: "2px 0 8px",
    color: T.heading,
    fontWeight: 700,
    fontSize: 18,
  },
  cardText: { color: "#cbd5e1", lineHeight: 1.5, marginBottom: 12 },
  cardLink: { textDecoration: "none", color: T.accent, fontWeight: 600 },
  cardLinkLocked: { color: T.muted, borderColor: T.borderSoft },
  footer: {
    borderTop: `1px solid ${T.borderSoft}`,
    padding: "16px 22px",
    textAlign: "center" as const,
    fontSize: 13,
    color: T.muted,
    marginTop: 100,
  },

  buttonGhost: { color: T.text, border: `1px solid ${T.border}`, background: "transparent" },

  // Modal styles
  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.2s ease-out",
  },
  modalContent: {
    backgroundColor: T.bg2,
    borderRadius: 16,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    padding: 24,
    maxWidth: "600px",
    width: "90%",
    border: `1px solid ${T.border}`,
    animation: "scaleIn 0.2s ease-out",
    position: "relative" as const,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: T.heading,
    marginBottom: 10,
    textAlign: "center" as const,
  },
  modalText: {
    color: T.muted,
    textAlign: "center" as const,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    marginBottom: 24,
  },
  typeButton: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    padding: 20,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
    color: T.text,
    // Hover state handled with CSS classes
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: T.heading,
    marginBottom: 6,
  },
  typeDesc: {
    fontSize: 15,
    color: T.muted,
    lineHeight: 1.5,
  },
  closeButton: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.muted,
    cursor: "pointer",
    width: "fit-content",
    margin: "0 auto",
    fontSize: 16,
    transition: "all 0.2s ease",
  },
};
