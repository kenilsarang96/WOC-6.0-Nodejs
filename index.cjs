const express = require('express');
const {createServer} = require('http');
const path = require('path');
const {Server} = require('socket.io');

const app = express();

const server = createServer(app);

const io = new Server(server,{
    connectionStateRecover:{}
})

app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
  });




 

let users = {};

io.on('connection',(socket)=>{
    console.log(socket.id);
      
      console.log('a user is connected')
      
      socket.on('disconnect', () => {
          console.log('a user is connected')
          console.log('user disconnected');  });
          
          socket.on('join-room',(roomid,username,callback)=>{
             
            socket.join(roomid);
            io.to(roomid).emit('displayroom-id',roomid,username);
          //  callback(`${username} is joined`);
         })



        socket.on('create-room',(username,callback)=>{
              
           let roomID = socket.id.substring(0,5);

           socket.join(roomID);
          //  callback(`${userid} is joined`);
           io.to(roomID).emit('displayroom-id',roomID,username);
             
        })

         socket.on('chat',(msg,userid,room)=>{
               if(room==="")
               {
                 console.log( room +' : ' +msg);
                 io.emit('chat',userid +' : ' +msg);
                }
                else
                {
             io.to(room).emit('chat',userid +' : ' +msg);
            }
          })
          
          socket.on('leave-room',(id,Username)=>{
           io.to(id).emit('leavemsg',Username);
           
            socket.leave(id);

         })


})




server.listen(3000,()=>{
    console.log('server running at http://localhost:3000');
});