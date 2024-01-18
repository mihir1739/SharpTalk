import React, {useCallback, useEffect,useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";
const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream,setMyStream] = useState(null); 
    const [remoteStream, setRemoteStream]= useState();
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
        for (const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        }
    },[myStream])

    const handleNegoNeedIncoming = useCallback(()=> {
        
    })

    useEffect(()=> {
        peer.peer.addEventListener('track',async ev => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream);
        });
    },[]);

    const handleNegoNeeded = useCallback(async() => {
        const offer = await peer.getOffer();
        socket.email('peer:nego:needed',{offer, to:remoteSocketId})
    },[remoteSocketId, socket]);

    
    useEffect(()=> {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return ()=> {
            peer.peer.removeEventListener("negotiationneeded",handleNegoNeeded);
        }
    },[handleNegoNeeded]);

    useEffect(()=> {
        socket.on('user:joined',handleUserJoined);
        socket.on("incoming:call",handleIncomingCall);
        socket.on("call:accepted",handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming)
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
            <h1>My Stream</h1>
            <ReactPlayer playing muted height="100px" width="200px" url={myStream}/>
            </>
            )
        }
        {
            remoteStream && (
            <>
            <h1>Remote Stream</h1>
            <ReactPlayer playing muted height="200px" width="400px" url={myStream}/>
            </>
            )
        }
    </div>
    )
}

export default RoomPage;