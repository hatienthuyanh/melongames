'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Game constants
const CELL_SIZE = 60
const GRID_COLS = 12
const GRID_ROWS = 8
const GAME_WIDTH = GRID_COLS * CELL_SIZE
const GAME_HEIGHT = GRID_ROWS * CELL_SIZE

// WatermelonEdu brand colors
const COLORS = {
  pink: '#ff4d70',
  teal: '#00bdb6',
  bg: '#f0fffe',
  bgAlt: '#d1f9f1',
  text: '#0c3633',
  white: '#ffffff',
}

// Word list for kids (A1 level)
const WORDS = [
  'cat', 'dog', 'sun', 'run', 'big', 'red', 'hat', 'cup',
  'book', 'ball', 'fish', 'bird', 'tree', 'house', 'milk', 'water',
  'apple', 'table', 'chair', 'happy', 'good', 'blue', 'green', 'jump'
]

interface GameObject {
  x: number
  y: number
  emoji: string
  isWord?: boolean
  word?: string
}

interface Obstacle {
  x: number
  y: number
  direction: number
  speed: number
}

export default function MelonRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [showWord, setShowWord] = useState(false)
  const [collectedWord, setCollectedWord] = useState('')

  const playerRef = useRef({ x: 0, y: 0 })
  const playerPosRef = useRef({ x: 0, y: 0 })
  const collectiblesRef = useRef<GameObject[]>([])
  const obstaclesRef = useRef<Obstacle[]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const frameRef = useRef(0)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover'>('menu')
  const showWordTimerRef = useRef(0)
  const collectedWordRef = useRef('')

  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { levelRef.current = level }, [level])
  useEffect(() => { showWordTimerRef.current = showWord ? 120 : 0 }, [showWord])
  useEffect(() => { collectedWordRef.current = collectedWord }, [collectedWord])

  const initGame = useCallback(() => {
    playerRef.current = { x: 1, y: Math.floor(GRID_ROWS / 2) }
    playerPosRef.current = { x: 1, y: Math.floor(GRID_ROWS / 2) }
    collectiblesRef.current = []
    obstaclesRef.current = []
    scoreRef.current = 0
    levelRef.current = 1
    showWordTimerRef.current = 0
    collectedWordRef.current = ''
    setScore(0)
    setLevel(1)
    setShowWord(false)
    setCollectedWord('')
    for (let i = 0; i < 3; i++) spawnCollectible()
    setGameState('playing')
  }, [])

  const spawnCollectible = () => {
    const x = GRID_COLS - 1
    const y = Math.floor(Math.random() * GRID_ROWS)
    const isWord = Math.random() > 0.5
    const word = isWord ? WORDS[Math.floor(Math.random() * WORDS.length)] : undefined
    collectiblesRef.current.push({ x, y, emoji: isWord ? '📝' : '🍎', isWord, word })
  }

  const spawnObstacle = () => {
    const y = Math.floor(Math.random() * GRID_ROWS)
    obstaclesRef.current.push({ x: 0, y, direction: 1, speed: 1 + levelRef.current * 0.3 })
  }

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.strokeStyle = COLORS.bgAlt
    ctx.lineWidth = 1
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, GAME_HEIGHT); ctx.stroke()
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(GAME_WIDTH, y * CELL_SIZE); ctx.stroke()
    }
    collectiblesRef.current.forEach(item => {
      ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(item.emoji, item.x * CELL_SIZE + CELL_SIZE / 2, item.y * CELL_SIZE + CELL_SIZE / 2)
    })
    obstaclesRef.current.forEach(obs => {
      ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('💥', obs.x * CELL_SIZE + CELL_SIZE / 2, obs.y * CELL_SIZE + CELL_SIZE / 2)
    })
    ctx.font = '36px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🍉', playerRef.current.x * CELL_SIZE + CELL_SIZE / 2, playerRef.current.y * CELL_SIZE + CELL_SIZE / 2)
  }, [])

  const updateGame = useCallback(() => {
    if (gameStateRef.current !== 'playing') return
    frameRef.current++
    const keys = keysRef.current
    let dx = 0, dy = 0
    if (keys.has('ArrowUp')) dy = -1
    if (keys.has('ArrowDown')) dy = 1
    if (keys.has('ArrowLeft')) dx = -1
    if (keys.has('ArrowRight')) dx = 1
    if (dx !== 0 || dy !== 0) {
      const newX = Math.max(0, Math.min(GRID_COLS - 1, playerRef.current.x + dx))
      const newY = Math.max(0, Math.min(GRID_ROWS - 1, playerRef.current.y + dy))
      playerRef.current.x = newX; playerRef.current.y = newY
      playerPosRef.current = { x: newX, y: newY }
      keys.delete('ArrowUp'); keys.delete('ArrowDown'); keys.delete('ArrowLeft'); keys.delete('ArrowRight')
    }
    collectiblesRef.current.forEach(item => {
      item.x -= 0.02
      if (item.x < -0.5) { item.x = GRID_COLS - 1; item.y = Math.floor(Math.random() * GRID_ROWS) }
    })
    obstaclesRef.current.forEach(obs => {
      obs.x += obs.speed * obs.direction * 0.015
      if (obs.x > GRID_COLS || obs.x < -1) { obs.x = 0; obs.y = Math.floor(Math.random() * GRID_ROWS) }
    })
    collectiblesRef.current = collectiblesRef.current.filter(item => {
      const px = playerRef.current.x, py = playerRef.current.y
      const ix = Math.round(item.x), iy = item.y
      if (ix === px && iy === py) {
        scoreRef.current += item.isWord ? 20 : 10
        const newLevel = Math.floor(scoreRef.current / 100) + 1
        if (newLevel > levelRef.current) { levelRef.current = newLevel; setLevel(newLevel); if (newLevel > 1) spawnObstacle() }
        if (item.isWord && item.word) { setShowWord(true); setCollectedWord(item.word); showWordTimerRef.current = 120 }
        setScore(scoreRef.current)
        return false
      }
      return true
    })
    if (showWordTimerRef.current > 0) {
      showWordTimerRef.current--
      if (showWordTimerRef.current <= 0) { setShowWord(false); setCollectedWord('') }
    }
    obstaclesRef.current.forEach(obs => {
      if (Math.round(obs.x) === playerRef.current.x && obs.y === playerRef.current.y) {
        if (scoreRef.current > highScore) setHighScore(scoreRef.current)
        gameStateRef.current = 'gameover'; setGameState('gameover')
      }
    })
    if (frameRef.current % 120 === 0) spawnCollectible()
    if (levelRef.current > 1 && frameRef.current % 180 === 0) spawnObstacle()
  }, [highScore])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationId: number
    const gameLoop = () => { updateGame(); drawGame(ctx); animationId = requestAnimationFrame(gameLoop) }
    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState, updateGame, drawGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); keysRef.current.add(e.key) }
    }
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current.delete(e.key) }
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: 20, background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgAlt} 100%)`, fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
          <span style={{ color: COLORS.pink }}>Melon</span>{' '}
          <span style={{ color: COLORS.teal }}>Runner</span>
        </h1>
        <a href="/" style={{ color: COLORS.teal, textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Games</a>
      </div>

      {gameState === 'menu' && (
        <div style={{ background:'white', borderRadius: 24, padding: 40, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🍉</div>
          <h2 style={{ fontSize: '2rem', color: COLORS.text, fontFamily: 'Montserrat, sans-serif', marginBottom: 15 }}>Melon Runner</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>Use <strong>⬆️⬇️⬅️➡️</strong> Arrow Keys to move</p>
          <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12, marginBottom: 20, textAlign: 'left' }}>
            <p style={{ color: COLORS.text }}>🍎 Collect fruits = <span style={{ color: COLORS.teal }}>+10 points</span></p>
            <p style={{ color: COLORS.text }}>📝 Collect words = <span style={{ color: COLORS.pink }}>+20 points</span></p>
            <p style={{ color: COLORS.text }}>💥 Avoid obstacles!</p>
          </div>
          <button onClick={initGame} style={{
            background: `linear-gradient(135deg, ${COLORS.pink}, #ff6b8a)`, color: 'white', border: 'none',
            padding: '16px 48px', fontSize: '1.3rem', fontWeight: 700, borderRadius: 50, cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 15px rgba(255,77,112,0.4)',
          }}>▶️ Play Now!</button>
          {highScore > 0 && <p style={{ marginTop: 15, color: COLORS.teal, fontWeight: 600 }}>🏆 High Score: {highScore}</p>}
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display:'flex', gap:30, marginBottom:15, background:'white', padding:'12px 30px', borderRadius:50, boxShadow:'0 4px 15px rgba(0,0,0,0.1)', fontSize:'1.1rem', fontWeight:600, fontFamily:'Montserrat, sans-serif' }}>
            <span>🎯 Score: {score}</span>
            <span>📊 Level: {level}</span>
          </div>
          <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', border:`4px solid ${COLORS.teal}` }} />
          {showWord && (
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', padding:'30px 50px', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', textAlign:'center', zIndex:10 }}>
              <p style={{ color:'#666', marginBottom:8 }}>You collected:</p>
              <p style={{ fontSize:'2.5rem', fontWeight:700, color:COLORS.pink, fontFamily:'Montserrat, sans-serif' }}>{collectedWord}</p>
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ background:'white', borderRadius: 24, padding: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontSize:'2rem', color:COLORS.text, marginBottom:20 }}>😢 Game Over!</h2>
          <p style={{ fontSize:'1.5rem', marginBottom:10 }}>Your Score: <strong style={{ color:COLORS.pink }}>{score}</strong></p>
          <p style={{ marginBottom:15 }}>Level Reached: {level}</p>
          {score >= highScore && score > 0 && <p style={{ color:COLORS.teal, fontWeight:700, fontSize:'1.3rem', marginBottom:20 }}>🎉 New High Score!</p>}
          <button onClick={initGame} style={{
            background: `linear-gradient(135deg, ${COLORS.pink}, #ff6b8a)`, color:'white', border:'none',
            padding:'16px 48px', fontSize:'1.2rem', fontWeight:700, borderRadius:50, cursor:'pointer',
            fontFamily:'Montserrat, sans-serif', boxShadow:'0 4px 15px rgba(255,77,112,0.4)',
          }}>🔄 Play Again</button>
          <br />
          <button onClick={() => setGameState('menu')} style={{
            marginTop:10, background:COLORS.teal, color:'white', border:'none',
            padding:'10px 24px', borderRadius:50, cursor:'pointer', fontWeight:600,
            fontFamily:'Montserrat, sans-serif',
          }}>🏠 Menu</button>
        </div>
      )}
      <footer style={{ marginTop:'auto', paddingTop:30, color:'#999', fontSize:'0.85rem' }}>
        Made with 💖 by <span style={{ color:COLORS.pink }}>WatermelonEdu</span>
      </footer>
    </div>
  )
}