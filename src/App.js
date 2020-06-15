import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState({});
  const [room, setRoom] = useState({});
  const [message, setMessage] = useState({});
  const [typing, setTyping] = useState({});
  const [sideBarOpen, setSideBarOpen] = useState("false");
  const [userListOpen, setUserListOpen] = useState({});

  useEffect(() => {}, []);

  const joinRoom = (room) => {
    setRoom(room);
  };

  return <div className="App"></div>;
}

export default App;
