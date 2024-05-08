const textArea = document.getElementById('editor');
  const a = document.querySelector('a');
  const language = document.getElementById('language');
  const videogrid = document.getElementById('video-grid')
  let roomid;
  let editor;
  const roomname = document.getElementById('roomname');
  const myVideo = document.createElement('video');
  const socket = io();
  let localStream;
  var peer = new Peer();
  // require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' }});
  // window.MonacoEnvironment = { getWorkerUrl: () => proxy };
  
  // let proxy = URL.createObjectURL(new Blob([`
  //   self.MonacoEnvironment = {
  //     baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
  //   };
  //   importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
  // `], { type: 'text/javascript' }));
  
  // require(["vs/editor/editor.main"], function () {
  //  editor = monaco.editor.create(document.getElementById('container'), {
  //     value: [
  //   ''
  //     ].join('\n'),
  //     language: language.value,
  //     theme: 'vs-dark',
    
  //   });
  //   let previousValue = editor.getValue();
  //   editor.onDidChangeModelContent((event) => {
  //     const currentValue = editor.getValue();
     
  //     if (currentValue !== previousValue) {
  //     socket.emit('onchange', currentValue, roomid);
  //     previousValue = currentValue;
  //     }
  //   });
  //   language.addEventListener('change', (event) => {
  //     monaco.editor.setModelLanguage(editor.getModel(), event.target.value);
  //   });
      
  // });
  //on monaco editor change

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
  textArea.innerHTML= data;
});
 





