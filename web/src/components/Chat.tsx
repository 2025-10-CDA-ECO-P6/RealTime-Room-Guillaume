import { useState, useEffect } from 'react'
import socket from '../socket'

interface Message {
  room: string
  pseudo: string
  message: string
}

export default function Chat() {
  const [room, setRoom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      socket.off('receive_message')
    }
  }, [])

  const joinRoom = () => {
    if (room && pseudo) {
      socket.emit('join_room', room)
      setJoined(true)
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
      <div>
        <input placeholder="Pseudo" onChange={(e) => setPseudo(e.target.value)} />
        <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} />
        <button onClick={joinRoom}>Rejoindre</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Room : {room}</h2>
      <div>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.pseudo}</strong> : {msg.message}</p>
        ))}
      </div>
      <input
        value={message}
        placeholder="Message"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  )
}