import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createDeck, shuffleDeck, drawCard, isBust, addCard, clearHand, calculateTurnScore, addToTotalScore, winningCondition, flip7 } from './game/flip7'
import type { Card } from './game/flip7'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

type Player = {
  socketId: string
  pseudo: string
  hand: Card[]
  totalScore: number
  isBust: boolean
  hasStopped: boolean
  isReady: boolean
  hasPlayedThisRound: boolean
  isFrozen: boolean
}

type RoomState = {
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

const rooms = new Map<string, RoomState>()

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('join_room', (data: { room: string, pseudo: string }) => { 
       
    if (!/^\d{1,4}$/.test(data.room)) {
      socket.emit('room_error', 'Le nom de room doit contenir entre 1 et 4 chiffres')
      return
    }
    
    socket.join(data.room)

    if (!rooms.has(data.room)) {
      rooms.set(data.room, {
        deck: [],
        discardPile: [],
        players: [],
        currentPlayerIndex: 0,
        isGameStarted: false,
        isGameOver: false,
        lastDrawnCard: null,
        isRoundOver: false,
        pendingSecondChance: false,
        pendingFreeze: false,
        pendingFlipThree: null,
      })
    }

    const roomState = rooms.get(data.room)!

    if (roomState.isGameStarted && !roomState.isGameOver) {
      socket.emit('game_in_progress')
      return
    }

    roomState.players.push({
      socketId: socket.id,
      pseudo: data.pseudo,
      hand: [],
      totalScore: 0,
      isBust: false,
      hasStopped: false,
      isReady: false,
      hasPlayedThisRound: false,
      isFrozen: false,
    })

    io.to(data.room).emit('room_state', roomState)
  })

  socket.on('send_message', (data: { room: string; pseudo: string; message: string }) => {
    io.to(data.room).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    rooms.forEach((roomState, roomName) => {
      roomState.players = roomState.players.filter(p => p.socketId !== socket.id)
      if (roomState.players.length === 0) {
        rooms.delete(roomName)
      } else {
        io.to(roomName).emit('room_state', roomState)
      }
    })
  })

  socket.on('player_ready', (roomName: string) => {
    const roomState = rooms.get(roomName)
    if (!roomState || roomState.isGameStarted) return

    const player = roomState.players.find(p => p.socketId === socket.id)
    if (!player) return
    player.isReady = true

    if (roomState.players.every(p => p.isReady)) {
      roomState.isGameStarted = true
      roomState.deck = shuffleDeck(createDeck())
    }

    io.to(roomName).emit('room_state', roomState)
  })

  socket.on('draw_card', (roomName: string) => {
    const roomState = rooms.get(roomName)
    if (!roomState || !roomState.isGameStarted) return

    const currentPlayer = roomState.players[roomState.currentPlayerIndex]
    if (currentPlayer.socketId !== socket.id) return

    if (roomState.deck.length === 0) {
      roomState.deck = shuffleDeck(roomState.discardPile)
      roomState.discardPile = []
    }

    const result = drawCard(roomState.deck)
    if (!result) return

    const { card, remainingDeck } = result
    roomState.deck = remainingDeck
    roomState.lastDrawnCard = card 

    if (card.type === 'action') {
      if (card.effect === 'second_chance') {
        const hasOne = currentPlayer.hand.some(c => c.effect === 'second_chance')
        
        if (!hasOne) {
          currentPlayer.hand = addCard(card, currentPlayer.hand)
        } else {
          const otherWithoutSC = roomState.players.filter(
            p => p.socketId !== currentPlayer.socketId && 
            !p.hand.some(c => c.effect === 'second_chance') &&
            !p.isBust && 
            !p.hasStopped && 
            !p.isFrozen
          )
          if (otherWithoutSC.length > 0) {
            roomState.pendingSecondChance = true
            currentPlayer.hand = addCard(card, currentPlayer.hand)
          } else {
            roomState.discardPile = [...roomState.discardPile, card]
          }
        }
      } else if (card.effect === 'freeze') {
          roomState.pendingFreeze = true
          roomState.discardPile = [...roomState.discardPile, card]
      } else if (card.effect === 'flip_three') {
        roomState.pendingFlipThree = { targetId: '', cardsLeft: 3, pendingFreeze: false, pendingFlipThreeCard: false }
        roomState.discardPile = [...roomState.discardPile, card]
      } else {
        roomState.discardPile = [...roomState.discardPile, card]
      }
        
        if (roomState.pendingSecondChance || roomState.pendingFreeze || roomState.pendingFlipThree) {
          io.to(roomName).emit('room_state', roomState)
          return
        }

        const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
        if (allDone) {
          roomState.isRoundOver = true
        } else {
          let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
          while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
            next = (next + 1) % roomState.players.length
          }
          roomState.currentPlayerIndex = next
        }

      io.to(roomName).emit('room_state', roomState)
      return
    }

    if (isBust(card, currentPlayer.hand)) {

      const scIndex = currentPlayer.hand.findIndex(c => c.effect === 'second_chance')
      if (scIndex !== -1) {
        const scCard = currentPlayer.hand[scIndex]
        currentPlayer.hand = currentPlayer.hand.filter((_, i) => i !== scIndex)
        roomState.discardPile = [...roomState.discardPile, scCard, card]
        currentPlayer.hasPlayedThisRound = true
        let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
        while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
          next = (next + 1) % roomState.players.length
        }
        roomState.currentPlayerIndex = next
        io.to(roomName).emit('room_state', roomState)
        return
      }
      
      currentPlayer.isBust = true
      currentPlayer.hasPlayedThisRound = true

      const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
      if (allDone) {
        roomState.isRoundOver = true
      } else {
        let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
        while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
          next = (next + 1) % roomState.players.length
        }
        roomState.currentPlayerIndex = next
      }

      io.to(roomName).emit('room_state', roomState)
      return
    }
    
    currentPlayer.hand = addCard(card, currentPlayer.hand)
    currentPlayer.hasPlayedThisRound = true

    const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
    const someoneFlip7 = roomState.players.some(p => flip7(p.hand))

    if (someoneFlip7 || allDone) {
      if (someoneFlip7) {
        roomState.players.forEach(p => {
          if (!p.isBust && !p.hasStopped) {
            const roundScore = calculateTurnScore(p.hand)
            p.totalScore = addToTotalScore(p.totalScore, roundScore)
          }
        })
        roomState.isGameOver = roomState.players.some(p => winningCondition(p.totalScore))
      }
      roomState.isRoundOver = true
    } else {
      let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
      while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
        next = (next + 1) % roomState.players.length
      }
      roomState.currentPlayerIndex = next
    }

    io.to(roomName).emit('room_state', roomState)
  })

  socket.on('stop', (roomName: string) => {
    const roomState = rooms.get(roomName)
    if (!roomState || !roomState.isGameStarted) return

    const currentPlayer = roomState.players[roomState.currentPlayerIndex]
    if (currentPlayer.socketId !== socket.id) return

    const roundScore = calculateTurnScore(currentPlayer.hand)
    currentPlayer.totalScore = addToTotalScore(currentPlayer.totalScore, roundScore)
    currentPlayer.hasStopped = true
    roomState.discardPile = [...roomState.discardPile, ...currentPlayer.hand]
    currentPlayer.hand = clearHand(currentPlayer.hand)
    roomState.isGameOver = winningCondition(currentPlayer.totalScore)

    const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
    const someoneFlip7 = roomState.players.some(p => flip7(p.hand))

  if (someoneFlip7 || allDone) {
    if (someoneFlip7) {
      roomState.players.forEach(p => {
        if (!p.isBust && !p.hasStopped) {
          const roundScore = calculateTurnScore(p.hand)
          p.totalScore = addToTotalScore(p.totalScore, roundScore)
        }
      })
      roomState.isGameOver = roomState.players.some(p => winningCondition(p.totalScore))
    }
    roomState.isRoundOver = true
  } else {
    let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
    while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
      next = (next + 1) % roomState.players.length
    }
    roomState.currentPlayerIndex = next
  }

    io.to(roomName).emit('room_state', roomState)
  })

  socket.on('give_second_chance', (data: { room: string, targetId: string }) => {
    const roomState = rooms.get(data.room)
    if (!roomState || !roomState.pendingSecondChance) return

    const currentPlayer = roomState.players[roomState.currentPlayerIndex]
    if (currentPlayer.socketId !== socket.id) return

    const target = roomState.players.find(p => p.socketId === data.targetId)
    if (!target || target.hand.some(c => c.effect === 'second_chance') || target.isBust || target.hasStopped || target.isFrozen) return

    const scIndex = currentPlayer.hand.findIndex(c => c.effect === 'second_chance')
    const scCard = currentPlayer.hand[scIndex]
    currentPlayer.hand = currentPlayer.hand.filter((_, i) => i !== scIndex)
    target.hand = addCard(scCard, target.hand)
    roomState.pendingSecondChance = false

    const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)

    if (allDone) {
      roomState.isRoundOver = true
    } else {
      let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
      while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
        next = (next + 1) % roomState.players.length
      }
      roomState.currentPlayerIndex = next
    }
    
    io.to(data.room).emit('room_state', roomState)
  })

  socket.on('choose_freeze_target', (data: { room: string, targetId: string }) => {
    const roomState = rooms.get(data.room)
    if (!roomState || !roomState.pendingFreeze) return

    const currentPlayer = roomState.players[roomState.currentPlayerIndex]
    if (currentPlayer.socketId !== socket.id) return

    const target = roomState.players.find(p => p.socketId === data.targetId)
    if (!target || target.isFrozen || target.isBust || target.hasStopped) return

    target.isFrozen = true
    roomState.pendingFreeze = false

    if (roomState.pendingFlipThree?.pendingFlipThreeCard) {
      roomState.pendingFlipThree = { targetId: '', cardsLeft: 3, pendingFreeze: false, pendingFlipThreeCard: false }
      io.to(data.room).emit('room_state', roomState)
      return
    }

    const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
    if (allDone) {
      roomState.isRoundOver = true
    } else {
      let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
      while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
        next = (next + 1) % roomState.players.length
      }
      roomState.currentPlayerIndex = next
    }

    io.to(data.room).emit('room_state', roomState)
  })

  socket.on('choose_flip_three_target', (data: { room: string, targetId: string }) => {
    const roomState = rooms.get(data.room)
    if (!roomState || !roomState.pendingFlipThree || roomState.pendingFlipThree.targetId) return

    const currentPlayer = roomState.players[roomState.currentPlayerIndex]
    if (currentPlayer.socketId !== socket.id) return

    const target = roomState.players.find(p => p.socketId === data.targetId)
    if (!target || target.isBust || target.hasStopped || target.isFrozen) return

    roomState.pendingFlipThree.targetId = data.targetId

    for (let i = 0; i < roomState.pendingFlipThree.cardsLeft; i++) {
      if (roomState.deck.length === 0) {
        roomState.deck = shuffleDeck(roomState.discardPile)
        roomState.discardPile = []
      }

      const result = drawCard(roomState.deck)
      if (!result) break

      const { card: drawnCard, remainingDeck } = result
      roomState.deck = remainingDeck
      roomState.lastDrawnCard = drawnCard

      if (drawnCard.type === 'action') {
        if (drawnCard.effect === 'second_chance') {
          target.hand = addCard(drawnCard, target.hand)
        } else if (drawnCard.effect === 'freeze') {
          roomState.pendingFlipThree!.pendingFreeze = true
          roomState.discardPile = [...roomState.discardPile, drawnCard]
        } else if (drawnCard.effect === 'flip_three') {
          roomState.pendingFlipThree!.pendingFlipThreeCard = true
          roomState.discardPile = [...roomState.discardPile, drawnCard]
        } else {
          roomState.discardPile = [...roomState.discardPile, drawnCard]
        }
        continue
      }

      if (isBust(drawnCard, target.hand)) {
        const scIndex = target.hand.findIndex(c => c.effect === 'second_chance')
        if (scIndex !== -1) {
          const scCard = target.hand[scIndex]
          target.hand = target.hand.filter((_, idx) => idx !== scIndex)
          roomState.discardPile = [...roomState.discardPile, scCard, drawnCard]
        } else {
          target.isBust = true
          roomState.discardPile = [...roomState.discardPile, drawnCard]
          break
        }
      } else {
        target.hand = addCard(drawnCard, target.hand)

        if (flip7(target.hand)) {
          roomState.players.forEach(p => {
            if (!p.isBust && !p.hasStopped) {
              const roundScore = calculateTurnScore(p.hand)
              p.totalScore = addToTotalScore(p.totalScore, roundScore)
            }
            roomState.discardPile = [...roomState.discardPile, ...p.hand]
            p.hand = clearHand(p.hand)
            p.isBust = false
            p.hasStopped = false
            p.isReady = false
            p.hasPlayedThisRound = false
            p.isFrozen = false
          })
          roomState.isGameOver = roomState.players.some(p => winningCondition(p.totalScore))
          roomState.pendingFlipThree = null
          roomState.isRoundOver = true
          io.to(data.room).emit('room_state', roomState)
          return
        }
      }
    }

    if (roomState.pendingFlipThree!.pendingFreeze) {
      roomState.pendingFreeze = true
      roomState.pendingFlipThree!.pendingFreeze = false
      if (!roomState.pendingFlipThree!.pendingFlipThreeCard) {
        roomState.pendingFlipThree = null
      }
      io.to(data.room).emit('room_state', roomState)
      return
    }

    if (roomState.pendingFlipThree!.pendingFlipThreeCard) {
      roomState.pendingFlipThree = { targetId: '', cardsLeft: 3, pendingFreeze: false, pendingFlipThreeCard: false }
      io.to(data.room).emit('room_state', roomState)
      return
    }

    roomState.pendingFlipThree = null

    const allDone = roomState.players.every(p => p.isBust || p.hasStopped || p.isFrozen)
    if (allDone) {
      roomState.isRoundOver = true
    } else {
      let next = (roomState.currentPlayerIndex + 1) % roomState.players.length
      while (roomState.players[next].isBust || roomState.players[next].hasStopped || roomState.players[next].isFrozen) {
        next = (next + 1) % roomState.players.length
      }
      roomState.currentPlayerIndex = next
    }

  io.to(data.room).emit('room_state', roomState)
})

  socket.on('next_round', (roomName: string) => {
    const roomState = rooms.get(roomName)
    if (!roomState || !roomState.isRoundOver) return

    roomState.players.forEach(p => {
      if (p.isFrozen) {
        const roundScore = calculateTurnScore(p.hand)
        p.totalScore = addToTotalScore(p.totalScore, roundScore)
      }
      roomState.discardPile = [...roomState.discardPile, ...p.hand]
      p.hand = clearHand(p.hand)
      p.isBust = false
      p.hasStopped = false
      p.isReady = false
      p.hasPlayedThisRound = false
      p.isFrozen = false
    })
    roomState.isGameOver = roomState.players.some(p => winningCondition(p.totalScore))
    roomState.isRoundOver = false
    roomState.currentPlayerIndex = 0
    roomState.pendingFlipThree = null

    io.to(roomName).emit('room_state', roomState)
  })

  socket.on('game_reset', (roomName: string) => {
    const roomState = rooms.get(roomName)
    if (!roomState || !roomState.isGameOver) return

    roomState.isGameStarted = false
    roomState.isGameOver = false
    roomState.deck = []
    roomState.discardPile = []
    roomState.currentPlayerIndex = 0
    roomState.pendingFlipThree = null
    roomState.players.forEach(p => {
      p.hand = []
      p.isBust = false
      p.hasStopped = false
      p.isReady = false
      p.isFrozen = false
    })

    io.to(roomName).emit('room_state', roomState)
  })
})

httpServer.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})