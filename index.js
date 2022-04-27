const express = require("express");
const app = express();
const port = process.env.PORT || 9000;
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
app.use(cors());
    // ["http://localhost:3000: *", "https://freelancer-chat-app-api.herokuapp.com:*"],
    // https://freelancer-chat-app-api.herokuapp.com/
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


let users = [];

const addUser = (userEmail, socketId) => {
  (!users?.some((user) => user.userEmail === userEmail) &&
  userEmail !== null ) &&
    users.push({
      userEmail,
      socketId,
    });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userEmail) => {
  return users.find((user) => user.userEmail === userEmail);
};


io.on("connection", (socket) => {
  // * when connect
  console.log(`user is connected with id ${socket.id}`);

    // take user id and socket id first from the client
  socket.on("addUser", (userEmail) => {
  
    addUser(userEmail, socket.id);
    io.emit("getUsers", users);
  });

  // send and get message
  socket.on("sendMessage", ({ senderEmail,receiverEmail, text }) => {
    const user = getUser(receiverEmail);

    io.to(user?.socketId).emit("getMessage", {
       senderEmail,
       text,
    });
  });

  socket.on("disconnect", () => {
    // * when disconnect
    console.log(`user is disconnect ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(port, () => {
  console.log(`server is running ${port}`);
});
