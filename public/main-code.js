const textArea = document.getElementById('editor');
  const a = document.querySelector('a');
  let roomid;
  const roomname = document.getElementById('roomname');
  const myVideo = document.createElement('video');
  const socket = io();
  let localStream;
  var peer = new Peer();
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
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      myVideo.srcObject = stream;
      myVideo.autoplay = true;
      document.body.appendChild(myVideo);
    
     //answer call with stream and add remote video
     peer.on('call',(call)=>{
        call.answer(stream);
        console.log('answering')
        const remoteVideo = document.createElement('video');
        call.on('stream',(remoteStream)=>{
          remoteVideo.srcObject = remoteStream;
          remoteVideo.autoplay = true;
          document.body.appendChild(remoteVideo);
        })
        call.on('close',()=>{
          remoteVideo.remove();
        })
        window.onbeforeunload = function(){
        call.close();
      }
     })


     //call with stream and add remote video of the answer
     socket.on('onjoin',(id)=>{
      console.log(id);
      const call =peer.call(id,stream);
      console.log('calling')
      const remoteVideo = document.createElement('video');
      call.on('stream',(remoteStream)=>{
        
        remoteVideo.srcObject = remoteStream;
        remoteVideo.autoplay = true;
        document.body.appendChild(remoteVideo);
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


 


document.getElementById('editor').addEventListener('input', () => {
    socket.emit('onchange', textArea.value, roomid);
});

socket.on('onrecv', (data) => {
    textArea.innerHTML = data;
});


