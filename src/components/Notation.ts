import { logger } from "../engine/core/Logger";
import { Board, Pieza, Cell } from "./Engine";

const PIECE_NOTATION: Record<Pieza["tipo"], string> = {
  p: "", n: "N", b: "B", r: "R", q: "Q", k: "K",
};

export class Notation {
  private moveNumber: number = 1;
  private history: string[] = [];
  private currentTurn: string = "";

  public reset() {
    this.moveNumber = 1;
    this.history = [];
    this.currentTurn = "";
    logger.clear();
  }

  public logResignation(color: boolean) {
    const loser = color ? "Negras" : "Blancas";
    const winner = color ? "Blancas" : "Negras";
    logger.log(`${loser} se rinden. ${winner} ganan.`);
  }

  public logDraw() {
    logger.log("Tablas por ahogado.");
  }

  public logUndo() {
    logger.log("Movimiento regresado.");
  }

  private getDisambiguation(board: Board, pieza: Pieza, origin: Cell, destination: Cell): string {
    if (pieza.tipo === "p") return "";

    const alternatives = board.playground.filter((cell) => {
      const candidate = cell.pieza;
      if (!candidate || candidate === pieza) return false;
      if (candidate.color !== pieza.color || candidate.tipo !== pieza.tipo) return false;

      const canReach = candidate.calcularTrayectoria(board).includes(destination);
      if (!canReach) return false;
      return board.isLegalMove(candidate, destination);
    });

    if (alternatives.length === 0) return "";

    const sameFile = alternatives.some((cell) => cell.letra === origin.letra);
    const sameRank = alternatives.some((cell) => cell.numero === origin.numero);

    if (!sameFile) return origin.letra.toLowerCase();
    if (!sameRank) return String(origin.numero);

    return origin.letra.toLowerCase() + origin.numero;
  }

  public prepareMoveNotation(board: Board, pieza: Pieza, origin: Cell, destination: Cell) {
    const originalType = pieza.tipo;
    const fileDistance = Math.abs(destination.letra.charCodeAt(0) - origin.letra.charCodeAt(0));
    const isCastle = originalType === "k" && fileDistance === 2;

    if (isCastle) {
      return { base: destination.letra === "G" ? "O-O" : "O-O-O", originalType };
    }

    const target = `${destination.letra.toLowerCase()}${destination.numero}`;
    const isEnPassantCapture = originalType === "p" && origin.letra !== destination.letra && board.enPassantTarget === destination;
    const isCapture = destination.isOccupied || isEnPassantCapture;

    const piece = PIECE_NOTATION[originalType];
    const disambiguation = this.getDisambiguation(board, pieza, origin, destination);
    const pawnCaptureFile = originalType === "p" && isCapture ? origin.letra.toLowerCase() : "";
    const capture = isCapture ? "x" : "";

    return {
      base: piece + disambiguation + pawnCaptureFile + capture + target,
      originalType,
    };
  }
  public commitMove(
    board: Board,
    notation: { base: string; originalType: Pieza["tipo"] },
    pieza: Pieza
  ) {
    const promotion = notation.originalType === "p" && pieza.tipo !== "p"
      ? `=${PIECE_NOTATION[pieza.tipo]}`
      : "";

    const checkState = board.isMate(board.esTurnoNegro) ? "#" : board.isCheck(board.esTurnoNegro) ? "+" : "";
    const move = notation.base + promotion + checkState;
    const isBlackMove = pieza.color;

    if (!isBlackMove) {
      this.currentTurn = `${this.moveNumber}. ${move}`;
    } else {
      this.currentTurn += ` ${move}`;
    }

    this.syncLogger();

    if (isBlackMove || board.isGameOver) {
      this.history.push(this.currentTurn);
      this.currentTurn = "";
      if (isBlackMove) {
        this.moveNumber++;
      }
    }

    if (board.isGameOver) {
      logger.log("Game Over");
    }
  }

  private syncLogger() {
    logger.clear();

    this.history.forEach((line) => {
      logger.log(line);
    });

    if (this.currentTurn !== "") {
      logger.log(this.currentTurn);
    }
  }
}


