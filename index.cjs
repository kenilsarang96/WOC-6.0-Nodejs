const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { generateSlug } = require("random-word-slugs");
const port = 3000 || process.env.port;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecover: {},
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

const slugOptions = {
  partsOfSpeech: ["noun"],
  categories: {
    noun: ["animals", "food", "science", "sports", "technology", "thing"],
  },
};
const generateRandomWord = () => {
  return generateSlug(1, slugOptions).toLowerCase();
};

function countdown(seconds, id, whatmsg) {
  let rem = seconds;
  io.to(id).emit(whatmsg, rem, id);

  const interval = setInterval(() => {
    rem--;
    io.to(id).emit(whatmsg, rem, id);

    if (rem <= 0) {
      if (whatmsg == "change-div-of-word-timer") {
        io.to(id).emit("add-score-in-match_over", id, alldata[id]);
        io.to(id).emit("change-vis-of-match_over", id);
      }
      clearInterval(interval);
    }
  }, 1000);
}

// data is storeded like this
// alldata[id] = [[username1,score],[username2,score]]

let alldata = {};
let user_socketid = {};

io.on("connection", (socket) => {
  console.log(socket.id);

  console.log("a user is connected");

  socket.on("disconnect", () => {
    let userInfo = user_socketid[socket.id];
    if (userInfo) {
      let username = userInfo[0];
      let roomid = userInfo[1];
      delete user_socketid[socket.id];
      io.to(roomid).emit("leavemsg", username);

      if (alldata[roomid]) {
        alldata[roomid] = alldata[roomid].filter(
          (user) => user[0] !== username
        );
        if (alldata[roomid].length === 0) {
          delete alldata[roomid];
        } else {
          io.to(roomid).emit("add-info-in-panel", alldata[roomid], roomid);
        }
      }
    }
  });

  socket.on("join-room", (roomid, username, callback) => {
    if (alldata[roomid]) {
      // Check if room exists
      user_socketid[socket.id] = [username, roomid];
      alldata[roomid].push([username, 0]);
      socket.join(roomid);

      io.to(roomid).emit("add-info-in-panel", alldata[roomid], roomid);
      io.to(roomid).emit("displayroom-id", roomid, username);
      callback(null); // No error
    } else {
      callback("Room does not exist"); // Send error message
    }
  });

  socket.on("create-room", (username, callback) => {
    let roomid = socket.id.substring(0, 5);
    user_socketid[socket.id] = [username, roomid];

    alldata[roomid] = [[username, 0]];
    socket.join(roomid);
    //  callback(`${userid} is joined`);
    io.to(roomid).emit("displayroom-id", roomid, username);
    io.to(roomid).emit("add-info-in-panel", alldata[roomid], roomid);
  });

  socket.on("chat", (msg, userid, room) => {
    io.to(room).emit("show_chat", userid + " : " + msg, userid, msg);
  });

  socket.on("leave-room", (roomid, Username) => {
    io.to(roomid).emit("leavemsg", Username);
    socket.leave(roomid);

    if (alldata[roomid]) {
      alldata[roomid] = alldata[roomid].filter((user) => user[0] !== Username);
      if (alldata[roomid].length === 0) {
        delete alldata[roomid];
      } else {
        io.to(roomid).emit("add-info-in-panel", alldata[roomid], roomid);
      }
    }
  });

  socket.on("draw", (x, y, id) => {
    io.to(id).emit("ondraw", x, y);
  });

  socket.on("down", (x, y, id) => {
    io.to(id).emit("ondown", x, y);
  });

  socket.on("change-b_size", (b_size, id) => {
    io.to(id).emit("apply-b_size", b_size);
  });

  socket.on("change-b_color", (b_color, id) => {
    io.to(id).emit("apply-b_color", b_color);
  });

  socket.on("erase_all", (id) => {
    io.to(id).emit("apply-erase", id);
  });

  socket.on("change-svg-to-write", (id, Username) => {
    io.to(id).emit("change-it-to-write", id, Username);
  });

  socket.on("change-svg-to-user", (id, Username) => {
    io.to(id).emit("change-it-to-user", id, Username);
  });

  socket.on("change-vis-of-match_over-hide", (id) => {
    setTimeout(() => {
      io.to(id).emit("change-vis-of-match_over-to-hide", id);
    }, 7.5 * 1000);
  });

  socket.on("update_score", (useriD, id, remaining_time) => {
    for (let i = 0; i < alldata[id].length; i++) {
      if (useriD == alldata[id][i][0]) {
        alldata[id][i][1] += Math.floor((remaining_time / 60) * 60);
        break;
      }
    }
  });

  socket.on("check",(id)=>{
    if(alldata[id].length > 1) io.to(id).emit("checkOk",id)
  })

  socket.on("start_game", (id) => {
    let cnt = 5;
    let round_duration = 60;
    io.to(id).emit("change-vis-gameover", id);
    io.to(id).emit("clear_old_chat");
    
     
    let players = alldata[id].length;

    let turn = 0;

    for (let i = 0; i < alldata[id].length; i++) {
      alldata[id][i][1] = 0;
    }

    io.to(id).emit("reset-scores", alldata[id], id);

    io.to(id).emit("user_can_draw", id, alldata[id][turn][0]);

    const slug = generateRandomWord();

    io.to(id).emit("show_word_to_drawer", id, slug, alldata[id][turn][0]);
    io.to(id).emit("change-vis-of-start", id);

    setTimeout(() => {
      io.to(id).emit("change-vis-of-start_to_hide", id, alldata[id][turn][0]);
      turn = turn + 1;

      countdown(round_duration, id, "change-div-of-word-timer");
    }, cnt * 1000);

    countdown(cnt, id, "change-div-of-timermsg");
    let f = 1;

    const interval = setInterval(() => {
      const slug = generateSlug(1, { format: "title" });
      if (alldata[id][turn]) {
        io.to(id).emit("show_word_to_drawer", id, slug, alldata[id][turn][0]);
        io.to(id).emit("user_can_draw", id, alldata[id][turn][0]);
      } else {
        io.to(id).emit("GAME_OVER", id);
        clearInterval(interval);
        clearInterval(final);

        f = 0;
        return;
      }
      io.to(id).emit("change-vis-of-start", id);

      setTimeout(() => {
        io.to(id).emit("change-vis-of-start_to_hide", id, alldata[id][turn][0]);
        countdown(round_duration, id, "change-div-of-word-timer");
        setTimeout(() => {
          io.to(id).emit("change-vis-of-match_over-to-hide", id);
        }, 8 * 1000);

        turn++;
      }, cnt * 1000);

      countdown(cnt, id, "change-div-of-timermsg");
    }, (cnt + round_duration + 8) * 1000);

    const final = setTimeout(() => {
      if (f) {
        io.to(id).emit("GAME_OVER", id);
        clearInterval(interval);
      }
    }, (cnt + round_duration + 8) * 1000 * players);
  });

  socket.on("hide-after-8-sec", (id) => {
    setTimeout(() => {
      io.to(id).emit("change-vis-gameover", id);
    }, 8 * 1000);
  });

});

server.listen(port, () => {
  console.log("server running at http://localhost:3000");
});
