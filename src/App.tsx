import './App.css'
import { LoggerScreen } from "./ui/components/LoggerScreen";
import { UseEngine } from "./hooks/UseEngine";
import { DisplayBoard } from "./components/Board";
function MainPage() {
  const { board , handleCellClick, clearSelection} = UseEngine();
  return (
    <div className="main-container">
      <h1>Chess Game</h1>
<DisplayBoard
  board={board}
  view="white"
  onCellClick={handleCellClick}
  onClearSelection={clearSelection}
/>
      <LoggerScreen />
    </div>
  );
}
export default MainPage;
