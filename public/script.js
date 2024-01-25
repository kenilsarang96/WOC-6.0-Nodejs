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

const user_panel = document.querySelector('.allusers');



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



socket.on('add-info-in-panel',(roomid,username,user_names,user_cnt)=>{
 console.log(user_panel);

 user_panel.innerHTML="";
 
 for (let i = 0; i< user_names.length; i++) {
    if(user_names[i][0]!=roomid) continue;
  let item = document.createElement('div');
 item.style.color = 'white'
 item.innerHTML=` <div class="flex gap-10 all-user-info"><img src="images/user.svg" alt=""><div></div>${user_names[i][1]}</div>`;

  user_panel.appendChild(item);
     }

})


// canvas




let canvas_div = document.querySelector(".canvas")
let canvas = document.getElementById("canvas_inner");


let brush_size  = document.getElementById("brush-width");
let brush_color = document.getElementById("brush-color");
let clear_btn = document.getElementById("clear-btn");


let b_size= brush_size.value ;
let b_color= brush_color.value;

brush_size.addEventListener("input",(e)=>{
    
    b_size= brush_size.value ;

    socket.emit('change-b_size',b_size,id);
})
brush_color.addEventListener("input",(e)=>{
    
    b_color= brush_color.value ;
    socket.emit('change-b_color',b_color,id);
})






canvas.width = canvas_div.offsetWidth;
canvas.height = canvas_div.offsetHeight;
let ctx = canvas.getContext("2d");

let rect = canvas.getBoundingClientRect(); // Get the canvas offset
let x;
let y;
let mouseDown = false;

window.onmousedown = (e) => {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    socket.emit('down',x,y,id);
    ctx.beginPath();
    ctx.moveTo(x, y);
    mouseDown = true;
};

window.onmouseup = (e) => {
    mouseDown = false;
};


socket.on('ondraw',(x,y)=>{
    ctx.lineTo(x,y);
    ctx.stroke();
})
socket.on('ondown',(x,y)=>{
    ctx.beginPath();
    ctx.moveTo(x,y);
})

socket.on('apply-b_size',(e)=>{
    ctx.lineWidth =e;
})
socket.on('apply-b_color',(e)=>{
    ctx.strokeStyle =e;
})
window.onmousemove = (e) => {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    ctx.strokeStyle = b_color;
    ctx.lineWidth = b_size;
    if (mouseDown) {
        socket.emit('draw',x,y,id);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
};

clear_btn.addEventListener("click",(e)=>{
    socket.emit('erase_all',id);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

socket.on("apply-erase",(id)=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})


