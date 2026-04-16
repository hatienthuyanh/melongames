'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Game Constants ───
const GRID_COLS = 10
const GRID_ROWS = 10
const CELL_SIZE = 60
const GAME_WIDTH = GRID_COLS * CELL_SIZE
const GAME_HEIGHT = GRID_ROWS * CELL_SIZE
const LETTERS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p']
const MAX_LIVES = 5

// ─── Brand Colors ───
const C = {
  pink: '#ff4d70',
  teal: '#00bdb6',
  bg: '#f0fffe',
  bgAlt: '#d1f9f1',
  text: '#0c3633',
  white: '#ffffff',
  red: '#e74c3c',
  gold: '#f1c40f',
}

// ─── Sound Helpers ───
function speakLetter(letter: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(letter.toUpperCase())
  u.rate = 0.8
  u.pitch = 1.2
  u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}

function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.rate = 0.9
  u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}

function playTone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = vol
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  } catch {}
}

function playCorrectSound() {
  playTone(523, 0.1, 'square', 0.06)
  setTimeout(() => playTone(659, 0.1, 'square', 0.06), 100)
  setTimeout(() => playTone(784, 0.15, 'square', 0.08), 200)
}

function playWrongSound() {
  playTone(200, 0.3, 'sawtooth', 0.06)
}

function playWinSound() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.15, 'square', 0.06), i * 120))
}

// ─── Music Engine ───
function startMusic(audioCtxRef: React.MutableRefObject<AudioContext | null>, musicRef: React.MutableRefObject<boolean>) {
  if (audioCtxRef.current) return
  musicRef.current = true
  const ctx = new AudioContext()
  audioCtxRef.current = ctx

  // Simple bouncy melody loop
  const melody = [
    392, 440, 494, 523, 494, 440, 392, 330,
    392, 440, 494, 523, 587, 523, 494, 440,
  ]
  const bass = [196, 196, 220, 220, 247, 247, 262, 262]

  let noteIdx = 0
  const bpm = 180
  const interval = (60 / bpm) * 1000

  const loopId = setInterval(() => {
    if (!musicRef.current) {
      clearInterval(loopId)
      return
    }
    try {
      // Melody
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = melody[noteIdx % melody.length]
      gain.gain.value = 0.03
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)

      // Bass
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.value = bass[noteIdx % bass.length]
      gain2.gain.value = 0.02
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      osc2.stop(ctx.currentTime + 0.3)

      noteIdx++
    } catch { clearInterval(loopId) }
  }, interval)
}

function stopMusic(audioCtxRef: React.MutableRefObject<AudioContext | null>, musicRef: React.MutableRefObject<boolean>) {
  musicRef.current = false
  if (audioCtxRef.current) {
    audioCtxRef.current.close()
    audioCtxRef.current = null
  }
}

// ─── Types ───
interface LetterObj {
  letter: string
  x: number
  y: number
}

interface LeaderboardEntry {
  name: string
  score: number
  time: number
  date: string
}

export default function AlphabetRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'win' | 'enterName'>('menu')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [musicOn, setMusicOn] = useState(false)
  const [flashMsg, setFlashMsg] = useState('')
  const [flashColor, setFlashColor] = useState(C.teal)

  // Refs for game loop
  const gameStateRef = useRef(gameState)
  const currentIdxRef = useRef(currentIdx)
  const livesRef = useRef(lives)
  const scoreRef = useRef(score)
  const playerRef = useRef({ x: 1, y: 1 })
  const lettersRef = useRef<LetterObj[]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const flashRef = useRef({ msg: '', color: C.teal, timer: 0 })
  const audioCtxRef = useRef<AudioContext | null>(null)
  const musicOnRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync refs
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { currentIdxRef.current = currentIdx }, [currentIdx])
  useEffect(() => { livesRef.current = lives }, [lives])
  useEffect(() => { scoreRef.current = score }, [score])

  // Load leaderboard
  useEffect(() => {
    try {
      const saved = localStorage.getItem('alphabet-leaderboard')
      if (saved) setLeaderboard(JSON.parse(saved))
    } catch {}
  }, [])

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameState])

  // Music toggle
  const toggleMusic = useCallback(() => {
    if (musicOn) {
      stopMusic(audioCtxRef, musicOnRef)
      setMusicOn(false)
    } else {
      startMusic(audioCtxRef, musicOnRef)
      setMusicOn(true)
    }
  }, [musicOn])

  // Init game
  const initGame = useCallback(() => {
    playerRef.current = { x: 1, y: 1 }
    const placed: LetterObj[] = []
    const occupied = new Set<string>()
    occupied.add('1,1')

    LETTERS.forEach((letter) => {
      let x: number, y: number
      do {
        x = Math.floor(Math.random() * GRID_COLS)
        y = Math.floor(Math.random() * GRID_ROWS)
      } while (occupied.has(`${x},${y}`))
      occupied.add(`${x},${y}`)
      placed.push({ letter, x, y })
    })
    lettersRef.current = placed
    setScore(0)
    setLives(MAX_LIVES)
    setCurrentIdx(0)
    setTimer(0)
    setGameState('playing')
    flashRef.current = { msg: '', color: C.teal, timer: 0 }
  }, [])

  // Draw
  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    // Background
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Grid lines
    ctx.strokeStyle = C.bgAlt
    ctx.lineWidth = 1
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, GAME_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(GAME_WIDTH, y * CELL_SIZE)
      ctx.stroke()
    }

    // Draw letters
    const targetLetter = LETTERS[currentIdxRef.current]
    lettersRef.current.forEach((item) => {
      const isTarget = item.letter === targetLetter
      const cx = item.x * CELL_SIZE + CELL_SIZE / 2
      const cy = item.y * CELL_SIZE + CELL_SIZE / 2

      if (isTarget) {
        // Glow ring for target letter
        const pulse = Math.sin(Date.now() / 200) * 4 + 4
        ctx.beginPath()
        ctx.arc(cx, cy, 28 + pulse, 0, Math.PI * 2)
        ctx.strokeStyle = C.teal
        ctx.lineWidth = 3
        ctx.stroke()

        // Highlight bg
        ctx.beginPath()
        ctx.arc(cx, cy, 26, 0, Math.PI * 2)
        ctx.fillStyle = '#e0fff9'
        ctx.fill()
      }

      // Letter circle
      ctx.beginPath()
      ctx.arc(cx, cy, 22, 0, Math.PI * 2)
      ctx.fillStyle = isTarget ? C.teal : C.pink
      ctx.fill()

      // Letter text
      ctx.font = `bold 24px Montserrat, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = C.white
      ctx.fillText(item.letter.toUpperCase(), cx, cy + 1)
    })

    // Draw player 🍉
    ctx.font = '32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🍉', playerRef.current.x * CELL_SIZE + CELL_SIZE / 2, playerRef.current.y * CELL_SIZE + CELL_SIZE / 2)
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const loop = () => {
      drawGame(ctx)
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameState, drawGame])

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return
      e.preventDefault()
      if (gameStateRef.current !== 'playing') return

      const p = playerRef.current
      let nx = p.x, ny = p.y
      if (e.key === 'ArrowUp') ny = Math.max(0, p.y - 1)
      if (e.key === 'ArrowDown') ny = Math.min(GRID_ROWS - 1, p.y + 1)
      if (e.key === 'ArrowLeft') nx = Math.max(0, p.x - 1)
      if (e.key === 'ArrowRight') nx = Math.min(GRID_COLS - 1, p.x + 1)
      if (nx === p.x && ny === p.y) return

      p.x = nx
      p.y = ny

      // Check collision with letters
      const targetLetter = LETTERS[currentIdxRef.current]
      const hitIdx = lettersRef.current.findIndex(l => l.x === nx && l.y === ny)

      if (hitIdx !== -1) {
        const hit = lettersRef.current[hitIdx]
        if (hit.letter === targetLetter) {
          // Correct!
          playCorrectSound()
          speakLetter(hit.letter)
          lettersRef.current.splice(hitIdx, 1)
          const newScore = scoreRef.current + 10
          setScore(newScore)
          const newIdx = currentIdxRef.current + 1
          setCurrentIdx(newIdx)

          flashRef.current = { msg: `✓ ${hit.letter.toUpperCase()}!`, color: C.teal, timer: 60 }
          setFlashMsg(`✓ ${hit.letter.toUpperCase()}!`)
          setFlashColor(C.teal)

          // Win?
          if (newIdx >= LETTERS.length) {
            playWinSound()
            speakWord('Amazing! You did it!')
            setGameState('win')
          }
        } else {
          // Wrong letter
          playWrongSound()
          const newLives = livesRef.current - 1
          setLives(newLives)

          // Respawn the wrong letter elsewhere
          let rx: number, ry: number
          do {
            rx = Math.floor(Math.random() * GRID_COLS)
            ry = Math.floor(Math.random() * GRID_ROWS)
          } while (
            (rx === nx && ry === ny) ||
            lettersRef.current.some(l => l.x === rx && l.y === ry)
          )
          hit.x = rx
          hit.y = ry

          flashRef.current = { msg: `✗ Not ${hit.letter.toUpperCase()}! Find "${targetLetter.toUpperCase()}"`, color: C.red, timer: 90 }
          setFlashMsg(`✗ Not ${hit.letter.toUpperCase()}! Find "${targetLetter.toUpperCase()}"`)
          setFlashColor(C.red)

          if (newLives <= 0) {
            playWrongSound()
            speakWord('Game over!')
            setGameState('gameover')
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Mobile controls handler
  const handleMobileKey = useCallback((key: string) => {
    const event = new KeyboardEvent('keydown', { key })
    window.dispatchEvent(event)
  }, [])

  // Save score
  const saveScore = useCallback(() => {
    if (!playerName.trim()) return
    const entry: LeaderboardEntry = {
      name: playerName.trim(),
      score: scoreRef.current,
      time: timer,
      date: new Date().toLocaleDateString(),
    }
    const newBoard = [...leaderboard, entry].sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 10)
    setLeaderboard(newBoard)
    try { localStorage.setItem('alphabet-leaderboard', JSON.stringify(newBoard)) } catch {}
    setPlayerName('')
    setGameState('menu')
  }, [playerName, timer, leaderboard])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ─── RENDER ───

  if (gameState === 'menu') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding: 20, background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgAlt} 100%)`, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign:'center', marginBottom: 20 }}>
          <div style={{ fontSize: 80 }}>🔤</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', color: C.text }}>
            <span style={{ color: C.pink }}>Alphabet</span>{' '}
            <span style={{ color: C.teal }}>Runner</span>
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Collect letters <strong>a → p</strong> in order!</p>
        </div>

        <div style={{ background:'white', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', boxShadow: '0 6px 24px rgba(0,0,0,0.1)', marginBottom: 20 }}>
          <p style={{ color: C.text, fontWeight: 600, marginBottom: 8 }}>📜 Rules:</p>
          <p style={{ color: '#555', marginBottom: 6 }}>🎯 Find the <strong>next letter</strong> (highlighted in teal)</p>
          <p style={{ color: '#555', marginBottom: 6 }}>✅ Right letter = <span style={{ color: C.teal }}>+10 points</span> & hear the letter!</p>
          <p style={{ color: '#555', marginBottom: 6 }}>❌ Wrong letter = <span style={{ color: C.red }}>lose 1 melon 🍈</span></p>
          <p style={{ color: '#555', marginBottom: 6 }}>⏱️ Play fast — time counts!</p>
          <p style={{ color: '#555' }}>🏆 Collect all 16 letters to win!</p>
        </div>

        <button onClick={initGame} style={{
          background: `linear-gradient(135deg, ${C.pink}, #ff6b8a)`,
          color: 'white', border: 'none', padding: '16px 48px', fontSize: '1.3rem', fontWeight: 700,
          borderRadius: 50, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
          boxShadow: '0 4px 15px rgba(255,77,112,0.4)', marginRight: 10,
        }}>
          ▶️ Play Now!
        </button>

        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button onClick={toggleMusic} style={{
            background: musicOn ? C.teal : '#ccc', color: 'white', border: 'none',
            padding: '8px 20px', borderRadius: 50, cursor: 'pointer', fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            {musicOn ? '🔊 Music ON' : '🔇 Music OFF'}
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div style={{ background:'white', borderRadius: 16, padding: 20, maxWidth: 380, width: '100%', marginTop: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', color: C.text, marginBottom: 10 }}>🏆 Leaderboard</h3>
            {leaderboard.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '0.95rem' }}>
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} {e.name}</span>
                <span><strong>{e.score}</strong> pts · {formatTime(e.time)}</span>
              </div>
            ))}
          </div>
        )}

        <a href="/" style={{ marginTop: 20, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>← Back to Games</a>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minHeight:'100vh', padding: 10, background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
        {/* HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8, background: 'white', padding: '10px 24px', borderRadius: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>🎯 Next: <span style={{ color: C.teal, fontSize: '1.3rem' }}>{LETTERS[currentIdx]?.toUpperCase()}</span></span>
          <span style={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>⭐ {score}</span>
          <span style={{ fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>⏱️ {formatTime(timer)}</span>
          <span style={{ fontWeight: 600 }}>{'🍈'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}</span>
          <button onClick={toggleMusic} style={{ background: musicOn ? C.teal : '#ccc', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 50, cursor: 'pointer', fontSize: '0.8rem' }}>
            {musicOn ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LETTERS.map((l, i) => (
            <span key={l} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 700,
              background: i < currentIdx ? C.teal : i === currentIdx ? C.pink : '#e0e0e0',
              color: i < currentIdx || i === currentIdx ? 'white' : '#999',
              fontFamily: 'Montserrat, sans-serif',
            }}>
              {i < currentIdx ? '✓' : l.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Flash message */}
        {flashMsg && (
          <div style={{
            padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: '1rem',
            background: flashColor === C.teal ? '#e0fff9' : '#fde8e8',
            color: flashColor, marginBottom: 4, fontFamily: 'Montserrat, sans-serif',
            animation: 'popIn 0.3s ease',
          }}>
            {flashMsg}
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `4px solid ${C.teal}`, maxWidth: '100%', touchAction: 'none' }}
        />

        {/* Mobile controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>
          <button
            onClick={() => handleMobileKey('ArrowUp')}
            style={{ background:'white', border:`2px solid ${C.teal}`, borderRadius:12, width:56, height:56, fontSize:'1.5rem', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
          >⬆️</button>
          <div style={{ display:'flex', gap:8 }}>
            <button
              onClick={() => handleMobileKey('ArrowLeft')}
              style={{ background:'white', border:`2px solid ${C.teal}`, borderRadius:12, width:56, height:56, fontSize:'1.5rem', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
            >⬅️</button>
            <button
              onClick={() => handleMobileKey('ArrowDown')}
              style={{ background:'white', border:`2px solid ${C.teal}`, borderRadius:12, width:56, height:56, fontSize:'1.5rem', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
            >⬇️</button>
            <button
              onClick={() => handleMobileKey('ArrowRight')}
              style={{ background:'white', border:`2px solid ${C.teal}`, borderRadius:12, width:56, height:56, fontSize:'1.5rem', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
            >➡️</button>
          </div>
        </div>

        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  if (gameState === 'gameover') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding: 20, background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgAlt} 100%)`, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ background:'white', borderRadius: 24, padding: 40, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', textAlign:'center' }}>
          <div style={{ fontSize: 60 }}>😢</div>
          <h2 style={{ fontSize: '2rem', color: C.text, fontFamily: 'Montserrat, sans-serif', marginBottom: 15 }}>Game Over!</h2>
          <p style={{ fontSize: '1.3rem', marginBottom: 8 }}>You reached letter <strong style={{ color: C.pink }}>{(LETTERS[currentIdx] || 'p').toUpperCase()}</strong></p>
          <p style={{ fontSize: '1.1rem', marginBottom: 5 }}>⭐ Score: <strong>{score}</strong></p>
          <p style={{ fontSize: '1.1rem', marginBottom: 20 }}>⏱️ Time: <strong>{formatTime(timer)}</strong></p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: C.text }}>Enter your name:</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveScore() }}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: `2px solid ${C.bgAlt}`,
                fontSize: '1.1rem', outline: 'none', textAlign: 'center', fontFamily: 'Montserrat, sans-serif',
              }}
            />
            <button onClick={saveScore} disabled={!playerName.trim()} style={{
              marginTop: 10, background: playerName.trim() ? `linear-gradient(135deg, ${C.pink}, #ff6b8a)` : '#ccc',
              color: 'white', border: 'none', padding: '12px 32px', borderRadius: 50, fontWeight: 700,
              cursor: playerName.trim() ? 'pointer' : 'default', fontSize: '1rem', fontFamily: 'Montserrat, sans-serif',
            }}>
              💾 Save Score
            </button>
          </div>

          <button onClick={initGame} style={{
            background: `linear-gradient(135deg, ${C.pink}, #ff6b8a)`,
            color: 'white', border: 'none', padding: '14px 40px', fontSize: '1.2rem', fontWeight: 700,
            borderRadius: 50, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 4px 15px rgba(255,77,112,0.4)',
          }}>
            🔄 Play Again
          </button>
          <br />
          <button onClick={() => setGameState('menu')} style={{
            marginTop: 10, background: C.teal, color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: 50, cursor: 'pointer', fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            🏠 Menu
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'win') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding: 20, background: `linear-gradient(135deg, #fff9e6 0%, ${C.bgAlt} 100%)`, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ background:'white', borderRadius: 24, padding: 40, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', textAlign:'center' }}>
          <div style={{ fontSize: 80 }}>🎉</div>
          <h2 style={{ fontSize: '2.5rem', color: C.text, fontFamily: 'Montserrat, sans-serif', marginBottom: 10 }}>
            Amazing!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: 15 }}>
            You collected all 16 letters a → p!
          </p>
          <p style={{ fontSize: '1.3rem', marginBottom: 5 }}>⭐ Score: <strong style={{ color: C.pink }}>{score}</strong></p>
          <p style={{ fontSize: '1.3rem', marginBottom: 5 }}>⏱️ Time: <strong style={{ color: C.teal }}>{formatTime(timer)}</strong></p>
          <p style={{ fontSize: '1.1rem', marginBottom: 20 }}>🍈 Lives left: {'🍈'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: C.text }}>Enter your name for the leaderboard:</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveScore() }}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: `2px solid ${C.bgAlt}`,
                fontSize: '1.1rem', outline: 'none', textAlign: 'center', fontFamily: 'Montserrat, sans-serif',
              }}
            />
            <button onClick={saveScore} disabled={!playerName.trim()} style={{
              marginTop: 10, background: playerName.trim() ? `linear-gradient(135deg, ${C.pink}, #ff6b8a)` : '#ccc',
              color: 'white', border: 'none', padding: '12px 32px', borderRadius: 50, fontWeight: 700,
              cursor: playerName.trim() ? 'pointer' : 'default', fontSize: '1rem', fontFamily: 'Montserrat, sans-serif',
            }}>
              💾 Save Score
            </button>
          </div>

          <button onClick={initGame} style={{
            background: `linear-gradient(135deg, ${C.pink}, #ff6b8a)`,
            color: 'white', border: 'none', padding: '14px 40px', fontSize: '1.2rem', fontWeight: 700,
            borderRadius: 50, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 4px 15px rgba(255,77,112,0.4)',
          }}>
            🔄 Play Again
          </button>
          <br />
          <button onClick={() => setGameState('menu')} style={{
            marginTop: 10, background: C.teal, color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: 50, cursor: 'pointer', fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
          }}>
            🏠 Menu
          </button>
        </div>
      </div>
    )
  }

  return null
}