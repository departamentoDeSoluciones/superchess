import { useState, useRef } from "react";
import { logger } from "../engine/core/Logger";
import { Board, type Pieza, Cell } from "../components/Engine.ts";
const INITIAL_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const UseEngine = () => {
  const moveNumber = useRef(1);
  const pendingMove = useRef<string | null>(null);
  const clearTrajectory = () => {
    board.playground.forEach((cell) => {
      cell.isTrajectory = false;
    });
  };
  const logMove = (
    pieza: Pieza,
    destination: Cell
  ) => {

    const move =
      `${pieza.tipo} ${destination.letra.toLowerCase()}${destination.numero}`;

    if (!pendingMove.current) {
      pendingMove.current = move;

      return;
    }

    logger.log(
      `${moveNumber.current}. ${pendingMove.current}, ${move}`
    );

    pendingMove.current = null;
    moveNumber.current++;
  };

  const [board] = useState(() => {
    const newBoard = new Board();
    newBoard.loadPosition(INITIAL_POSITION);
    return newBoard;
  });
  const [selectedPiece, setSelectedPiece] = useState<Pieza | null>(null);

  const [, forceRender] = useState(0);
  const updateBoard = () => {
    forceRender((value) => value + 1);
  };
  const clearSelectedPieces = () => {
    board.playground.forEach((cell) => {
      if (cell.pieza) {
        cell.pieza.isSelected = false;
      }
    });
  };
  const clearSelection = () => {
    clearSelectedPieces();
    clearTrajectory();
    setSelectedPiece(null);
    updateBoard();

  };
  const selectPiece = (pieza: Pieza) => {
    clearSelectedPieces();
    clearTrajectory();


    pieza.isSelected = true;

    const trayectoria =
      pieza
        .calcularTrayectoria(board)
        .filter((cell) =>
          board.isLegalMove(pieza, cell)
        );

    trayectoria.forEach((cell) => {
      cell.isTrajectory = true;
    });

    setSelectedPiece(pieza);
    updateBoard();
  };



  const moveSelectedPiece = (destination: Cell) => {
    if (!selectedPiece) return;

    if (destination.pieza === selectedPiece) return;

    const origin = board.playground.find((cell) => cell.pieza === selectedPiece);
    if (!origin) return;

    const success = board.movePiece(origin, destination)

    if (success) {

      logMove(
        selectedPiece,
        destination
      );

      clearTrajectory();
      selectedPiece.isSelected = false;
      setSelectedPiece(null);

      updateBoard();
    }
  };

  const handleCellClick = (cell: Cell) => {
    if (!selectedPiece) {
      if (!cell.pieza) return;
      if (cell.pieza.color !== board.esTurnoNegro) return;
      selectPiece(cell.pieza);
      return;
    }
    moveSelectedPiece(cell);
  };

  return {
    board,
    handleCellClick,
    clearSelection,
  };

};
