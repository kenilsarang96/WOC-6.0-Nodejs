const socket = io();

const userid = document.getElementById('create-room-username'); // creater

const form1 = document.getElementById('create-room');

const loginpage = document.getElementById('loginpage');
const game= document.getElementById('Game');

const usermsg = document.getElementById('msg');
const sendbtn = document.getElementById('send-btn');
const messages = document.getElementById('messages');

const joinroomusername = document.getElementById('join-room-username'); //joiner
const roomid = document.getElementById('room-id');
const joinbtn = document.getElementById('join-room-btn');
const leave_btn = document.getElementById('leavebtn');
const displayRoomid = document.getElementById('displayroomid');

const form2 = document.getElementById('join-room');




form1.addEventListener('submit',(e)=>{

    e.preventDefault();

    if(userid.value)
    {
        socket.emit('create-room',userid.value,msg=>{
            displayMessage(msg);
        });
        loginpage.style.visibility = 'hidden';    
         game.style.visibility = 'visible'
        //  userid.value='';
        }
        
    })
    
    let id;

    let Username;
    
    socket.on('displayroom-id',(roomID,username)=>{
        id = roomID;
        Username = username;
        displayRoomid.innerText=`ROOM ID : ${id} `;
        const item = document.createElement('li');
        item.textContent =  `${Username} is joined`;
        item.style.color = 'green';
        item.style.fontWeight ='bold';
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
        
        
       })


sendbtn.addEventListener('click',(e)=>{
    e.preventDefault();
    console.log(usermsg.value);
    if(usermsg.value)
    {
        socket.emit('chat',usermsg.value,userid.value,id)
        usermsg.value ='';
    }
})
socket.on('chat', (msg,id) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    console.log(messages);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('leavemsg',(username)=>{
        const item = document.createElement('li');
        item.textContent =  `${username} leaved`;
        item.style.color = 'red'
        item.style.fontWeight ='bold'
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
})




form2.addEventListener('submit',(e)=>{
        
    e.preventDefault();

    console.log(roomid.value && joinroomusername.value)
    if(roomid.value!=null && joinroomusername.value!=null)
    {
        socket.emit('join-room',roomid.value,joinroomusername.value,msg=>{
            displayMessage(msg);
        });
        userid.value = joinroomusername.value;
        loginpage.style.visibility = 'hidden';
         game.style.visibility = 'visible'
        //  roomid.value='';
        //  joinroomusername.value='';
    }
})



leave_btn.addEventListener('click',(e)=>{
    socket.emit('leave-room',id,userid.value);
    loginpage.style.visibility = 'visible';
    game.style.visibility = 'hidden'
    // messages.innerHTML='';
})

        
 
function displayMessage(msg)
{
  const item = document.createElement('li');
  item.textContent = msg;
  item.style.color = 'red'
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}