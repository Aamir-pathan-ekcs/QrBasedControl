const express = require("express");
const http = require("http");
const socketIO =  require("socket.io")(server, {
  cors: {
    origin: "https://dev.ekcs.co/aamir/ScanWebControl/demoQR/",
    methods: ["GET", "POST"],
  },
});
const QrCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
app.use(cors());
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

app.use(express.static("public"));

app.get("/generateCode", async (req, res) => {
  const sessionId = uuidv4();
  const urlSession = `https://qrbasedcontrol.onrender.com/index2.html?sessionId=${sessionId}`;

  try {
    const qrCode = await QrCode.toDataURL(urlSession);
    res.send({ qrCode, sessionId });
  } catch (err) {
    res.status(500).send("Generating QR code Error");
  }
});

io.on("connection", (socket) => {
  console.log("Client :", socket.id);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
  socket.on("control", (data) => {
    const { sessionId, action } = data;
    io.to(sessionId).emit("perform-action", action);
  });
});

httpServer.listen(3000, () => {
  console.log("Server listening");
});
