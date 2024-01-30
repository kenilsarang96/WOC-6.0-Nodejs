const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { generateSlug } = require("random-word-slugs");




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
  console.log(connections);

  console.log("a user is connected");
  
  socket.on("disconnect", () => {
      const index = connections.indexOf(socket);
        if (index !== -1) {
            // Remove the disconnected socket from the connections array
            connections.splice(index, 1);
        }
    console.log("user disconnected");
  });
  
  socket.on("join-room", (roomid, username, callback) => {
    connections.push(socket.id);
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
    connections.push(socket.id);
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
    console.log(connections);
    console.log(user_names);
  });

  socket.on('chat', (msg, userid, room) => {
   
      io.to(room).emit("show_chat", userid + " : " + msg,userid,msg);
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
      if (user_names[i][0] !==id) continue;
      io.to(id).emit("apply-b_size",b_size);
    }

  });
  socket.on('change-b_color',(b_color,id)=>{
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] !=id) continue;
      io.to(id).emit("apply-b_color",b_color);
    }

  });
  socket.on('erase_all',(id)=>{
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      io.to(id).emit("apply-erase",id);
    }

  });


  socket.on('change-svg-to-write',(id,Username)=>{

    io.to(id).emit('change-it-to-write',id,Username,user_names);
  });

  socket.on('change-svg-to-user',(id,Username)=>{

    io.to(id).emit('change-it-to-user',id,Username,user_names);
  });


  socket.on("start_game",(id)=>{
    let cnt = 5;
    let round_duration = 60;
  
    let all_room_members = [];
    
    for (let i = 0; i < user_names.length; i++) {
      if (user_names[i][0] != id) continue;
      
      all_room_members.push(user_names[i][1]);
    }

    let players = all_room_members.length;

    let turn = 0;


    
    const slug = generateSlug(1, { format: "title" });
    io.to(id).emit('show_word_to_drawer',id,slug,all_room_members[turn]);
    io.to(id).emit('change-vis-of-start',id);

    setTimeout(() => {
       

      io.to(id).emit("change-vis-of-start_to_hide",id,all_room_members[turn]);
      turn = turn+1;
     
      countdown(round_duration,id,"change-div-of-word-timer");

       }, cnt*1000);
       countdown(cnt,id,"change-div-of-timermsg");

  


           const interval = setInterval(() => {
                
             const slug = generateSlug(1, { format: "title" });
             io.to(id).emit("show_word_to_drawer",id,slug,all_room_members[turn]);
             io.to(id).emit('change-vis-of-start',id);
             
            setTimeout(() => {
            
              io.to(id).emit("change-vis-of-start_to_hide",id,all_room_members[turn]);
              countdown(round_duration,id,"change-div-of-word-timer");
             
               turn++;
 
                }, cnt*1000);

  
             countdown(cnt,id,"change-div-of-timermsg");

           }, (cnt+ round_duration)*1000);
     


       setTimeout(() => {
           clearInterval(interval);
       }, (cnt+ round_duration)*1000*(players));


  })


  
function countdown(seconds,id,whatmsg) {
  return new Promise((resolve, reject) => {
      let rem = seconds;
      io.to(id).emit(whatmsg,rem,id);

      const interval = setInterval(() => {
          rem--;
          io.to(id).emit(whatmsg,rem,id);

          if (rem <= 0) {
              clearInterval(interval);
              resolve(); 
          }
      }, 1000);
  });
}

});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});


