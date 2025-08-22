import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
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

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand} onClick={() => navigate("/")}>
          <span style={styles.logo}>🤖</span>
          <span style={styles.brandText}>Interview Prep</span>
        </div>

        <nav style={styles.nav}>
          {userEmail && (
            <>
              <Link to="/interviews" style={styles.navLink}>My Interviews</Link>
              <Link to="/start" style={{ ...styles.navLink, ...styles.ctaLink }}>+ New Interview</Link>
            </>
          )}
        </nav>

        <div style={styles.userBox}>
          {loading ? (
            <span style={styles.muted}>Checking session…</span>
          ) : userEmail ? (
            <div style={styles.userRow}>
              <div style={styles.avatarCircle}>{(userEmail[0] || "U").toUpperCase()}</div>
              <div style={styles.userMeta}>
                <div style={styles.userEmail}>{userEmail}</div>
                <button onClick={handleSignOut} style={styles.logoutBtn}>Log out</button>
              </div>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/signin" style={styles.navLink}>Sign In</Link>
              <Link to="/signup" style={{ ...styles.navLink, marginLeft: 12 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      {!userEmail && !loading && (
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>🚀 Ace Your Next Interview</h1>
          <p style={styles.heroSubtitle}>
            Practice <strong>behavioral</strong> & <strong>technical</strong> interviews with an AI coach.  
            Get instant feedback, improve faster, and land your dream job.
          </p>
          <div style={styles.heroActions}>
            <Link to="/signup" style={{ ...styles.button, ...styles.buttonPrimary }}>
              Get Started Free
            </Link>
            <Link to="/signin" style={{ ...styles.button, ...styles.buttonGhost }}>
              Already have an account?
            </Link>
          </div>
        </section>
      )}

      {/* Logged-in */}
      {userEmail && !loading && (
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Welcome back 👋</h1>
          <p style={styles.heroSubtitle}>Ready to sharpen your interview skills today?</p>
          <div style={styles.heroActions}>
            <Link to="/start" style={{ ...styles.button, ...styles.buttonPrimary }}>
              Start New Interview
            </Link>
            <Link to="/interviews" style={{ ...styles.button, ...styles.buttonGhost }}>
              My History
            </Link>
          </div>
        </section>
      )}

      {/* HOW IT WORKS (middle section) */}
      {!loading && (
        <section style={styles.steps}>
          <h2 style={styles.stepsTitle}>How It Works</h2>
          <div style={styles.stepsGrid}>
            <div style={styles.step}>
              <span style={styles.stepIcon}>📝</span>
              <p><strong>1. Choose</strong> interview type</p>
            </div>
            <div style={styles.step}>
              <span style={styles.stepIcon}>💡</span>
              <p><strong>2. Answer</strong> AI-generated questions</p>
            </div>
            <div style={styles.step}>
              <span style={styles.stepIcon}>📊</span>
              <p><strong>3. Improve</strong> with instant feedback</p>
            </div>
          </div>
        </section>
      )}

      {/* Cards (only when logged in) */}
      {userEmail && !loading && (
        <section style={styles.cards}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💬 Behavioral Practice</h3>
            <p style={styles.cardText}>Work through STAR-style prompts with instant AI feedback.</p>
            <Link to="/start?track=behavioral" style={styles.cardLink}>Start →</Link>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💻 Technical Practice</h3>
            <p style={styles.cardText}>Answer coding & algorithms questions with scoring.</p>
            <Link to="/start?track=technical" style={styles.cardLink}>Start →</Link>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📈 Track Progress</h3>
            <p style={styles.cardText}>Review past sessions, answers, and AI evaluations.</p>
            <Link to="/interviews" style={styles.cardLink}>View →</Link>
          </div>
        </section>
      )}

      <footer style={styles.footer}>
        <span style={styles.muted}>© {new Date().getFullYear()} Interview Prep · Practice & grow</span>
      </footer>
    </div>
  );
}

/* -------------------- styles -------------------- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    color: "#111827",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    padding: "16px 28px",
    borderBottom: "1px solid #E5E7EB",
    position: "sticky",
    top: 0,
    background: "#FFFFFF",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logo: { fontSize: 24 },
  brandText: { fontWeight: 800, letterSpacing: 0.4, color: "#DC2626", fontSize: 18 },
  nav: { display: "flex", alignItems: "center", gap: 14, justifyContent: "center" },
  navLink: {
    color: "#374151",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: 8,
    fontWeight: 500,
    transition: "background 0.2s",
  },
  ctaLink: {
    border: "1px solid #DC2626",
    background: "#FEE2E2",
    color: "#DC2626",
    fontWeight: 600,
  },
  userBox: { display: "flex", justifyContent: "flex-end" },
  userRow: { display: "flex", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#DC2626",
    color: "#FFFFFF",
    fontWeight: 700,
  },
  userMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  userEmail: { fontSize: 13, color: "#6B7280" },
  logoutBtn: {
    marginTop: 4,
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#374151",
    cursor: "pointer",
  },
  authLinks: { display: "flex", alignItems: "center" },
  muted: { color: "#6B7280" },

  hero: {
    maxWidth: 960,
    margin: "60px auto",
    padding: "0 20px",
    textAlign: "center" as const,
    flexGrow: 1,
  },
  heroTitle: { fontSize: 40, fontWeight: 800, marginBottom: 14, color: "#111827" },
  heroSubtitle: {
    fontSize: 17,
    color: "#374151",
    lineHeight: 1.6,
    margin: "0 auto 26px",
    maxWidth: 700,
  },
  heroActions: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const },

  /* HOW IT WORKS */
  steps: {
  margin: "30px auto 180x",
  padding: "0 20px",
  maxWidth: 1100,          // give it room
  textAlign: "center" as const,
},
  stepsTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 24,
  },
  stepsGrid: {
  display: "flex",
  gap: 16,
  justifyContent: "center",
  alignItems: "stretch",
  flexWrap: "wrap",        // will wrap to 2/1 per row on small screens
  // If you want a single scrolling row instead, use:
  // flexWrap: "nowrap",
  // overflowX: "auto",
  // scrollSnapType: "x mandatory",
},
  step: {
  background: "#F9FAFB",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  minWidth: 260,           // ensures horizontal card layout
  flex: "0 1 320px",       // grow/shrink nicely in the row
  // If using the scrolling row version above, add:
  // scrollSnapAlign: "start",
},
  stepIcon: {
    fontSize: 28,
    display: "block",
    marginBottom: 10,
  },

  /* Cards */
  cards: {
  display: "flex",
  gap: 20,
  overflowX: "auto",          // enables horizontal scrolling
  padding: "20px",
  margin: "30px auto 40px",
  scrollSnapType: "x mandatory", // smooth snap scrolling
},
card: {
  flex: "0 0 280px",           // fixed card width
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 20,
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "pointer",
  scrollSnapAlign: "start",    // snap each card to view
},

  cardTitle: { margin: "2px 0 8px", color: "#111827", fontWeight: 700, fontSize: 18 },
  cardText: { color: "#374151", lineHeight: 1.5, marginBottom: 12 },
  cardLink: { textDecoration: "none", color: "#DC2626", fontWeight: 600 },

  footer: {
    borderTop: "1px solid #E5E7EB",
    padding: "18px 24px",
    textAlign: "center" as const,
    background: "#FFFFFF",
    fontSize: 13,
    color: "#6B7280",
  },
};
