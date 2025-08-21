import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMe = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setUserEmail(data.user?.email ?? null);
    setLoading(false);
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
      {/* Top Nav */}
      <header style={styles.header}>
        <div style={styles.brand} onClick={() => navigate("/")}>
          <span style={styles.logo}>🤖</span>
          <span style={styles.brandText}>Interview Prep</span>
        </div>

        <nav style={styles.nav}>
          <Link to="/interviews" style={styles.navLink}>My Interviews</Link>
          <Link to="/start" style={{ ...styles.navLink, ...styles.ctaLink }}>New Interview</Link>
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
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Interview Prep</h1>
        <p style={styles.heroSubtitle}>
          Practice <strong>behavioral</strong> and <strong>technical</strong> interviews with an AI coach.
          You’ll get instant feedback, scores, and tips to improve faster.
        </p>

        <div style={styles.heroActions}>
          <Link to="/start" style={{ ...styles.button, ...styles.buttonPrimary }}>
            Start a New Interview
          </Link>
          <Link to="/interviews" style={{ ...styles.button, ...styles.buttonGhost }}>
            View My Interview History
          </Link>
        </div>
      </section>

      {/* Quick cards */}
      <section style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Behavioral Practice</h3>
          <p style={styles.cardText}>Work through STAR-style prompts and get actionable feedback.</p>
          <Link to="/start?track=behavioral" style={styles.cardLink}>Begin behavioral →</Link>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Technical Practice</h3>
          <p style={styles.cardText}>Answer data structures & algorithms questions and get scored.</p>
          <Link to="/start?track=technical" style={styles.cardLink}>Begin technical →</Link>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Progress</h3>
          <p style={styles.cardText}>Review past sessions, answers, and AI evaluations over time.</p>
          <Link to="/interviews" style={styles.cardLink}>Open history →</Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <span style={styles.muted}>© {new Date().getFullYear()} Interview Prep · Built for practice & growth</span>
      </footer>
    </div>
  );
}

/* -------------------- styles -------------------- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 16,
    padding: "14px 22px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(6px)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  logo: { fontSize: 22 },
  brandText: { fontWeight: 700, letterSpacing: 0.3 },
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
  ctaLink: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  },
  userBox: { display: "flex", justifyContent: "flex-end" },
  userRow: { display: "flex", alignItems: "center", gap: 10 },
  userMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
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
  buttonGhost: {
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "transparent",
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
  cardTitle: { margin: "2px 0 8px", color: "#f8fafc" },
  cardText: { color: "#cbd5e1", lineHeight: 1.5, marginBottom: 10 },
  cardLink: {
    textDecoration: "none",
    color: "#a7f3d0",
    fontWeight: 600,
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 22px",
    textAlign: "center" as const,
  },
};
