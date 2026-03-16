export default function Game() {
  return (
    <div className="game">
      <div className="game__header">
        <h2 className="game__title">Mini-jeu</h2>
      </div>
      <div className="game__board">
        {/*PlaceHolder*/}
      </div>
      <div className="game__controls">
        <input className="game__input" placeholder="Ton action..." />
        <button className="game__btn">Jouer</button>
      </div>
    </div>
  )
}