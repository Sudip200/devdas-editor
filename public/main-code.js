
  const textArea = document.getElementById('editor');
  const a = document.querySelector('a');
  const language = document.getElementById('language');
  const videogrid = document.getElementById('video-grid')
  const whitediv = document.getElementById('whiteboard');
  const both = document.getElementById('both');
  const canvas = document.getElementById('canvas');
  const text = document.getElementById('textbox');
  const clear = document.getElementById('clear');
  let current = 'text';
  let roomid;
  let editor;
  let ctx= canvas.getContext('2d');
  const roomname = document.getElementById('roomname');
  const myVideo = document.createElement('video');
  const socket = io();
  let localStream;
  var peer = new Peer();


   if(current === 'text'){
    text.style.backgroundColor = '#B706BF';

  
  }

  window.onload = function(){
    const path= window.location.pathname;
    const len= path.split('/').length;
    console.log(path.split('/'));
    let room = path.split('/')[len-1];
    console.log(room);
    roomid = room;
    roomname.innerText = room;
  }
  peer.on('open',(id)=>{
  console.log(id);
  socket.emit('joinroom',roomid,id);
})
  navigator.mediaDevices.getUserMedia({ video: {width:200,aspectRatio:
    {ideal:1} 
  }, audio: true  })
    .then((stream) => {
      addVideoStream(myVideo, stream);
    
     //answer call with stream and add remote video
     peer.on('call',(call)=>{
        call.answer(stream);
        console.log('answering')
        const remoteVideo = document.createElement('video');
        call.on('stream',(remoteStream)=>{
         addVideoStream(remoteVideo,remoteStream);
        })
        call.on('close',()=>{
          remoteVideo.remove();
        })
        window.onbeforeunload = function(){
        call.close();
      }
     })
      

     text.addEventListener('click',()=>{
      text.style.backgroundColor = '#B706BF';
      textArea.style.display = 'block';
      canvas.style.display = 'none';
      clear.style.display = 'none';
   
      resetBackground(whitediv);
      
     })
      
      whitediv.addEventListener('click',()=>{
      whitediv.style.backgroundColor = '#B706BF';
      canvas.style.display = 'block';
      clear.style.display = 'block';
      textArea.style.display = 'none';
      resetBackground(text);

     
      })

      function changeBackground(element) {
        element.style.backgroundColor = '#B706BF';
        element.style.color = 'black';
      }
      function resetBackground(element) {
        element.style.backgroundColor = '#0F0238';
        element.style.color = 'white';
      }


    





     //call with stream and add remote video of the answer
     socket.on('onjoin',(id)=>{
      console.log(id);
      const call =peer.call(id,stream);
      console.log('calling')
      const remoteVideo = document.createElement('video');
      call.on('stream',(remoteStream)=>{
        
        addVideoStream(remoteVideo,remoteStream);
      })
      call.on('close',()=>{
        remoteVideo.remove();
      })
      //remove video if tab is closed
      window.onbeforeunload = function(){
        call.close();
      }

     })

  })
    .catch((error) => {
      console.error('Error accessing media devices.', error);
    });

    function addVideoStream(video, stream) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      videogrid.appendChild(video);
    }
textArea.addEventListener('input', (event) => {
  socket.emit('onchange', textArea.value, roomid);
});
socket.on('onrecv', (data) => {
  
  textArea.value = data;
});

//whiteboard code

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.strokeStyle = '#B706BF';
canvas.addEventListener('mousedown', (e) => {
  let x = e.offsetX;
  let y = e.offsetY;
  socket.emit('onmousedown', x, y, roomid);
  ctx.beginPath();
  ctx.moveTo(x, y);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseout', onMouseOut);
});
function onMouseMove(e) {
  let x = e.offsetX;
  let y = e.offsetY;
  socket.emit('onmousemove', x, y, roomid);
  ctx.lineTo(x, y);
  ctx.stroke();
}
function onMouseUp() {
  socket.emit('onmouseup', roomid);
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mouseup', onMouseUp);
  canvas.removeEventListener('mouseout', onMouseOut);
}
function onMouseOut() {
  socket.emit('onmouseup', roomid);
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mouseup', onMouseUp);
  canvas.removeEventListener('mouseout', onMouseOut);
} 
socket.on('onmousedown', (x, y) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseout', onMouseOut);
});
socket.on('onmousemove', (x, y) => {
  ctx.lineTo(x, y);
  ctx.stroke();
});
socket.on('onmouseup', () => {
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mouseup', onMouseUp);
  canvas.removeEventListener('mouseout', onMouseOut);
});
clear.addEventListener('click', () => {
  clearCanvas();
  socket.emit('clear', roomid);
});
socket.on('clear', () => {
  clearCanvas();
});
//clear whiteboard
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//change color of pen
function changeColor(color) {
  ctx.strokeStyle = color;
}






 





