
const http =require('http')
const fs =require('fs')
const express = require('express');
const app = express();
const {Server} =require('socket.io')

let certificate =fs.readFileSync(__dirname+'/ssl/certificate.crt')
let privateKey =fs.readFileSync(__dirname+'/ssl/private.key')
let ca =fs.readFileSync(__dirname+'/ssl/ca_bundle.crt')

const httpServer=http.createServer({
    key:privateKey,
    cert:certificate,
    ca:ca
},app);

const io = new Server(httpServer)



app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/room.html')
})
app.get('/room/main-code.js',(req,res)=>{
    res.sendFile(__dirname+'/public/main-code.js')
})
app.get('/room/style.css',(req,res)=>{
    res.sendFile(__dirname+'/public/style.css')
})
app.get('/room/:id',(req,res)=>{

    res.sendFile(__dirname+'/public/index.html')
})


io.on("connection",(socket)=>{
   //get ip address of the user
    const ip = socket.handshake.address
    console.log("Client connected "+ip)
    //detect which room the user connecting to
    socket.on('joinroom',(room,peerid)=>{
        console.log("Room "+room+" peerid "+peerid)
        socket.join(room)
        socket.broadcast.to(room).emit('onjoin',peerid)
    })
    socket.on('stream',(data,room)=>{
        console.log("Room "+room+" message "+data)
        io.in(room).emit('onstream',data)
    })
    socket.on('peerid',(data)=>{
        console.log(data)
        //emit to all except the sender
        socket.broadcast.emit('onpeerid',data)
    })
    socket.on('onchange',(data,room)=>{
       
            console.log("Room "+data+" message "+room)
          io.in(room).emit('onrecv',data)
    })
  
    socket.on('disconnect',()=>{
        console.log("Client disconnected ")
    })
})
httpServer.listen(8080, function () {
    console.log('Example app listening on port 80');
  }
);