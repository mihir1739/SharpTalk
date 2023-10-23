import React from 'react'
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes, Route} from 'react-router-dom'
import './App.css'
import LobbyScreen from './screens/Lobby';
import {SocketProvider} from "./context/SocketProvider";
import RoomPage from './screens/Room';
function App() {

  return (
    <BrowserRouter>
      <SocketProvider>
      <Routes>
        <Route path='/' element ={<LobbyScreen/>} />
        <Route path='/room/:roomId' element={<RoomPage/>}/>
      </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App
