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


// alldata[id] = [[username1,score],[username2,score]]
  
let alldata={};


io.on("connection", (socket) => {
  console.log(socket.id);
  

  console.log("a user is connected");
  
  socket.on("disconnect", () => {
  
    console.log("user disconnected");

 
  });
  
  socket.on("join-room", (roomid, username, callback) => {
 
    if(alldata[roomid])alldata[roomid].push([username,0]);
    socket.join(roomid);
    io.to(roomid).emit("displayroom-id", roomid, username);
    //  callback(`${username} is joined`);
    io.to(roomid).emit(
      "add-info-in-panel",
            alldata[roomid],roomid
    );
  });

  socket.on("create-room", (username, callback) => {
   
    let roomid = socket.id.substring(0, 5);
   
    alldata[roomid] = [[username,0]];
    socket.join(roomid);
    //  callback(`${userid} is joined`);
    io.to(roomid).emit("displayroom-id", roomid, username);
    io.to(roomid).emit(
      "add-info-in-panel",
      alldata[roomid],roomid
    );
    
 
  });

  socket.on('chat', (msg, userid, room) => {
   
      io.to(room).emit("show_chat", userid + " : " + msg,userid,msg);
  });

  socket.on("leave-room", (id, Username) => {
    io.to(id).emit("leavemsg", Username);
    socket.leave(id);
    
    const indexToRemove = alldata[id].findIndex(entry => entry[0] == Username && entry[1] == 0);
    if (indexToRemove !== -1) {
      alldata[id].splice(indexToRemove, 1);
    }
    io.to(id).emit("add-info-in-panel",alldata[id],id);
  });

  socket.on("draw", (x, y, id) => {
   
      io.to(id).emit("ondraw", x, y);
    
  });



  socket.on("down", (x, y, id) => {
    
      io.to(id).emit("ondown", x, y);
    
  });
  
  socket.on('change-b_size',(b_size,id)=>{
    
 
      io.to(id).emit("apply-b_size",b_size);
    

  });
  socket.on('change-b_color',(b_color,id)=>{
 
      io.to(id).emit("apply-b_color",b_color);
    

  });
  socket.on('erase_all',(id)=>{
    
    
      io.to(id).emit("apply-erase",id);
    

  });


  socket.on('change-svg-to-write',(id,Username)=>{

    io.to(id).emit('change-it-to-write',id,Username);
  });

  socket.on('change-svg-to-user',(id,Username)=>{

    io.to(id).emit('change-it-to-user',id,Username);
  });

  socket.on("change-vis-of-match_over-hide",(id)=>{
    setTimeout(()=>{
      io.to(id).emit('change-vis-of-match_over-to-hide',id);
    },(7.5)*1000);
  })

  socket.on("update_score",(useriD,id)=>{

     for (let i = 0; i < alldata[id].length; i++) {
        if(useriD==alldata[id][i][0])
        {
          alldata[id][i][1] = alldata[id][i][1] +100;
          break;
        }
     }
  })
 
  
  socket.on("start_game",(id)=>{
    let cnt = 5;
    let round_duration = 20;
    
   io.to(id).emit("change-vis-gameover",id);
  


   
    
    
    
    let players = alldata[id].length;
    
  
    let turn = 0;
    
    for (let i = 0; i < alldata[id].length; i++) {
       alldata[id][i][1] = 0;
      
    }
    io.to(id).emit("reset-scores",alldata[id],id);
    
    
    const slug = generateSlug(1, { format: "title" });
    io.to(id).emit('show_word_to_drawer',id,slug,alldata[id][turn][0]);
    io.to(id).emit('change-vis-of-start',id);

    setTimeout(() => {
       
      io.to(id).emit("change-vis-of-start_to_hide",id,alldata[id][turn][0]);
      turn = turn+1;
     
      countdown(round_duration,id,"change-div-of-word-timer")
      
       
        
      

       }, cnt*1000);
       countdown(cnt,id,"change-div-of-timermsg");

      
     

           const interval = setInterval(() => {
                
             const slug = generateSlug(1, { format: "title" });
             io.to(id).emit("show_word_to_drawer",id,slug,alldata[id][turn][0]);
             io.to(id).emit('change-vis-of-start',id);
             
            setTimeout(() => {
            
              io.to(id).emit("change-vis-of-start_to_hide",id,alldata[id][turn][0]);
              countdown(round_duration,id,"change-div-of-word-timer");
              setTimeout(()=>{
                io.to(id).emit('change-vis-of-match_over-to-hide',id);
              },8*1000);
        
               turn++;
 
                }, cnt*1000);

  
             countdown(cnt,id,"change-div-of-timermsg");

           }, (cnt+ round_duration+8)*1000);
     


       setTimeout(() => {
           io.to(id).emit("GAME_OVER",id);
           clearInterval(interval);
       }, (cnt+ round_duration+8)*1000*(players));




  })

  socket.on("hide-after-8-sec",(id)=>{
    setTimeout(() => {
      io.to(id).emit("change-vis-gameover",id);
    }, 8*1000);
  })


  
function countdown(seconds,id,whatmsg) {

      let rem = seconds;
      io.to(id).emit(whatmsg,rem,id);

      const interval = setInterval(() => {
          rem--;
          io.to(id).emit(whatmsg,rem,id);

          if (rem <= 0) {
             if(whatmsg=="change-div-of-word-timer")
             {
              console.log(12345);
              io.to(id).emit('add-score-in-match_over',id,alldata[id]);
              io.to(id).emit('change-vis-of-match_over',id);
             }
              clearInterval(interval)
          }
      }, 1000);

}

});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});


