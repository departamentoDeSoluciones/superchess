import { useState } from "react";
import "./App.css";

import { LoggerScreen } from "./ui/components/LoggerScreen";
import { UseEngine } from "./hooks/UseEngine";
import { DisplayBoard } from "./components/Board";

type BoardView = "white" | "black";

function MainPage() {
  const {
    board,
    handleCellClick,
    clearSelection,
    positionInput,
    setPositionInput,
    resetGame,
    loadPosition,
    resignGame,
    undoMove,
  } = UseEngine();

  const [view, setView] =
    useState<BoardView>("white");

  const toggleView = () => {
    setView((currentView) =>
      currentView === "white"
        ? "black"
        : "white"
    );
  };

  return (
    <main className="game-page">
      <div className="game-layout">
        <section className="board-frame">
          <div className="board-stage">
            <DisplayBoard
              board={board}
              view={view}
              onCellClick={handleCellClick}
              onClearSelection={clearSelection}
            />
          </div>

          <div className="board-footer">
            <form
              className="position-loader"
              onSubmit={(event) => {
                event.preventDefault();
                loadPosition();
              }}
            >
              <input
                type="text"
                value={positionInput}
                onChange={(event) =>
                  setPositionInput(
                    event.target.value
                  )
                }
                placeholder="FEN position"
              />

              <button type="submit">
                Go
              </button>
            </form>

            <nav className="board-controls">
              <button
                className="game-control"
                onClick={toggleView}
                type="button"
              >
                Cambiar vista
              </button>
              <button
                className="game-control"
                onClick={resetGame}
                type="button"
              >
                Reset
              </button>
              <button
                className="game-control"
                type="button"
                onClick={resignGame}
              >
                Rendirse
              </button>

              <button
                className="game-control"
                onClick={undoMove}
                type="button"
              >
                Regresar
              </button>
            </nav>
          </div>
        </section>

        <aside className="logger-frame">
          <LoggerScreen />
        </aside>
      </div>
    </main>
  );
}

export default MainPage;
