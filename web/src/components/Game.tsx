import { useState, useEffect } from 'react'
import socket from '../socket'

interface Card {
  value: number
  type: 'number' | 'bonus' | 'double' | 'action'
  effect?: 'freeze' | 'flip_three' | 'second_chance'
}

interface Player {
  socketId: string
  pseudo: string
  hand: Card[]
  totalScore: number
  isBust: boolean
  hasStopped: boolean
  isReady: boolean
}

interface RoomState {
  deck: Card[]
  discardPile: Card[]
  players: Player[]
  currentPlayerIndex: number
  isGameStarted: boolean
  isGameOver: boolean
}

interface GameProps {
  room: string
  pseudo: string
}

export default function Game({ room, pseudo }: GameProps) {
  const [roomState, setRoomState] = useState<RoomState | null>(null)

  useEffect(() => {
    socket.on('room_state', (state: RoomState) => {
      setRoomState(state)
    })
    return () => {
      socket.off('room_state')
    }
  }, [])

  const me = roomState?.players.find(p => p.socketId === socket.id)
  const currentPlayer = roomState?.players[roomState.currentPlayerIndex]
  const isMyTurn = currentPlayer?.socketId === socket.id

  const handleReady = () => socket.emit('player_ready', room)
  const handleDraw = () => socket.emit('draw_card', room)
  const handleStop = () => socket.emit('stop', room)

  return (
    <div className="game">
      <div className="game__header">
        <h2 className="game__title">Flip 7</h2>
        {me && <span className="game__score">Total : {me.totalScore}</span>}
      </div>

      <div className="game__board">
        {!roomState?.isGameStarted && (
          <button className="game__btn" onClick={handleReady}
            disabled={me?.isReady}>
            {me?.isReady ? 'En attente...' : 'Prêt !'}
          </button>
        )}

        {roomState?.isGameStarted && (
          <>
            <div className="game__players">
              {roomState.players.map((p, i) => (
                <div key={p.socketId} className={`game__player ${i === roomState.currentPlayerIndex ? 'game__player--active' : ''}`}>
                  <span>{p.pseudo} — {p.totalScore} pts</span>
                  {p.isBust && <span> 💥</span>}
                  {p.hasStopped && <span> ✋</span>}
                </div>
              ))}
            </div>

            <div className="game__hand">
              {me?.hand.map((card, i) => (
                <div key={i} className={`game__card game__card--${card.type}`}>
                  {card.type === 'double' ? 'x2' : card.type === 'bonus' ? `+${card.value}` : card.value}
                </div>
              ))}
            </div>
          </>
        )}

        {roomState?.isGameOver && (
          <p className="game__win">🎉 Victoire !</p>
        )}
      </div>

      {roomState?.isGameStarted && !roomState.isGameOver && (
        <div className="game__controls">
          <button className="game__btn" onClick={handleDraw}
            disabled={!isMyTurn || me?.isBust || me?.hasStopped}>
            Piocher
          </button>
          <button className="game__btn game__btn--stop" onClick={handleStop}
            disabled={!isMyTurn || me?.isBust || me?.hasStopped}>
            Stop
          </button>
        </div>
      )}
    </div>
  )
}