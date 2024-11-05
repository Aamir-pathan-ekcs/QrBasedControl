// const QRCode = require('qrcode');
// const express = require('express')
// const app = express()

// app.get('/qr', (req, res)=>{
//     QRCode.toDataURL('https://ekcs.co/', (err, url) => {
//     if (err) { 
//         console.error(err);
//     }else
//         res.send(`<img src="${url}" alt="QR Code">`);
//     });
// })

// const PORT = 3000;
// app.listen(PORT, ()=>{
//     console.log(`Server is running on http://localhost:${PORT}`);
// })
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static("public"));

// Route to generate a QR code with a unique session ID
app.get("/generate", async (req, res) => {
  const sessionId = uuidv4();
  const url = `https://qrbasedcontrol.onrender.com/phone.html?sessionId=${sessionId}`;

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

  // Phone sends control commands
  socket.on("control", (data) => {
    const { sessionId, action } = data;
    // Emit the action to the desktop in the same session
    io.to(sessionId).emit("perform-action", action);
  });
});

server.listen(3000, () => {
  console.log("Server listening");
});
