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

let host;

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
        host = userid.value;
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
    // console.log(usermsg.value);
    if(usermsg.value)
    {
        socket.emit('chat',usermsg.value,userid.value,id)
        usermsg.value ='';
    }
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
  item.id=`user_${roomid}_${user_names[i][1]}`;
 item.style.color = 'white'
 item.innerHTML=` <div class="flex gap-10 all-user-info"><img src="media/user.svg" alt=""><div></div>${user_names[i][1]}</div>`;

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
    brush_size.value =e;
    b_size=e;
})
socket.on('apply-b_color',(e)=>{
    ctx.strokeStyle =e;
    brush_color.value =e;
    b_color =e;
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


// Game


let start_display = document.getElementById("at_start");
let start_btn  = document.getElementById("startbtn");
let who_are_drawing=document.getElementById("who_are_drawing")
let who_have_to_guess=document.getElementById("who_have_to_guess")
let display_word = document.getElementById("display_word");
let timerofmsg = document.getElementById("timer_of_msg");
let tasktimer = document.getElementById("tasktimer");
let word= document.getElementById("word");


start_btn.addEventListener("click",(e)=>{
    if(host!=null)
    {
    socket.emit("start_game",id);
    }
})


socket.on('change-vis-of-start',(id)=>{
    start_display.style.visibility ="visible";
})

socket.on('change-vis-of-start_to_hide',(id,name)=>{
    start_display.style.visibility ="hidden";
    console.log(name);
    const item = document.createElement('li');
    item.innerText = `${name} is drwaing`;
    item.style.color = "yellow";
    messages.appendChild(item);
})

socket.on('change-div-of-timermsg',(rem,id)=>{
    timerofmsg.innerText= rem;
})
socket.on('change-div-of-word-timer',(rem,id)=>{
    tasktimer.innerText= rem;
})

let curr_word;
let curr_turn;
socket.on("show_word_to_drawer",(id,w,user_name)=>{
    
    who_are_drawing.innerText ="";
    who_have_to_guess.innerText="";
    display_word.innerText = "";
    word.innerText="";
    curr_word = w;
    curr_turn = user_name;
     if(user_name===userid.value)
     {
          socket.emit('change-svg-to-write',id,userid.value);
        who_are_drawing.innerText = "You are Drawing";
        who_have_to_guess.innerText ="Other have to Guess";
        display_word.innerText = `word: ${w}`;
        word.innerText = w;
     }
     else
     {
          socket.emit('change-svg-to-user',id,userid.value);
        who_are_drawing.innerText = `${user_name} is drawing`
        who_have_to_guess.innerText ="You have to Guess the word";
        word.innerText = "";
        for (let i = 0; i < w.length; i++) {
            
            word.innerText= word.innerText + "_ ";
        }
     }
})
socket.on('show_chat', (msg,useriD,originalMsg) => {
    const item = document.createElement('li');
    
    if((originalMsg)==(curr_word))
    {
        item.textContent  = ` ${useriD} has correctly guessed !`;
        item.style.color = "orange";
        item.style.fontWeight ="bold";
        
    }
    else item.textContent = msg;

    messages.appendChild(item);
    console.log(messages);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('change-it-to-write',(id,Username,user_names)=>{

    let user_div =  document.getElementById(`user_${id}_${Username}`);
    if (user_div) {
     user_div.querySelector('img').src = 'media/pen.svg';
     console.log(`user_${id}_${Username}`);
 }
 
 })
 socket.on('change-it-to-user',(id,Username,user_names)=>{
 
     console.log(Username);
     let user_div =  document.getElementById(`user_${id}_${Username}`);
     if (user_div) {
      user_div.querySelector('img').src = 'media/user.svg';
      console.log(`user_${id}_${Username}`);
     }
 })


 



