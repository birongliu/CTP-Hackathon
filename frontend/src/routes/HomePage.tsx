import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUserEmail(null);
    navigate("/signin");
  };

  useEffect(() => { loadMe(); }, []);

  const loggedIn = !!userEmail;

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
          <Link to="/" style={{ ...styles.navLink, opacity: 0.9 }}>Home</Link>
          {loggedIn && <Link to="/interview?type=behavioral" style={styles.navLink}>Behavioral</Link>}
          {loggedIn && <Link to="/interview?type=technical" style={styles.navLink}>Technical</Link>}
        </nav>

        <div style={styles.userBox}>
          {loading ? (
            <span style={styles.muted}>Checking session…</span>
          ) : loggedIn ? (
            <div style={styles.userRow}>
              <div style={styles.avatarCircle}>{(userEmail![0] || "U").toUpperCase()}</div>
              <div style={styles.userMeta}>
                <div style={styles.userEmail}>{userEmail}</div>
                <button onClick={handleSignOut} style={styles.logoutBtn}>Log out</button>
              </div>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/signin" style={styles.navLink}>Sign In</Link>
              <Link to="/signup" style={{ ...styles.navLink, ...styles.pill }}>Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      <main style={styles.container}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.kicker}>Built for candidates · Loved by reviewers</div>
          <h1 style={styles.heroTitle}>Ace Your Next Interview</h1>
          <p style={styles.heroSubtitle}>
            Practice <strong>behavioral</strong> & <strong>technical</strong> interviews with an AI coach.
            Get instant feedback, clear scores, and targeted suggestions.
          </p>

          <div style={styles.heroActions}>
            {loggedIn ? (
              <>
                <Link to="/start" style={{ ...styles.button, ...styles.buttonPrimary }}>Start New Interview</Link>
                <Link to="/interviews" style={{ ...styles.button, ...styles.buttonGhost }}>View My History</Link>
              </>
            ) : (
              <>
                <Link to="/signup" style={{ ...styles.button, ...styles.buttonPrimary }}>Get Started Free</Link>
                <Link to="/signin" style={{ ...styles.button, ...styles.buttonGhost }}>Already have an account?</Link>
              </>
            )}
          </div>

          <div style={styles.trustRow}>
            <div style={styles.stat}><span style={styles.statNum}>98%</span><span style={styles.statLabel}>feel more prepared</span></div>
            <div style={styles.dividerDot} />
            <div style={styles.stat}><span style={styles.statNum}>5 min</span><span style={styles.statLabel}>to first session</span></div>
            <div style={styles.dividerDot} />
            <div style={styles.stat}><span style={styles.statNum}>A/B</span><span style={styles.statLabel}>feedback, not fluff</span></div>
          </div>
        </section>

        {/* How it Works */}
        <section style={styles.steps}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <span style={styles.stepIcon}>📝</span>
              <h3 style={styles.stepTitle}>Choose a track</h3>
              <p style={styles.stepText}>Behavioral (STAR) or technical (DS&A). Mix and match anytime.</p>
            </div>
            <div style={styles.stepCard}>
              <span style={styles.stepIcon}>💡</span>
              <h3 style={styles.stepTitle}>Answer questions</h3>
              <p style={styles.stepText}>Curated prompts with realistic difficulty and pacing.</p>
            </div>
            <div style={styles.stepCard}>
              <span style={styles.stepIcon}>📊</span>
              <h3 style={styles.stepTitle}>Get instant feedback</h3>
              <p style={styles.stepText}>Scores + specific coaching tips and examples to improve.</p>
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section style={styles.cards}>
          {/* Behavioral */}
          <div style={{ ...styles.card, ...(loggedIn ? {} : styles.cardLocked) }}>
            {!loggedIn && <div style={styles.lockBadge}>🔒 Sign in to use</div>}
            <h3 style={styles.cardTitle}>💬 Behavioral Practice</h3>
            <p style={styles.cardText}>Practice STAR stories with guided structure and clarity checks.</p>
            <Link
              to={loggedIn ? "/start?track=behavioral" : "/signin"}
              style={{ ...styles.cardLink, ...(loggedIn ? {} : styles.cardLinkLocked) }}
              aria-disabled={!loggedIn}
            >
              {loggedIn ? "Start Behavioral →" : "Sign in to start →"}
            </Link>
          </div>

          {/* Technical */}
          <div style={{ ...styles.card, ...(loggedIn ? {} : styles.cardLocked) }}>
            {!loggedIn && <div style={styles.lockBadge}>🔒 Sign in to use</div>}
            <h3 style={styles.cardTitle}>💻 Technical Practice</h3>
            <p style={styles.cardText}>DS&A questions with rubric-based scoring.</p>
            <Link
              to={loggedIn ? "/start?track=technical" : "/signin"}
              style={{ ...styles.cardLink, ...(loggedIn ? {} : styles.cardLinkLocked) }}
              aria-disabled={!loggedIn}
            >
              {loggedIn ? "Start Technical →" : "Sign in to start →"}
            </Link>
          </div>

          {/* History */}
          <div style={{ ...styles.card, ...(loggedIn ? {} : styles.cardLocked) }}>
            {!loggedIn && <div style={styles.lockBadge}>🔒 Sign in to use</div>}
            <h3 style={styles.cardTitle}>📈 Progress & Insights</h3>
            <p style={styles.cardText}>Session history, trending skills, and personalized next steps.</p>
            <Link
              to={loggedIn ? "/interviews" : "/signin"}
              style={{ ...styles.cardLink, ...(loggedIn ? {} : styles.cardLinkLocked) }}
              aria-disabled={!loggedIn}
            >
              {loggedIn ? "Open History →" : "Sign in to view →"}
            </Link>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <span style={styles.muted}>© {new Date().getFullYear()} Interview Prep · Practice & Grow</span>
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
  bgGlowTL: { position: "absolute", inset: "0 auto auto 0", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.18), transparent 60%)", filter: "blur(30px)", pointerEvents: "none", transform: "translate(-30%, -30%)" },
  bgGlowBR: { position: "absolute", right: 0, bottom: 0, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(148,163,184,0.18), transparent 60%)", filter: "blur(40px)", pointerEvents: "none", transform: "translate(20%, 20%)" },

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

  nav: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center" },
  navLink: { color: "#cbd5e1", textDecoration: "none", padding: "8px 12px", borderRadius: 8, border: "1px solid transparent" },
  userBox: { display: "flex", justifyContent: "flex-end" },
  userRow: { display: "flex", alignItems: "center", gap: 10 },
  avatarCircle: { width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", background: T.accent, color: "#0b1220", fontWeight: 700 },
  userMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  userEmail: { fontSize: 13, color: "#cbd5e1" },
  logoutBtn: { marginTop: 4, fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surfaceSoft, color: T.text, cursor: "pointer" },
  authLinks: { display: "flex", alignItems: "center", gap: 8 },
  pill: { border: `1px solid ${T.accent}`, color: T.accent, background: "rgba(34,197,94,0.10)", borderRadius: 10 },

  container: { maxWidth: 1100, padding: "20px 20px 30px", margin: "0 auto" },

  hero: { textAlign: "center" as const, padding: "28px 0 16px" },
  kicker: { display: "inline-block", fontSize: 12, letterSpacing: 0.5, color: T.muted, padding: "6px 10px", border: `1px solid ${T.borderSoft}`, borderRadius: 999, background: "rgba(255,255,255,0.03)", marginBottom: 10 },
  heroTitle: { fontSize: 42, fontWeight: 800, color: T.heading, margin: "0 0 10px" },
  heroSubtitle: { fontSize: 16, color: "#cbd5e1", lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 760 },
  heroActions: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 18, marginTop: 50 },

  trustRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 14, color: T.muted, fontSize: 13 },
  stat: { display: "flex", alignItems: "baseline", gap: 6 },
  statNum: { color: T.heading, fontWeight: 700 },
  statLabel: { color: T.muted },
  dividerDot: { width: 6, height: 6, borderRadius: 6, background: T.borderSoft },

  sectionTitle: { fontSize: 22, fontWeight: 700, color: T.heading, margin: "18px 0 12px", textAlign: "center" as const },
  steps: { margin: "10px 0 6px", padding: "16px", borderRadius: 14, border: `1px solid ${T.borderSoft}`, background: "rgba(255,255,255,0.02)" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  stepCard: { background: T.surfaceSoft, border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: 16 },
  stepIcon: { fontSize: 24, display: "block", marginBottom: 8 },
  stepTitle: { margin: "0 0 6px", color: T.heading, fontSize: 16, fontWeight: 700 },
  stepText: { margin: 0, color: "#cbd5e1", lineHeight: 1.5, fontSize: 14 },

  cards: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 50 },
  card: { position: "relative", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  cardLocked: { opacity: 0.65, filter: "saturate(0.85)" },
  lockBadge: {
    position: "absolute", top: 12, right: 12, fontSize: 12, color: T.muted,
    border: `1px solid ${T.borderSoft}`, background: "rgba(255,255,255,0.04)", padding: "4px 8px",
    borderRadius: 999,
  },
  cardTitle: { margin: "2px 0 8px", color: T.heading, fontWeight: 700, fontSize: 18 },
  cardText: { color: "#cbd5e1", lineHeight: 1.5, marginBottom: 12 },
  cardLink: { textDecoration: "none", color: T.accent, fontWeight: 600 },
  cardLinkLocked: { color: T.muted, borderColor: T.borderSoft as any },

  button: { display: "inline-block", padding: "10px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 701, letterSpacing: 0.2 },
  buttonPrimary: { background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`, color: "#0b1220", boxShadow: "0 6px 18px rgba(34,197,94,0.35)" },
  buttonGhost: { color: T.text, border: `1px solid ${T.border}`, background: "transparent" },

  footer: { borderTop: `1px solid ${T.borderSoft}`, padding: "16px 22px", textAlign: "center" as const, fontSize: 13, color: T.muted, marginTop: 100 },
};
