
const https =require('http')
const http =require('http')
const fs =require('fs')
const express = require('express');
const app = express();
const {Server} =require('socket.io')

let certificate =fs.readFileSync(__dirname+'/ssl/certificate.crt')
let privateKey =fs.readFileSync(__dirname+'/ssl/private.key')
let ca =fs.readFileSync(__dirname+'/ssl/ca_bundle.crt')

const httpsServer=https.createServer({
    key:privateKey,
    cert:certificate,
    ca:ca
},app);
const httpServer = http.createServer((req,res)=>{
    res.writeHead(301,{
        Location:'https://'+req.headers.host+req.url
    })
    res.end();

})


const io = new Server(httpsServer)
//const io2 = new Server(httpServer)


const date = new Date();


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
app.get('/style2.css',(req,res)=>{
    res.sendFile(__dirname+'/public/sliding.css')
})


io.on("connection",(socket)=>{
   //get ip address of the user
    const ip = socket.handshake.address
    console.log("Client connected "+date.toLocaleString()+' '
    +ip)
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
          socket.to(room).emit('onrecv',data)
    })
    socket.on('onmousedown',(x,y,room)=>{
      
        socket.to(room).emit('onmousedown',x,y)
    })
    socket.on('onmousemove',(x,y,room)=>{
        socket.to(room).emit('onmousemove',x,y)
    })
    socket.on('onmouseup',(room)=>{
        socket.to(room).emit('onmouseup')
    })
    socket.on('clear',(room)=>{
        socket.to(room).emit('clear')
    })
  
    socket.on('disconnect',()=>{
        console.log("Client disconnected ")
    })
})


httpsServer.listen(8080, function () {
    console.log('Example app listening on port 443');
  }
);
httpServer.listen(8081, function () {
    console.log('Example app listening on port 80');
  }
);
