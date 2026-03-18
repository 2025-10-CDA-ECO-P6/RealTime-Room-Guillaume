import { useState, useEffect } from 'react'
import socket from '../socket'

interface Card {
  value: number
  type:'number' | 'bonus' | 'double'
}

interface GameState {
  hand: Card[]
  deck: Card[]
  totalScore: number
  isBust: boolean
  isGameOver: boolean
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    socket.on('game_state', (state: GameState) => {
      setGameState(state)
    })

    return () => {
      socket.off('game_state')
    }
  }, [])

  const handleStart = () => socket.emit('game_start')
  const handleDraw = () => socket.emit('draw_card')
  const handleStop = () => socket.emit('stop')

    return (
      <div className="game">
        <div className="game__header">
        <h2 className="game__title">Flip 7</h2>
        {gameState && (
          <span className="game__score">Total: {gameState.totalScore}</span>
        )}
      </div>

      <div className="game__board">
        {!gameState && (
          <button className="game__btn" onClick={handleStart}>
            Démarrer une partie
          </button>
        )}
        {gameState && gameState.isBust && (
          <p className="game__bust">Bust!</p>
        )}
        {gameState && gameState.isGameOver && (
          <p className="game__game-over">Victoire! {gameState.totalScore} points</p>
        )}
        {gameState && (
          <div className="game__hand">
            {gameState.hand.map((card, index) => (
              <div key={index} className={`game__card game__card--${card.type}`}>
                {card.type === 'double' ? 'x2' : card.type === 'bonus' ? `+${card.value}` : card.value}
              </div>
            ))}
          </div>
        )}
      </div>

      {gameState && !gameState.isGameOver && (
        <div className="game__controls">
          <button className="game__btn" onClick={handleDraw}>
            Piocher
          </button>
          <button className="game__btn" onClick={handleStop}>
            Stop
          </button>
        </div>
      )}

      {gameState && gameState.isGameOver && (
        <div className="game__controls">
          <button className="game__btn" onClick={handleStart}>
            Rejouer
          </button>
        </div>
      )}
    </div>
  )
}