const express = require('express')
const { Server, Socket } = require('socket.io')
const bodyParser = require('body-parser')


const io = new Server({
    cors: true,
});
const app = express();


app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection' , socket => {
    //yaha signeling ka code likho 
    console.log("New Connection");
    socket.on('join-room' , data => {
        const { roomId , emailId } = data;
        console.log("User " , emailId , " joined " , roomId);
        emailToSocketMapping.set(emailId , socket.id);
        socketToEmailMapping.set(socket.id , emailId);
        socket.join(roomId);
        socket.emit('joined-room' , { roomId });
        socket.broadcast.to(roomId).emit("user-joined", { emailId });
    });

    socket.on('call-user' , data => {
        const { emailId , offer } = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('incomming-call', { from: fromEmail , offer}) // incomming call aa rahi hai from this email nd ye uski offer hai 
        
    })

    socket.on('call-accepted' , data => {
        const { emailId , ans} = data;
        //ab ye cheej vapis user A k pass le jana hai 
        //socket id nikal lo from map 
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accepted' , { ans });

    })
})


app.listen(8000 , () => {
    console.log(`App is listening on PORT : 8000`)
})
io.listen(8001);