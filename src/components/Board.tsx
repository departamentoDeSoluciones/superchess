import { Board, Cell } from './Engine.ts';
import './Board.css';
interface DisplayBoardProps {
  board: Board;
  view?: "white" | "black";
  onCellClick: (cell: Cell) => void;
  onClearSelection: () => void;
}
export const DisplayBoard = ({

  board, view = "white", onCellClick, onClearSelection
}: DisplayBoardProps) => {


  const displayBoard =

    view === "black"
      ? [...board.playground].reverse()
      : board.playground;

  return (
    <div className="board-main">
      {displayBoard.map((cell) => (



        <div
          key={`${cell.letra}${cell.numero}`}
          onClick={() => {
            onCellClick(cell);
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            onClearSelection();
          }}
          className={`
    casilla
    ${cell.color ? "negra" : "blanca"}
    ${cell.isTrajectory ? "trajectory" : ""}
    ${cell.pieza
              ? `piece-${cell.pieza.tipo}
           ${cell.pieza.color ? "black" : "white"}
           ${cell.pieza.isSelected ? "selected" : ""}`
              : ""
            }
  `}
        />

      ))}
    </div>
  );

}
export default DisplayBoard;
