import React, { Component } from "react";
import "./App.css";

import { CreateMessageForm } from "./components/CreateMessageForm/createMessageForm";
import { UserHeader } from "./components/UserHeader/userHeader";
import { UserList } from "./components/UserList/userList";
import { RoomHeader } from "./components/RoomHeader/roomHeader";
import { TypingIndicator } from "./components/TypingIndicator/typingIndicator";

class App extends Component {
  state = {
    user: {},
    room: {},
    messages: {},
    typing: {},
    sidebarOpen: false,
    userListOpen: window.innerWidth > 1000,
  };

  actions = {
    setSidebar: (sidebarOpen) => this.setState({ sidebarOpen }),
    setUserList: (userListOpen) => this.setState({ userListOpen }),

    setUser: (user) => this.setState({ user }),

    setRoom: (room) => {
      this.setState({ room, sidebarOpen: false });
      this.actions.scrollToEnd();
    },

    removeRoom: (room) => this.setState({ room: {} }),

    joinRoom: (room) => {
      this.actions.setRoom(room);
      this.actions.subscribeToRoom(room);
      this.state.messages[room.id] &&
        this.actions.setCursor(
          room.id,
          Object.keys(this.state.messages[room.id]).pop()
        );
    },

    subscribeToRoom: (room) =>
      !this.state.user.roomSubscriptions[room.id] &&
      this.state.user.subscribeToRoom({
        roomId: room.id,
        hooks: { onMessage: this.actions.addMessage },
      }),

    createRoom: (options) =>
      this.state.user.createRoom(options).then(this.actions.joinRoom),

    createConvo: (options) => {
      if (options.user.id !== this.state.user.id) {
        const exists = this.state.user.rooms.find(
          (x) =>
            x.name === options.user.id + this.state.user.id ||
            x.name === this.state.user.id + options.user.id
        );
        exists
          ? this.actions.joinRoom(exists)
          : this.actions.createRoom({
              name: this.state.user.id + options.user.id,
              addUserIds: [options.user.id],
              private: true,
            });
      }
    },

    addUserToRoom: ({ userId, roomId = this.state.room.id }) =>
      this.state.user
        .addUserToRoom({ userId, roomId })
        .then(this.actions.setRoom),

    removeUserFromRoom: ({ userId, roomId = this.state.room.id }) =>
      userId === this.state.user.id
        ? this.state.user.leaveRoom({ roomId })
        : this.state.user
            .removeUserFromRoom({ userId, roomId })
            .then(this.actions.setRoom),

    setCursor: (roomId, position) =>
      this.state.user
        .setReadCursor({ roomId, position: parseInt(position) })
        .then((x) => this.forceUpdate()),

    addMessage: (payload) => {
      const roomId = payload.room.id;
      const messageId = payload.id;

      this.setState((prevState) => ({
        messages: {
          ...prevState.messages,
          [roomId]: {
            ...prevState.messages[roomId],
            [messageId]: payload,
          },
        },
      }));

      if (roomId === this.state.room.id) {
        const cursor = this.state.user.readCursor({ roomId }) || {};
        const cursorPosition = cursor.position || 0;
        cursorPosition < messageId && this.actions.setCursor(roomId, messageId);
        this.actions.scrollToEnd();
      }

      this.actions.showNotification(payload);
    },

    runCommand: (command) => {
      const commands = {
        invite: ([userId]) => this.actions.addUserToRoom({ userId }),
        remove: ([userId]) => this.actions.removeUserFromRoom({ userId }),
        leave: ([userId]) =>
          this.actions.removeUserFromRoom({ userId: this.state.user.id }),
      };
      const name = command.split(" ")[0];
      const args = command.split(" ").slice(1);
      const exec = commands[name];
      exec && exec(args).catch(console.log);
    },

    scrollToEnd: (e) =>
      setTimeout(() => {
        const elem = document.querySelector("#messages");
        elem && (elem.scrollTop = 100000);
      }, 0),

    isTyping: (room, user) =>
      this.setState((prevState) => ({
        typing: {
          ...prevState.typing,
          [room.id]: {
            ...prevState.typing[room.id],
            [user.id]: true,
          },
        },
      })),

    notTyping: (room, user) =>
      this.setState((prevState) => ({
        typing: {
          ...prevState.typing,
          [room.id]: {
            ...prevState.typing[room.id],
            [user.id]: false,
          },
        },
      })),

    setUserPresence: () => this.forceUpdate(),

    showNotification: (message) => {
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
    },
  };

  componentDidMount() {}

  render() {
    const {
      user,
      room,
      messages,
      typing,
      sidebarOpen,
      userListOpen,
    } = this.state;
    const { createRoom, createConvo, removeUserFromRoom } = this.actions;

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
}

export default App;
