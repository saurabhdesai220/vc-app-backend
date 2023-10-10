const { Server } = require("socket.io");
const io = new Server(process.env.PORT || 8000, {
  cors: true,
});
const emailToSocketIdMap = new Map();
const socketIdToemailMap = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("room:join", (data) => {
    const { email, roomNumber } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToemailMap.set(socket.id, email);
    io.to(roomNumber).emit("user:joined", { email, id: socket.id });
    socket.join(roomNumber);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", (data) => {
    const { to, offer } = data;
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted", (data) => {
    const { to, ans } = data;
    io.to(to).emit("call:accepted", { to: socket.id, ans });
  });
  socket.on("peer:nego:needed", (data) => {
    const { to, offer } = data;
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  socket.on("peer:nego:done", (data) => {
    const { to, ans } = data;
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

// var http = require("http");

// http
//   .createServer(function (req, res) {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.end("Hello World!");
//   })
//   .listen(process.env.PORT || 8080);
