import React, { useState, useEffect } from "react";
import "./App.css";

export function App() {
  const [user, setUser] = useState({});
  const [room, setRoom] = useState({});
  const [message, setMessage] = useState({});
  const [typing, setTyping] = useState({});
  const [sideBarOpen, setSideBarOpen] = useState("false");
  const [userListOpen, setUserListOpen] = useState({});

  useEffect(() => {}, []);

  const joinRoom = (room) => {
    setRoom({ room: room });
  };

  const createRoom = (options) =>
    this.state.user.createRoom(options).then(this.actions.joinRoom);

  const subscribeToRoom = (room) =>
    !this.state.user.roomSubscriptions[room.id] &&
    this.state.user.subscribeToRoom({
      roomId: room.id,
      hooks: { onMessage: this.actions.addMessage },
    });

  const showNotification = (message) => {
    if (
      "Notification" in window &&
      this.state.user.id &&
      this.state.user.id !== message.senderId &&
      document.visibilityState === "hidden"
    ) {
      const notification = new Notification(
        `New Message from ${message.sender.id}`,
        {
          body: message.text,
          icon: message.sender.avatarURL,
        }
      );
      notification.addEventListener("click", (e) => {
        this.actions.joinRoom(message.room);
        window.focus();
      });
    }
  };

  return (
    <main>
      <aside data-open={sidebarOpen}>
        <UserHeader user={user} />
        <RoomList
          user={user}
          rooms={user.rooms}
          messages={messages}
          typing={typing}
          current={room}
          actions={this.actions}
        />
        {user.id && <CreateRoomForm submit={createRoom} />}
      </aside>
      <section>
        <RoomHeader state={this.state} actions={this.actions} />
        {room.id ? (
          <row->
            <col->
              <MessageList
                user={user}
                messages={messages[room.id]}
                createConvo={createConvo}
              />
              <TypingIndicator typing={typing[room.id]} />
              <CreateMessageForm state={this.state} actions={this.actions} />
            </col->
            {userListOpen && (
              <UserList
                room={room}
                current={user.id}
                createConvo={createConvo}
                removeUser={removeUserFromRoom}
              />
            )}
          </row->
        ) : user.id ? (
          <JoinRoomScreen />
        ) : (
          <WelcomeScreen />
        )}
      </section>
    </main>
  );
}
