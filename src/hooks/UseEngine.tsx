import { useState, useRef } from "react";
import { logger } from "../engine/core/Logger";
import { Board, type Pieza, Cell } from "../components/Engine.ts";
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
  const PIECE_NOTATION: Record<
    Pieza["tipo"],
    string
  > = {
    p: "",
    n: "N",
    b: "B",
    r: "R",
    q: "Q",
    k: "K",
  };

  const getDisambiguation = (
    pieza: Pieza,
    origin: Cell,
    destination: Cell
  ): string => {
    if (pieza.tipo === "p") {
      return "";
    }

    const alternatives =
      board.playground.filter((cell) => {
        const candidate = cell.pieza;

        if (!candidate) return false;
        if (candidate === pieza) return false;

        if (
          candidate.color !== pieza.color ||
          candidate.tipo !== pieza.tipo
        ) {
          return false;
        }

        const canReach =
          candidate
            .calcularTrayectoria(board)
            .includes(destination);

        if (!canReach) return false;

        return board.isLegalMove(
          candidate,
          destination
        );
      });

    if (alternatives.length === 0) {
      return "";
    }

    const sameFile = alternatives.some(
      (cell) =>
        cell.letra === origin.letra
    );

    const sameRank = alternatives.some(
      (cell) =>
        cell.numero === origin.numero
    );

    if (!sameFile) {
      return origin.letra.toLowerCase();
    }

    if (!sameRank) {
      return String(origin.numero);
    }

    return (
      origin.letra.toLowerCase() +
      origin.numero
    );
  };

  const prepareMoveNotation = (
    pieza: Pieza,
    origin: Cell,
    destination: Cell
  ) => {
    const originalType = pieza.tipo;
    const fileDistance =
      Math.abs(
        destination.letra.charCodeAt(0) -
        origin.letra.charCodeAt(0)
      );

    const isCastle =
      originalType === "k" &&
      fileDistance === 2;

    if (isCastle) {
      return {
        base:
          destination.letra === "G"
            ? "O-O"
            : "O-O-O",

        originalType,
      };
    }
    const target =
      `${destination.letra.toLowerCase()}${destination.numero}`;

    const isEnPassantCapture =
      originalType === "p" &&
      origin.letra !== destination.letra &&
      board.enPassantTarget === destination;

    const isCapture =
      destination.isOccupied ||
      isEnPassantCapture;

    const piece =
      PIECE_NOTATION[originalType];

    const disambiguation =
      getDisambiguation(
        pieza,
        origin,
        destination
      );

    const pawnCaptureFile =
      originalType === "p" && isCapture
        ? origin.letra.toLowerCase()
        : "";

    const capture =
      isCapture ? "x" : "";

    return {
      base:
        piece +
        disambiguation +
        pawnCaptureFile +
        capture +
        target,

      originalType,
    };
  };

  const logMove = (
    notation: {
      base: string;
      originalType: Pieza["tipo"];
    },
    pieza: Pieza
  ) => {
    const promotion =
      notation.originalType === "p" &&
        pieza.tipo !== "p"
        ? `=${PIECE_NOTATION[pieza.tipo]}`
        : "";

    const checkState =
      board.isMate(board.esTurnoNegro)
        ? "#"
        : board.isCheck(board.esTurnoNegro)
          ? "+"
          : "";

    const move =
      notation.base +
      promotion +
      checkState;

    const isBlackMove = pieza.color;

    if (!isBlackMove) {
      if (board.isGameOver) {
        logger.log(
          `${moveNumber.current}. ${move}`
        );

        moveNumber.current++;

        return;
      }

      pendingMove.current = move;

      return;
    }

    if (!pendingMove.current) {
      logger.log(
        `${moveNumber.current}... ${move}`
      );

      moveNumber.current++;

      return;
    }

    logger.log(
      `${moveNumber.current}. ${pendingMove.current} ${move}`
    );

    pendingMove.current = null;
    moveNumber.current++;
  };


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
    const notation =
      prepareMoveNotation(
        selectedPiece,
        origin,
        destination
      );
    const success = board.movePiece(origin, destination)

    if (success) {

      logMove(
        notation,
        selectedPiece
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
