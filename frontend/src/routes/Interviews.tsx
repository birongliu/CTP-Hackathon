import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserInterviews } from "../services/interviewService";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Theme colors
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

interface Interview {
  id: string;
  track: "behavioral" | "technical";
  num_questions: number;
  status: "started" | "done" | "cancelled";
  created_at: string;
  finished_at: string | null;
}

export default function Interviews() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const navigate = useNavigate();

  const loadMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setUserEmail(data.user?.email ?? null);
    } catch {
      setUserEmail(null);
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

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserInterviews();
      setInterviews(data.interviews || []);
    } catch (error) {
      console.error("Error loading interviews:", error);
      if ((error as Error).message === "Not authenticated") {
        navigate("/signin", {
          state: {
            message: "Please sign in to view your interviews",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      await loadMe();
      await loadInterviews();
    };
    init();
  }, [navigate, loadInterviews]); // Adding proper dependencies

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getTrackIcon = (track: "behavioral" | "technical") => {
    return track === "behavioral" ? "💬" : "💻";
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      ...styles.badge,
      backgroundColor:
        status === "done"
          ? "rgba(34, 197, 94, 0.2)"
          : status === "cancelled"
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(59, 130, 246, 0.2)",
      color:
        status === "done"
          ? "#4ade80"
          : status === "cancelled"
          ? "#f87171"
          : "#60a5fa",
    };

    return (
      <span style={badgeStyles}>
        {status === "done"
          ? "Completed"
          : status === "cancelled"
          ? "Cancelled"
          : "In Progress"}
      </span>
    );
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
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
          <Link
            to="/interviews"
            style={{
              ...styles.navLink,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            My Interviews
          </Link>
        </nav>

        <div style={styles.userBox}>
          {loading ? (
            <span style={styles.muted}>Checking session…</span>
          ) : userEmail ? (
            <div style={styles.userRow}>
              <div style={styles.avatarCircle}>
                {(userEmail[0] || "U").toUpperCase()}
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

      {/* Main content */}
      <main style={styles.main}>
        <h1 style={styles.pageTitle}>My Interview History</h1>

        {loading ? (
          <div style={styles.loading}>Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven't completed any interviews yet.</p>
            <Link to="/" style={{ ...styles.button, ...styles.buttonPrimary }}>
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div style={styles.interviewList}>
            {interviews.map((interview) => (
              <div key={interview.id} style={styles.interviewCard}>
                <div style={styles.interviewHeader}>
                  <span style={styles.trackIcon}>
                    {getTrackIcon(interview.track)}
                  </span>
                  <h3 style={styles.interviewTitle}>
                    {interview.track.charAt(0).toUpperCase() +
                      interview.track.slice(1)}{" "}
                    Interview
                  </h3>
                  {getStatusBadge(interview.status)}
                </div>

                <div style={styles.interviewDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Started:</span>
                    <span style={styles.detailValue}>
                      {formatDate(interview.created_at)}
                    </span>
                  </div>

                  {interview.finished_at && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Completed:</span>
                      <span style={styles.detailValue}>
                        {formatDate(interview.finished_at)}
                      </span>
                    </div>
                  )}

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Questions:</span>
                    <span style={styles.detailValue}>
                      {interview.num_questions}
                    </span>
                  </div>
                </div>

                <div style={styles.interviewActions}>
                  {interview.status === "done" ? (
                    <Link
                      to={`/summary/${interview.id}`}
                      style={{ ...styles.button, ...styles.buttonPrimary }}
                    >
                      View Summary
                    </Link>
                  ) : (
                    <Link
                      to={`/interview/${interview.id}?type=${interview.track}`}
                      style={{ ...styles.button, ...styles.buttonPrimary }}
                    >
                      Continue Interview
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
  pill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
  },

  main: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "40px 20px",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 32,
    color: T.heading,
    textAlign: "center",
  },
  loading: {
    textAlign: "center",
    color: T.muted,
    padding: 40,
  },
  emptyState: {
    textAlign: "center",
    padding: 60,
    color: T.muted,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  interviewList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  interviewCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  interviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  trackIcon: {
    fontSize: 24,
  },
  interviewTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    flex: 1,
    color: T.heading,
  },
  badge: {
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 12,
  },
  interviewDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
  },
  detailLabel: {
    color: T.muted,
  },
  detailValue: {
    fontWeight: 500,
  },
  interviewActions: {
    marginTop: 8,
  },
  button: {
    display: "inline-block",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s ease",
  },
  buttonPrimary: {
    backgroundColor: T.accent,
    color: "#0b1220",
    border: "none",
    width: "100%",
  },
  footer: {
    textAlign: "center",
    padding: "30px 20px",
    borderTop: `1px solid ${T.borderSoft}`,
  },
};
