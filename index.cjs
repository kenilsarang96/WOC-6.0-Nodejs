const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();

const server = createServer(app);

const io = new Server(server, {
  connectionStateRecover: {},
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let user_names = [];

let connections = [];

let user_cnt = 0;

io.on("connection", (socket) => {
  console.log(socket.id);

  connections.push(socket.id);
  console.log("a user is connected");

  socket.on("disconnect", () => {
    connections.filter((con) => con.id !== socket.id);
    console.log("a user is connected");
    console.log("user disconnected");
  });

  socket.on("join-room", (roomid, username, callback) => {
    user_names.push([roomid, username]);
    socket.join(roomid);
    io.to(roomid).emit("displayroom-id", roomid, username);
    //  callback(`${username} is joined`);
    io.to(roomid).emit(
      "add-info-in-panel",
      roomid,
      username,
      user_names,
      user_cnt
    );
    user_cnt++;
    console.log(user_names);
  });

  socket.on("create-room", (username, callback) => {
    let roomid = socket.id.substring(0, 5);
    user_names.push([roomid, username]);

    socket.join(roomid);
    //  callback(`${userid} is joined`);
    io.to(roomid).emit("displayroom-id", roomid, username);
    io.to(roomid).emit(
      "add-info-in-panel",
      roomid,
      username,
      user_names,
      user_cnt
    );
    user_cnt++;
    console.log(user_names);
  });

  socket.on("chat", (msg, userid, room) => {
    if (room === "") {
      console.log(room + " : " + msg);
      io.emit("chat", userid + " : " + msg);
    } else {
      io.to(room).emit("chat", userid + " : " + msg);
    }
  });

  socket.on("leave-room", (id, Username) => {
    io.to(id).emit("leavemsg", Username);

    socket.leave(id);
  });

  socket.on("draw", (x, y, id) => {
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("ondraw", x, y);
    }
  });

  socket.on("down", (x, y, id) => {
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("ondown", x, y);
    }
  });
  
  socket.on('change-b_size',(b_size,id)=>{
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("apply-b_size",b_size);
    }

  });
  socket.on('change-b_color',(b_color,id)=>{
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("apply-b_color",b_color);
    }

  });
  socket.on('erase_all',(id)=>{
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("apply-erase",id);
    }

  });

});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
