'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface Item {
  x: number
  y: number
  char: string
  collected: boolean
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerPos, setPlayerPos] = useState<Position>({ x: 2, y: 2 })
  const [items, setItems] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const GRID_SIZE = 10
  const CELL_SIZE = 50

  const words = ['APPLE', 'BANANA', 'WATER', 'MELON', 'GRAPE', 'ORANGE']

  const initGame = useCallback(() => {
    const newItems: Item[] = []
    for (let i = 0; i < 5; i++) {
      newItems.push({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        char: words[Math.floor(Math.random() * words.length)],
        collected: false,
      })
    }
    setItems(newItems)
    setPlayerPos({ x: 2, y: 2 })
    setScore(0)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        setGameStarted(true)
        initGame()
      }

      setPlayerPos(prev => {
        let newX = prev.x
        let newY = prev.y

        if (e.key === 'ArrowUp') newY = Math.max(0, prev.y - 1)
        if (e.key === 'ArrowDown') newY = Math.min(GRID_SIZE - 1, prev.y + 1)
        if (e.key === 'ArrowLeft') newX = Math.max(0, prev.x - 1)
        if (e.key === 'ArrowRight') newX = Math.min(GRID_SIZE - 1, prev.x + 1)

        const newPos = { x: newX, y: newY }

        setItems(prevItems => {
          const updated = prevItems.map(item => {
            if (item.x === newPos.x && item.y === newPos.y && !item.collected) {
              setScore(s => s + 10)
              return { ...item, collected: true }
            }
            return item
          })
          return updated
        })

        return newPos
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, initGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background (light teal)
    ctx.fillStyle = '#d1f9f1'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#00bdb6'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(canvas.width, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw items
    items.forEach(item => {
      if (!item.collected) {
        ctx.fillStyle = '#ff4d70'
        ctx.beginPath()
        ctx.arc(
          item.x * CELL_SIZE + CELL_SIZE / 2,
          item.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 3,
          0,
          Math.PI * 2
        )
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Nunito, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.char[0], item.x * CELL_SIZE + CELL_SIZE / 2, item.y * CELL_SIZE + CELL_SIZE / 2)
      }
    })

    // Draw player (big pink circle)
    ctx.fillStyle = '#ff4d70'
    ctx.beginPath()
    ctx.arc(
      playerPos.x * CELL_SIZE + CELL_SIZE / 2,
      playerPos.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 5,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 20px Montserrat, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🏃', playerPos.x * CELL_SIZE + CELL_SIZE / 2, playerPos.y * CELL_SIZE + CELL_SIZE / 2)

  }, [playerPos, items])

  const handleRestart = () => {
    initGame()
    setGameStarted(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fffe 0%, #d1f9f1 100%)',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
    }}>
      <h1 style={{
        fontFamily: 'Montserrat, sans-serif',
        color: '#0c3633',
        fontSize: '32px',
        marginBottom: '10px',
      }}>
        🎮 Melon Runner
      </h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#ff4d70',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
        }}>
          ⭐ Score: {score}
        </div>
        <div style={{
          background: '#00bdb6',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontSize: '18px',
        }}>
          🎯 Collect the circles!
        </div>
      </div>

      <div style={{
        background: '#0c3633',
        padding: '15px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(12, 54, 51, 0.3)',
      }}>
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          style={{ borderRadius: '10px' }}
        />
      </div>

      <p style={{
        color: '#0c3633',
        marginTop: '20px',
        fontSize: '16px',
        fontWeight: 'bold',
      }}>
        ⌨️ Use <span style={{ color: '#ff4d70' }}>Arrow Keys</span> to move!
      </p>

      {!gameStarted && (
        <p style={{ color: '#ff4d70', marginTop: '10px' }}>
          👆 Press any arrow key to start!
        </p>
      )}

      <button
        onClick={handleRestart}
        style={{
          marginTop: '20px',
          background: '#ff4d70',
          color: 'white',
          border: 'none',
          padding: '12px 30px',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        🔄 Play Again
      </button>
    </div>
  )
}
