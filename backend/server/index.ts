import express from "express";
import logger from 'morgan';
import path from "node:path"
import { Board } from "../../src/components/Engine.ts";
import { Server } from 'socket.io';
import { createServer } from 'node:http';

const port = Number(process.env.PORT) || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);
const clientPath = path.resolve(process.cwd(), "server");
app.use(logger('dev'));
app.use(express.static(clientPath));


const chessBoard = new Board();
chessBoard.loadPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
io.on('connection', (socket) => {
  console.log("cliente Conectado");
  console.log(socket.id);

  socket.on("disconnect", () => {
    console.log("desconectado");
  })
});

app.get("/", (_req, res) => {
  res.sendFile("index.html", {
    root: path.resolve(process.cwd(), "server"),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: true })
});

server.listen(port, () => {
  console.log(`server is running on port ${port} `);
});
