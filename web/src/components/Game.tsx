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
  isFrozen: boolean
}

interface RoomState {
  deck: Card[]
  discardPile: Card[]
  players: Player[]
  currentPlayerIndex: number
  isGameStarted: boolean
  isGameOver: boolean
  lastDrawnCard: Card | null
  isRoundOver: boolean
  pendingSecondChance: boolean
  pendingFreeze: boolean
  pendingFlipThree: {
    targetId: string
    cardsLeft: number
    pendingFreeze: boolean
    pendingFlipThreeCard: boolean
  } | null
}

interface GameProps {
  room: string
}

export default function Game({ room }: GameProps) {
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
              {roomState.pendingSecondChance && isMyTurn && (
                <div className="game__sc-picker">
                  <span className="game__sc-label">Donne ta Seconde Chance à :</span>
                  {roomState.players
                    .filter(p => p.socketId !== socket.id && !p.hand.some(c => c.effect === 'second_chance') && !p.isBust && !p.hasStopped && !p.isFrozen)
                    .map(p => (
                      <button
                        key={p.socketId}
                        className="game__btn game__btn--sc"
                        onClick={() => socket.emit('give_second_chance', { room, targetId: p.socketId })}
                      >
                        {p.pseudo}
                      </button>
                    ))
                  }
                </div>
              )}

              {roomState.pendingFreeze && isMyTurn && (
                <div className="game__freeze-picker">
                  <span className="game__freeze-label">Gèle un joueur :</span>
                  {roomState.players
                    .filter(p => !p.isFrozen && !p.isBust && !p.hasStopped)
                    .map(p => (
                      <button
                        key={p.socketId}
                        className="game__btn game__btn--freeze"
                        onClick={() => socket.emit('choose_freeze_target', { room, targetId: p.socketId })}
                      >
                        {p.pseudo} {p.socketId === socket.id ? '(moi)' : ''}
                      </button>
                    ))
                  }
                </div>
              )}

              {roomState.pendingFlipThree && !roomState.pendingFlipThree.targetId && isMyTurn && (
                <div className="game__flip-three-picker">
                  <span className="game__flip-three-label">Flip Three — Choisis une cible :</span>
                  {roomState.players
                    .filter(p => !p.isBust && !p.hasStopped && !p.isFrozen)
                    .map(p => (
                      <button
                        key={p.socketId}
                        className="game__btn game__btn--flip-three"
                        onClick={() => socket.emit('choose_flip_three_target', { room, targetId: p.socketId })}
                      >
                        {p.pseudo} {p.socketId === socket.id ? '(moi)' : ''}
                      </button>
                    ))
                  }
                </div>
              )}

              {roomState.players.map((p, i) => (
                <div key={p.socketId} className={`game__player ${i === roomState.currentPlayerIndex ? 'game__player--active' : ''}`}>
                  <span className="game__player-indicator">{i === roomState.currentPlayerIndex ? '▶' : ''}</span>
                  <span>{p.pseudo} — {p.totalScore} pts</span>
                  {p.isBust && <span> 💥</span>}
                  {p.hasStopped && <span> ✋</span>}
                  {p.isFrozen && <span> ❄️</span>}
                </div>
              ))}
            </div>
            
            {roomState.lastDrawnCard && (
              <div className="game__last-card">
                <span className="game__last-card-label">Dernière carte piochée</span>
                <div className={`game__card game__card--${roomState.lastDrawnCard.type} ${roomState.lastDrawnCard.effect ? `game__card--${roomState.lastDrawnCard.effect}` : ''}`}>
                  {roomState.lastDrawnCard.effect === 'second_chance' ? '❤️'
                    : roomState.lastDrawnCard.effect === 'freeze' ? '❄️'
                    : roomState.lastDrawnCard.effect === 'flip_three' ? '🃏'
                    : roomState.lastDrawnCard.type === 'double' ? 'x2'
                    : roomState.lastDrawnCard.type === 'bonus' ? `+${roomState.lastDrawnCard.value}`
                    : roomState.lastDrawnCard.value}
                </div>
              </div>
            )}

            <div className="game__hands">
              {roomState.players.map((p) => (
                <div key={p.socketId} className={`game__player-hand ${p.isBust ? 'game__player-hand--bust' : ''}`}>
                  <span className="game__player-hand-label">
                    {p.pseudo} {p.socketId === socket.id ? '(moi)' : ''}
                  </span>
                  <div className="game__hand">
                    {p.hand.map((card, i) => (
                      <div key={i} className={`game__card game__card--${card.type} ${card.effect ? `game__card--${card.effect}` : ''}`}>
                        {card.effect === 'second_chance' ? '❤️'
                          : card.type === 'double' ? 'x2' 
                          : card.type === 'bonus' ? `+${card.value}` 
                          : card.value}
                      </div>
                    ))}
                    {p.hand.length === 0 && <span className="game__hand-empty">—</span>}
                  </div>
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
            disabled={!isMyTurn || me?.isBust || me?.hasStopped || roomState.isRoundOver}>
            Piocher
          </button>
          <button className="game__btn game__btn--stop" onClick={handleStop}
            disabled={!isMyTurn || me?.isBust || me?.hasStopped || roomState.isRoundOver}>
            Stop
          </button>
          {roomState.isRoundOver && (
            <button className="game__btn" onClick={() => socket.emit('next_round', room)}>
              Tour suivant ➜
            </button>
          )}
        </div>
      )}

      {roomState?.isGameOver && (
        <div className="game__controls">
          <button className="game__btn" onClick={() => socket.emit('game_reset', room)}>
            Rejouer
          </button>
        </div>
      )}
    </div>
  )
}