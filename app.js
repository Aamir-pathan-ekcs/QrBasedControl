const express = require("express");
const http = require("http");
const QrCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://dev.ekcs.co",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
app.use(express.static("public"));

const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://dev.ekcs.co", // Allow this origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});