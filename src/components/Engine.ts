import { logger } from "../engine/core/Logger";
export class Cell {
  letra: string;
  numero: number;
  pieza: Pieza | null = null;
  color: boolean; // false es blanco, true es negro 
  isTrajectory: boolean = false;
  constructor(
    X: string,
    Y: number,
    C: boolean,
  ) {
    this.letra = X;
    this.numero = Y;
    this.color = C;
  }
  get isOccupied(): boolean {
    return this.pieza !== null;
  }
}
export type Piece = "p" | "n" | "b" | "r" | "q" | "k";
export class Pieza {
  color: boolean;
  tipo: Piece;
  isSelected: boolean = false;
  hasMoved: boolean = false;
  constructor(
    C: boolean,
    P: Piece
  ) {
    this.color = C;
    this.tipo = P;
  }
  coronar(cell: Cell): void {
    if (this.tipo !== "p") {
      return;
    }

    const ultimaLinea =
      this.color
        ? cell.numero === 1
        : cell.numero === 8;

    if (!ultimaLinea) {
      return;
    }

    this.tipo = "q";
  }
  calcularTrayectoria(board: Board): Cell[] {
    const origin = board.playground.find(
      (cell) => cell.pieza === this
    );

    if (!origin) return [];

    const trayectoria: Cell[] = [];

    const findCell = (
      letraOffset: number,
      numeroOffset: number
    ): Cell | undefined => {
      const letraIndex =
        origin.letra.charCodeAt(0) + letraOffset;

      const letra =
        String.fromCharCode(letraIndex);

      const numero =
        origin.numero + numeroOffset;

      return board.playground.find(
        (cell) =>
          cell.letra === letra &&
          cell.numero === numero
      );
    };

    const addCell = (
      letraOffset: number,
      numeroOffset: number
    ) => {
      const cell = findCell(
        letraOffset,
        numeroOffset
      );

      if (!cell) return;
      if (cell.isOccupied) {
        if (cell.pieza?.color !== this.color) {
          trayectoria.push(cell); // Es enemigo, se puede tomar
        }
        return; // Fin del salto, no se añade ni se avanza si es aliado

      };

      trayectoria.push(cell);
    };

    const addLine = (
      letraDirection: number,
      numeroDirection: number
    ) => {
      for (let step = 1; step < 8; step++) {
        const cell = findCell(
          letraDirection * step,
          numeroDirection * step
        );

        if (!cell) break;
        if (cell.isOccupied) {
          if (cell.pieza?.color !== this.color) {
            trayectoria.push(cell); // Es enemigo, se incluye en la trayectoria como destino final
          }
          break;
        }

        trayectoria.push(cell);
      }
    };

    switch (this.tipo) {
      case "p": {
        const direction = this.color ? -1 : 1;
        const initialRank = this.color ? 7 : 2;

        // Avance recto (solo si la celda está vacía)
        const forwardCell = findCell(0, direction);
        if (forwardCell && !forwardCell.isOccupied) {
          trayectoria.push(forwardCell);

          // Doble avance (solo si la primera y la segunda están vacías)
          if (origin.numero === initialRank) {
            const doubleForward = findCell(0, direction * 2);
            if (doubleForward && !doubleForward.isOccupied) {
              trayectoria.push(doubleForward);
            }
          }
        }

        // Capturas en diagonal (solo si hay enemigo)
        const addPawnCapture = (
          letraOffset: number
        ) => {
          const captureCell = findCell(
            letraOffset,
            direction
          );

          if (!captureCell) return;

          if (
            captureCell.isOccupied &&
            captureCell.pieza?.color !== this.color
          ) {
            trayectoria.push(captureCell);
            return;
          }

          if (
            !captureCell.isOccupied &&
            board.enPassantTarget === captureCell
          ) {
            const adjacentPawnCell = findCell(
              letraOffset,
              0
            );

            if (
              adjacentPawnCell?.pieza?.tipo === "p" &&
              adjacentPawnCell.pieza.color !== this.color
            ) {
              trayectoria.push(captureCell);
            }
          }
        };

        addPawnCapture(-1);
        addPawnCapture(1);

        break;
      }

      case "n": {
        const moves = [
          [1, 2],
          [2, 1],
          [2, -1],
          [1, -2],
          [-1, -2],
          [-2, -1],
          [-2, 1],
          [-1, 2],
        ];

        moves.forEach(([x, y]) => {
          addCell(x, y);
        });

        break;
      }

      case "b": {
        addLine(1, 1);
        addLine(1, -1);
        addLine(-1, 1);
        addLine(-1, -1);

        break;
      }

      case "r": {
        addLine(0, 1);
        addLine(0, -1);
        addLine(1, 0);
        addLine(-1, 0);

        break;
      }

      case "q": {
        addLine(0, 1);
        addLine(0, -1);
        addLine(1, 0);
        addLine(-1, 0);

        addLine(1, 1);
        addLine(1, -1);
        addLine(-1, 1);
        addLine(-1, -1);

        break;
      }

      case "k": {
        const moves = [
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, -1],
          [-1, 0],
          [-1, 1],
        ];

        moves.forEach(([x, y]) => {
          addCell(x, y);
        });

        break;
      }
    }

    return trayectoria;
  }
}


type BoardSnapshot = {
  pieces: Array<{
    color: boolean;
    tipo: Piece;

    hasMoved: boolean;
  } | null>;

  esTurnoNegro: boolean;
  isGameOver: boolean;
  enPassantTargetIndex: number | null;
};

export class Board {
  playground: Cell[];
  esTurnoNegro: boolean = false;
  isGameOver: boolean = false;
  public history: BoardSnapshot[] = [];
  enPassantTarget: Cell | null = null;

  constructor() {
    this.playground = [];
    for (let y = 8; y >= 1; y--) {
      for (let x = 0; x < 8; x++) {
        const letra = String.fromCharCode(65 + x);
        const color = (x + y) % 2 === 1;

        this.playground.push(
          new Cell(letra, y, color)
        );
      }
    }
  }
  private createSnapshot(): BoardSnapshot {
    return {
      pieces: this.playground.map((cell) => {
        if (!cell.pieza) return null;

        return {
          color: cell.pieza.color,
          tipo: cell.pieza.tipo,

          hasMoved: cell.pieza.hasMoved,
        };
      }),

      esTurnoNegro: this.esTurnoNegro,
      isGameOver: this.isGameOver,
      enPassantTargetIndex:
        this.enPassantTarget
          ? this.playground.indexOf(
            this.enPassantTarget
          )
          : null,
    };
  }

  private restoreSnapshot(
    snapshot: BoardSnapshot
  ): void {
    this.enPassantTarget =
      snapshot.enPassantTargetIndex !== null
        ? this.playground[
        snapshot.enPassantTargetIndex
        ]
        : null;

    this.playground.forEach(
      (cell, index) => {
        const pieceData =
          snapshot.pieces[index];

        if (!pieceData) {
          cell.pieza = null;
          cell.isTrajectory = false;

          return;
        }

        const pieza = new Pieza(
          pieceData.color,
          pieceData.tipo
        );

        pieza.hasMoved =
          pieceData.hasMoved;

        cell.pieza = pieza;

        cell.isTrajectory = false;
      }
    );

    this.esTurnoNegro =
      snapshot.esTurnoNegro;

    this.isGameOver =
      snapshot.isGameOver;
  }


  toFen(): string {
    let fen = "";
    let cellIndex = 0;

    // 1. Posición de las piezas
    for (let y = 8; y >= 1; y--) {
      let emptyCount = 0;
      for (let x = 0; x < 8; x++) {
        const cell = this.playground[cellIndex];

        if (cell.pieza) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const p = cell.pieza;
          fen += p.color ? p.tipo.toLowerCase() : p.tipo.toUpperCase();
        } else {
          emptyCount++;
        }

        cellIndex++;
      }

      if (emptyCount > 0) {
        fen += emptyCount;
      }

      if (y > 1) {
        fen += "/";
      }
    }

    // 2. Color activo
    const activeColor = this.esTurnoNegro ? "b" : "w";

    // 3. Disponibilidad de Enroque
    let castling = "";

    const checkCastle = (
      kLetra: string,
      kNum: number,
      rLetra: string,
      rNum: number,
      color: boolean,
      symbol: string
    ) => {
      // Usamos corchetes para saltarnos el TS compiler limit si getCell es private
      const king = this['getCell'](kLetra, kNum)?.pieza;
      const rook = this['getCell'](rLetra, rNum)?.pieza;

      if (
        king?.tipo === 'k' && king.color === color && !king.hasMoved &&
        rook?.tipo === 'r' && rook.color === color && !rook.hasMoved
      ) {
        castling += symbol;
      }
    };

    checkCastle("E", 1, "H", 1, false, "K");
    checkCastle("E", 1, "A", 1, false, "Q");
    checkCastle("E", 8, "H", 8, true, "k");
    checkCastle("E", 8, "A", 8, true, "q");

    if (castling === "") castling = "-";

    // 4. Captura al paso (En Passant target)
    const enPassant = this.enPassantTarget
      ? `${this.enPassantTarget.letra.toLowerCase()}${this.enPassantTarget.numero}`
      : "-";

    // 5. Medios movimientos (Halfmove clock) - Fijo en 0 para MVP
    const halfMove = "0";

    // 6. Movimientos completos
    const fullMove = Math.floor(this.history.length / 2) + 1;

    return `${fen} ${activeColor} ${castling} ${enPassant} ${halfMove} ${fullMove}`;
  }

  resign(color: boolean): void {
    if (this.isGameOver) return;

    this.isGameOver = true;

    const loser =
      color ? "Negras" : "Blancas";

    const winner =
      color ? "Blancas" : "Negras";

    logger.log(
      `${loser} se rinden. ${winner} ganan.`
    );
  }

  undoMove(): boolean {
    const snapshot = this.history.pop();

    if (!snapshot) {
      return false;
    }

    this.restoreSnapshot(snapshot);

    logger.log("Movimiento regresado.");

    return true;
  }

  isCheck(color: boolean = this.esTurnoNegro): boolean {
    const kingCell = this.playground.find(
      (cell) =>
        cell.pieza?.tipo === "k" &&
        cell.pieza.color === color
    );

    if (!kingCell) return false;

    const enemyPieces = this.playground.filter(
      (cell) =>
        cell.pieza &&
        cell.pieza.color !== color
    );

    return enemyPieces.some((cell) => {
      if (!cell.pieza) return false;

      const trayectoria =
        cell.pieza.calcularTrayectoria(this);

      return trayectoria.includes(kingCell);
    });


  }

  isLegalMove(
    pieza: Pieza,
    destination: Cell
  ): boolean {
    const origin = this.playground.find(
      (cell) => cell.pieza === pieza
    );

    if (!origin) return false;

    const capturedPiece = destination.pieza;

    destination.pieza = pieza;
    origin.pieza = null;

    const kingIsStillInCheck =
      this.isCheck(pieza.color);

    origin.pieza = pieza;
    destination.pieza = capturedPiece;

    return !kingIsStillInCheck;
  }

  public getCell(
    letra: string,
    numero: number
  ): Cell | undefined {
    return this.playground.find(
      (cell) =>
        cell.letra === letra &&
        cell.numero === numero
    );
  }
  private getCastleMoves(
    king: Pieza
  ): Cell[] {
    if (king.tipo !== "k") return [];

    if (king.hasMoved) return [];

    if (this.isCheck(king.color)) {
      return [];
    }

    const rank =
      king.color ? 8 : 1;

    const origin =
      this.getCell("E", rank);

    if (origin?.pieza !== king) {
      return [];
    }

    const moves: Cell[] = [];

    // ENROQUE CORTO

    const rookH =
      this.getCell("H", rank);

    const f =
      this.getCell("F", rank);

    const g =
      this.getCell("G", rank);

    if (
      rookH?.pieza?.tipo === "r" &&
      rookH.pieza.color === king.color &&
      !rookH.pieza.hasMoved &&
      f &&
      g &&
      !f.isOccupied &&
      !g.isOccupied &&
      this.isLegalMove(king, f) &&
      this.isLegalMove(king, g)
    ) {
      moves.push(g);
    }

    // ENROQUE LARGO

    const rookA =
      this.getCell("A", rank);

    const b =
      this.getCell("B", rank);

    const c =
      this.getCell("C", rank);

    const d =
      this.getCell("D", rank);

    if (
      rookA?.pieza?.tipo === "r" &&
      rookA.pieza.color === king.color &&
      !rookA.pieza.hasMoved &&
      b &&
      c &&
      d &&
      !b.isOccupied &&
      !c.isOccupied &&
      !d.isOccupied &&
      this.isLegalMove(king, d) &&
      this.isLegalMove(king, c)
    ) {
      moves.push(c);
    }

    return moves;
  }
  getLegalMoves(
    pieza: Pieza
  ): Cell[] {
    const moves =
      pieza
        .calcularTrayectoria(this)
        .filter((destination) =>
          this.isLegalMove(
            pieza,
            destination
          )
        );

    if (pieza.tipo === "k") {
      moves.push(
        ...this.getCastleMoves(pieza)
      );
    }

    return moves;
  }

  private executeCastle(
    origin: Cell,
    destination: Cell,
    king: Pieza
  ): void {
    const isKingSide =
      destination.letra === "G";

    const rookOrigin =
      this.getCell(
        isKingSide ? "H" : "A",
        origin.numero
      );

    const rookDestination =
      this.getCell(
        isKingSide ? "F" : "D",
        origin.numero
      );

    if (
      !rookOrigin?.pieza ||
      !rookDestination
    ) {
      return;
    }

    const rook = rookOrigin.pieza;

    destination.pieza = king;
    origin.pieza = null;

    rookDestination.pieza = rook;
    rookOrigin.pieza = null;

    king.hasMoved = true;
    rook.hasMoved = true;
  }

  movePiece(
    origin: Cell,
    destination: Cell
  ): boolean {
    if (this.isGameOver) {
      return false;
    }

    if (!origin.pieza) {
      return false;
    }

    const movingPiece =
      origin.pieza;

    if (
      movingPiece.color !==
      this.esTurnoNegro
    ) {
      return false;
    }

    const validMoves =
      this.getLegalMoves(movingPiece);

    if (
      !validMoves.includes(destination)
    ) {
      return false;
    }

    const snapshot =
      this.createSnapshot();

    const fileDistance =
      Math.abs(
        destination.letra.charCodeAt(0) -
        origin.letra.charCodeAt(0)
      );

    const isCastle =
      movingPiece.tipo === "k" &&
      fileDistance === 2;

    if (isCastle) {
      this.executeCastle(
        origin,
        destination,
        movingPiece
      );
    } else {
      destination.pieza =
        movingPiece;

      origin.pieza = null;

      movingPiece.hasMoved = true;
    }

    movingPiece.coronar(destination);

    this.history.push(snapshot);

    this.esTurnoNegro =
      !this.esTurnoNegro;

    this.checkGameOver();

    return true;
  }


  hasLegalMoves(color: boolean): boolean {
    return this.playground.some((cell) => {
      const pieza = cell.pieza;

      if (!pieza) return false;
      if (pieza.color !== color) return false;

      const trayectoria =
        pieza.calcularTrayectoria(this);

      return trayectoria.some((destination) =>
        this.isLegalMove(
          pieza,
          destination
        )
      );
    });
  }

  isMate(color: boolean): boolean {
    return (
      this.isCheck(color) &&
      !this.hasLegalMoves(color)
    );
  }

  isStalemate(color: boolean): boolean {
    return (
      !this.isCheck(color) &&
      !this.hasLegalMoves(color)
    );
  }

  checkGameOver(): void {
    const currentColor =
      this.esTurnoNegro;

    if (this.isMate(currentColor)) {
      this.isGameOver = true;

      const color =
        !currentColor ? "negras" : "blancas";

      logger.log(
        `Jaque mate. ${color} Ganan.`
      );

      return;
    }

    if (this.isStalemate(currentColor)) {
      this.isGameOver = true;

      logger.log(
        "Tablas por ahogado."
      );
    }
  }

  loadPosition(position: string) {

    const [
      placement,
      turn
    ] = position.trim().split(" ");

    this.playground.forEach((cell) => {
      cell.pieza = null;
      cell.isTrajectory = false;
    });

    let cellIndex = 0;

    for (const symbol of placement) {
      if (symbol === "/") {
        continue;
      }

      if (!isNaN(Number(symbol))) {
        cellIndex += Number(symbol);
        continue;
      }

      const color =
        symbol === symbol.toLowerCase();

      const tipo =
        symbol.toLowerCase() as Piece;

      this.playground[cellIndex].pieza =
        new Pieza(color, tipo);

      cellIndex++;
    }

    this.esTurnoNegro = turn === "b";
    this.isGameOver = false;


  }
}


