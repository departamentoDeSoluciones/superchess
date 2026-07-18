
const main = () => {
  const socket = io();
  const updateStatus = (text) => {
    const status = document.querySelector("#connection-status");
    if (status) status.textContent = text;
  };
  socket.on("connect", () => {
    updateStatus("connectado");
  });

  socket.on("disconnect", () => {
    updateStatus("desconectado");
  });
}

main();
