const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

app.get("/generateCode", async (req, res) => {
  const sessionId = uuidv4();
  const url = `https://qrbasedcontrol.onrender.com/index2.html?sessionId=${sessionId}`;

  try {
    const qrCode = await QRCode.toDataURL(url);
    res.send({ qrCode, sessionId });
  } catch (err) {
    res.status(500).send("Error generating QR code");
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
  socket.on("control", (data) => {
    const { sessionId, action } = data;
    io.to(sessionId).emit("perform-action", action);
  });
});

server.listen(3000, () => {
  console.log("Server listening");
});
