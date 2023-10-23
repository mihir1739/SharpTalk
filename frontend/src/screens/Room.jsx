import React, {useCallback, useEffect,useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";
const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream,setMyStream] = useState(null); 
    const handleCallUser = useCallback(async()=> {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video:true});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to: remoteSocketId, offer})
        setMyStream(stream);
    },[remoteSocketId, socket])
    const handleUserJoined = useCallback(({email,id}) => {
        console.log(`Email ${email} joined to room.`);
        setRemoteSocketId(id);
    })

    const handleIncomingCall = useCallback(async ({from,offer})=> {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video:true});
        setMyStream(stream);
        console.log(`incoming call from ${from}`,offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", {to:from, ans});
    },[socket])

    const handleCallAccepted = useCallback(({from, ans}) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted");
    },[])

    useEffect(()=> {
        socket.on('user:joined',handleUserJoined);
        socket.on("incoming:call",handleIncomingCall);
        socket.on("call:accepted",handleCallAccepted);
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call",handleIncomingCall);
            socket.off("call:accepted",handleCallAccepted);
        }
    },[socket,handleUserJoined,handleIncomingCall])
    return (
    <div>
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "Alone"}</h4>
        {
            remoteSocketId && <button onClick={handleCallUser}>Call</button>
        }
        {
            myStream && (
            <>
            <ReactPlayer playing muted height="300px" width="500px" url={myStream}/>
            </>
            )
        }
    </div>
    )
}

export default RoomPage;