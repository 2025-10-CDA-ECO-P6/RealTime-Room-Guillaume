import Chat from './components/Chat'
import Game from './components/Game'
import './styles/main.scss'
import { useState } from 'react'

function App() {
  const [room, setRoom] = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (roomName: string) => {
    setRoom(roomName)
    setJoined(true)
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header__logo">RealTime Room</span>
        {joined && <span className="header__room">{room}</span>}
      </header>
      <main className="app__main">
        <section className="app__chat">
          <Chat onJoin={handleJoin} />
        </section>
        {joined && (
          <section className="app__game">
            <Game room={room} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App