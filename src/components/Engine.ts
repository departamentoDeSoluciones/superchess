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
  constructor(
    C: boolean,
    P: Piece
  ) {
    this.color = C;
    this.tipo = P;
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
        const captureLeft = findCell(-1, direction);
        if (captureLeft?.isOccupied && captureLeft.pieza?.color !== this.color) {
          trayectoria.push(captureLeft);
        }

        const captureRight = findCell(1, direction);
        if (captureRight?.isOccupied && captureRight.pieza?.color !== this.color) {
          trayectoria.push(captureRight);
        }

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

export class Board {
  playground: Cell[];
  esTurnoNegro: boolean = false;
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
  movePiece(origin: Cell, destination: Cell): boolean {
    if (!origin.pieza) return false;

    // El condicional de reglas irá aquí.
    if (origin.pieza.color !== this.esTurnoNegro) return false;
    const validMoves = origin.pieza.calcularTrayectoria(this);
    const isMoveLegal = validMoves.includes(destination);
    if (!isMoveLegal) {
      return false;
    }
    // Ejecución unificada de movimiento/captura

    destination.pieza = origin.pieza;
    origin.pieza = null;

    this.esTurnoNegro = !this.esTurnoNegro;
    return true; // Movimiento exitoso
  }

  loadPosition(position: string) {
    const placement = position.split(" ")[0];
    let cellIndex = 0;
    for (const symbol of placement) {
      if (symbol === "/") {
        continue;
      }
      if (!isNaN(Number(symbol))) {
        cellIndex += Number(symbol);
        continue;
      }

      const color = symbol === symbol.toLowerCase();
      const tipo = symbol.toLowerCase() as Piece;

      this.playground[cellIndex].pieza = new Pieza(color, tipo);

      cellIndex++;


    }
  }
}


