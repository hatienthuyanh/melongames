'use client'

const COLORS = {
  pink: '#ff4d70',
  teal: '#00bdb6',
  bg: '#f0fffe',
  bgAlt: '#d1f9f1',
  text: '#0c3633',
}

export default function SundayPractice() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgAlt} 100%)`,
      fontFamily: 'Nunito, sans-serif',
    }}>
      <style>{`
        @keyframes bubblePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 77, 112, 0.5), 0 8px 32px rgba(0,0,0,0.15);
          }
          50% {
            transform: scale(1.07);
            box-shadow: 0 0 0 20px rgba(255, 77, 112, 0), 0 14px 48px rgba(255, 77, 112, 0.4);
          }
        }
        @keyframes bubblePulse2 {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 189, 182, 0.5), 0 8px 32px rgba(0,0,0,0.15);
          }
          50% {
            transform: scale(1.07);
            box-shadow: 0 0 0 20px rgba(0, 189, 182, 0), 0 14px 48px rgba(0, 189, 182, 0.4);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.6s ease forwards;
        }
        .bubble-btn-1 {
          animation: bubblePulse 2s ease-in-out infinite;
        }
        .bubble-btn-2 {
          animation: bubblePulse2 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }
        .float-emoji {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }} className="animate-slide-up">
        <div style={{ fontSize: '72px', marginBottom: 10 }} className="float-emoji">🎮</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          color: COLORS.text,
        }}>
          <span style={{ color: COLORS.pink }}>Sunday</span>{' '}
          <span style={{ color: COLORS.teal }}>Practice!</span>
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginTop: 8 }}>
          🍉 Learn English while having fun! 🍉
        </p>
      </div>

      {/* Reminder box */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '22px 30px',
        maxWidth: 480,
        width: '100%',
        marginBottom: 36,
        boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        borderLeft: `6px solid ${COLORS.teal}`,
        animation: 'slideUp 0.6s ease 0.2s forwards',
        opacity: 0,
      }}>
        <p style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 10,
          fontFamily: 'Montserrat, sans-serif',
        }}>
          📚 Before you play...
        </p>
        <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.65 }}>
          Go to{' '}
          <strong style={{ color: COLORS.teal }}>This Week&apos;s Lessons</strong>{' '}
          and learn the letters <strong>A → K</strong> first! 🎯
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 10 }}>
          Then come back here and play! 💪
        </p>
      </div>

      {/* Game buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 30,
        maxWidth: 400,
        width: '100%',
      }}>
        {/* Game 1 */}
        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s ease 0.4s forwards', opacity: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: COLORS.text,
            marginBottom: 14,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            🎯 Game 1
          </p>
          <a
            href="https://wordwall.net/play/111630/415/144"
            target="_blank"
            rel="noopener noreferrer"
            className="bubble-btn-1"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              background: `linear-gradient(135deg, ${COLORS.pink}, #ff6b8a)`,
              color: 'white',
              borderRadius: 28,
              padding: '30px 40px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(255, 77, 112, 0.3)',
            }}
          >
            <span style={{ fontSize: '56px', display: 'block', marginBottom: 8 }}>🎯</span>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              display: 'block',
            }}>
              Play Game 1!
            </span>
            <span style={{
              fontSize: '0.95rem',
              opacity: 0.9,
              display: 'block',
              marginTop: 6,
            }}>
              Click to open →
            </span>
          </a>
        </div>

        {/* Game 2 */}
        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s ease 0.65s forwards', opacity: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: COLORS.text,
            marginBottom: 14,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            🎯 Game 2
          </p>
          <a
            href="https://wordwall.net/play/111630/056/728"
            target="_blank"
            rel="noopener noreferrer"
            className="bubble-btn-2"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              background: `linear-gradient(135deg, ${COLORS.teal}, #00d9d1)`,
              color: 'white',
              borderRadius: 28,
              padding: '30px 40px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0, 189, 182, 0.3)',
            }}
          >
            <span style={{ fontSize: '56px', display: 'block', marginBottom: 8 }}>🎯</span>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              display: 'block',
            }}>
              Play Game 2!
            </span>
            <span style={{
              fontSize: '0.95rem',
              opacity: 0.9,
              display: 'block',
              marginTop: 6,
            }}>
              Click to open →
            </span>
          </a>
        </div>
      </div>

      {/* Back home */}
      <a
        href="/"
        style={{
          marginTop: 44,
          color: COLORS.teal,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          fontFamily: 'Montserrat, sans-serif',
          animation: 'slideUp 0.6s ease 0.9s forwards',
          opacity: 0,
        }}
      >
        ← Back to Games
      </a>

      <footer style={{
        marginTop: 24,
        color: '#bbb',
        fontSize: '0.85rem',
        animation: 'slideUp 0.6s ease 1.1s forwards',
        opacity: 0,
      }}>
        Made with 💖 by <span style={{ color: COLORS.pink }}>WatermelonEdu</span>
      </footer>
    </div>
  )
}
