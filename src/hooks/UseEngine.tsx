import { useState, useRef } from "react";
import { logger } from "../engine/core/Logger";
import { Board, type Pieza, Cell } from "../components/Engine.ts";
import { Notation } from '../components/Notation.ts';
const INITIAL_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const UseEngine = () => {
  const moveNumber = useRef(1);
  const [positionInput, setPositionInput] =
    useState("");
  const pendingMove = useRef<string | null>(null);
  const clearTrajectory = () => {
    board.playground.forEach((cell) => {
      cell.isTrajectory = false;
    });
  };
  const notation = useRef(new Notation());

  const resetGame = () => {

    logger.clear();

    moveNumber.current = 1;
    pendingMove.current = null;

    clearSelectedPieces();
    clearTrajectory();

    board.loadPosition(INITIAL_POSITION);

    setSelectedPiece(null);
    setPositionInput("");

    updateBoard();
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


    const trayectoria = board.getLegalMoves(pieza);

    trayectoria.forEach((cell) => {
      cell.isTrajectory = true;
    });

    setSelectedPiece(pieza);
    updateBoard();
  };
  const resignGame = () => {
    board.resign(board.esTurnoNegro);

    clearSelection();
    updateBoard();
  };

  const undoMove = () => {
    const success =
      board.undoMove();

    if (!success) return;

    clearSelectedPieces();
    clearTrajectory();

    setSelectedPiece(null);

    logger.clear();
    moveNumber.current = 1;
    pendingMove.current = null;

    updateBoard();
  };
  const loadPosition = () => {
    if (!positionInput.trim()) return;
    logger.clear();
    board.history = [];
    clearSelectedPieces();
    clearTrajectory();

    board.loadPosition(positionInput);

    setSelectedPiece(null);

    updateBoard();
  };

  const moveSelectedPiece = (destination: Cell) => {
    if (!selectedPiece) return;

    if (destination.pieza === selectedPiece) return;

    const origin = board.playground.find((cell) => cell.pieza === selectedPiece);
    if (!origin) return;

    const moveData = notation.current.prepareMoveNotation(board, selectedPiece, origin, destination);

    const success = board.movePiece(origin, destination)

    if (success) {
      notation.current.commitMove(board, moveData, selectedPiece);
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
    resetGame,
    handleCellClick,
    clearSelection,
    positionInput,
    setPositionInput,
    loadPosition,
    resignGame,
    undoMove,
  };

};
