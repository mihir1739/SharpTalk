// const app = require("express")()
const {Server} = require('socket.io')
// const bodyParser = require("body-parser")
// const server = require("http").createServer(app)
const emailToSocketIDMap = new Map();
const sockedIDtoEmailMap = new Map();
const cors= require("cors")
// app.use(bodyParser.json())
const io = new Server(8000, {
    cors: {
        origin: "*"
      }
});
io.on('connection',(socket) => {
    console.log(`Socket Connected`,socket.id);
    socket.on("room:join",data => {
        const {email,room} = data;
        sockedIDtoEmailMap.set(socket.id,email);
        emailToSocketIDMap.set(email,socket.id);
        io.to(room).emit("user:joined",{email, id : socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
    });
    socket.on("user:call",({ to, offer}) => {
        io.to(to).emit("incoming:call", {from:socket.id, offer })
    });
    socket.on("call:accepted", ({to, ans}) => {
        io.to(to).emit("call:accepted", {from:socket.id, ans })
    });
    socket.on("peer:nego:needed",({ to, offer}) => {
        io.to(to).emit("peer:nego:needed",{ from: socket.id, offer })
    })
});
// app.listen(8000, () => console.log("HTTP server running at port 8000"));
// io.listen(8001);

