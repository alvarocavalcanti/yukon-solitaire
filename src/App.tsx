import { useGame } from './hooks/useGame'
import { GameBoard } from './components/GameBoard'

export default function App() {
  const game = useGame()
  return <GameBoard game={game} />
}
