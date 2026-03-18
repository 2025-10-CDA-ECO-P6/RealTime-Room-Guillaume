import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createDeck, shuffleDeck, drawCard, isBust, addCard, clearHand, calculateTurnScore, addToTotalScore, winningCondition, flip7 } from './game/flip7'
import type { Card } from './game/flip7'

const app = express()

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

type GameState = {
  hand: Card[]
  deck: Card[]
  discardPile: Card[] 
  totalScore: number
  isBust: boolean
  isGameOver: boolean
}

const gameStates = new Map<string, GameState>()

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('join_room', (room: string) => {
    socket.join(room)
    console.log(`${socket.id} joined room: ${room}`)
  })

  socket.on('send_message', (data: { room: string; pseudo: string; message: string }) => {
    io.to(data.room).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    gameStates.delete(socket.id)
  })

  socket.on('game_start', () => {
    const deck = shuffleDeck(createDeck())
    const state: GameState = {
      hand: [],
      deck,
      discardPile: [],
      totalScore: 0,
      isBust: false,
      isGameOver: false
    }
    gameStates.set(socket.id, state)
    socket.emit('game_state', state)
  })

  socket.on('draw_card', () => {
    const state = gameStates.get(socket.id)
    if (!state) return

    if (state.deck.length === 0) {
      state.deck = shuffleDeck(state.discardPile)
      state.discardPile = []
    }

    const { card, remainingDeck } = drawCard(state.deck)
    
    if (isBust(card, state.hand)) {
      state.discardPile = [...state.discardPile, ...state.hand]
      state.hand = clearHand(state.hand)
      state.isBust = true
      state.deck = remainingDeck
    } else {
      state.hand = addCard(card, state.hand)
      state.deck = remainingDeck
      state.isBust = false
    }

    socket.emit('game_state', state)
    gameStates.set(socket.id, state)
  })

  socket.on('stop', () => {
    const state = gameStates.get(socket.id)
    if (!state) return

    const roundScore = calculateTurnScore(state.hand)
    state.totalScore = addToTotalScore(state.totalScore, roundScore)
    state.isGameOver = winningCondition(state.totalScore)
    state.discardPile = [...state.discardPile, ...state.hand]
    state.hand = clearHand(state.hand)

    socket.emit('game_state', state)
    gameStates.set(socket.id, state)
  })
})

httpServer.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})