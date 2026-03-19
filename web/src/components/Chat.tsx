import { useState, useEffect, useRef } from 'react'
import socket from '../socket'

interface Message {
  room: string
  pseudo: string
  message: string
}

interface ChatProps {
  onJoin: (roomName: string) => void
}

export default function Chat({ onJoin }: ChatProps) {
  const [room, setRoom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data])
    })

    socket.on('game_in_progress', () => {
      alert('Une partie est déjà en cours dans cette room, réessaie plus tard !')
      setJoined(false)
    })

    socket.once('room_state', () => {
      setJoined(true)
      onJoin(roomRef.current)
    })

    return () => {
      socket.off('receive_message')
      socket.off('game_in_progress') 
      socket.off('room_error')
      socket.off('room_state')
    }
  }, [])

  const roomRef = useRef('')


  const joinRoom = () => {
    if (room && pseudo) {
      socket.emit('join_room', { room, pseudo })
    }
  }

  const sendMessage = () => {
    if (message) {
      socket.emit('send_message', { room, pseudo, message })
      setMessage('')
    }
  }

  if (!joined) {
    return (
      <div className="join-room">
        <h2 className="join-room__title">Rejoindre une room</h2>
        <div className="join-room__form">
          <input
            className="join-room__input"
            placeholder="Pseudo"
            onChange={(e) => setPseudo(e.target.value)}
          />
          <input
            className="join-room__input"
            placeholder="Room"
            onChange={(e) => { setRoom(e.target.value); roomRef.current = e.target.value }}
          />
          <button className="join-room__btn" onClick={joinRoom}>
            Rejoindre
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat">
      <div className="chat__header">
        <h2 className="chat__title">Chat</h2>
        <span className="chat__room-badge">{room}</span>
      </div>
      <div className="chat__messages">
        {messages.length === 0 && (
          <span className="chat__empty">Aucun message pour l'instant...</span>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat__message ${msg.pseudo === pseudo ? 'chat__message--own' : ''}`}
          >
            <span className="chat__pseudo">{msg.pseudo}</span>
            <div className="chat__bubble">{msg.message}</div>
          </div>
        ))}
      </div>
      <div className="chat__form">
        <input
          className="chat__input"
          value={message}
          placeholder="Ton message..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="chat__btn" onClick={sendMessage}>
          Envoyer
        </button>
      </div>
    </div>
  )
}