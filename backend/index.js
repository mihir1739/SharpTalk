const app = require("express")()
const {Server} = require('socket.io')
const bodyParser = require("body-parser")
const server = require("http").createServer(app)
const cors= require("cors")
app.use(bodyParser.json())
io.on('connection',(socket) => {});
const io = new Server();
app.listen(8000, () => console.log("HTTP server running at port 8000"));
io.listen(8001);

