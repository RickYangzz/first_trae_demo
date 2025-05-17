import './App.css'
import Canvas from './components/Canvas'

function App() {
  return (
    <div className="app">
      <h1>AI 你画我猜</h1>
      <div className="game-container">
        <Canvas />
      </div>
    </div>
  )
}

export default App
