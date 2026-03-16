import './App.css'
import './styles/main.scss'
import Chat from './components/Chat'
import Game from './components/Game'

function App() {
  return (
    <div className="app">
      <header className="header">
        <span className="header__logo">RealTime Room</span>
      </header>
      <main className="app__main">
        <section className="app__chat">
          <Chat />
        </section>
        <section className="app__game">
          <Game />
        </section>
      </main>
    </div>
  )
}

export default App