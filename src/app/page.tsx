'use client'

import Link from 'next/link'

const COLORS = {
  pink: '#ff4d70',
  teal: '#00bdb6',
  bg: '#f0fffe',
  bgAlt: '#d1f9f1',
  text: '#0c3633',
}

export default function Home() {
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
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '-2px',
        }}>
          <span style={{ color: COLORS.pink }}>Melon</span>
          <span style={{ color: COLORS.teal }}> Games</span>
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginTop: 5 }}>
          🎮 Learn English while playing!
        </p>
        <div style={{ fontSize: '60px', marginTop: 10 }}>🍉</div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 400,
        width: '100%',
      }}>
        <Link href="/alphabet-runner" style={{
          textDecoration: 'none',
          background: 'white',
          borderRadius: 20,
          padding: '30px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 50 }}>🔤</span>
          <h2 style={{
            margin: '10px 0 5px',
            color: COLORS.text,
            fontFamily: 'Montserrat, sans-serif',
          }}>Alphabet Runner</h2>
          <p style={{ color: '#666', fontSize: '0.95rem', textAlign: 'center' }}>
            Collect letters a→p in order! Wrong letter = lose a life 🍈
          </p>
          <span style={{
            marginTop: 12,
            background: `linear-gradient(135deg, ${COLORS.pink}, #ff6b8a)`,
            color: 'white',
            padding: '10px 30px',
            borderRadius: 50,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
          }}>▶ Play</span>
        </Link>

        <Link href="/melon-runner" style={{
          textDecoration: 'none',
          background: 'white',
          borderRadius: 20,
          padding: '30px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 50 }}>🍉</span>
          <h2 style={{
            margin: '10px 0 5px',
            color: COLORS.text,
            fontFamily: 'Montserrat, sans-serif',
          }}>Melon Runner</h2>
          <p style={{ color: '#666', fontSize: '0.95rem', textAlign: 'center' }}>
            Dodge obstacles, collect fruits & words!
          </p>
          <span style={{
            marginTop: 12,
            background: `linear-gradient(135deg, ${COLORS.teal}, #00d9d1)`,
            color: 'white',
            padding: '10px 30px',
            borderRadius: 50,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
          }}>▶ Play</span>
        </Link>
      </div>

      <footer style={{ marginTop: 40, color: '#999', fontSize: '0.85rem' }}>
        Made with 💖 by <span style={{ color: COLORS.pink }}>WatermelonEdu</span>
      </footer>
    </div>
  )
}