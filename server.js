const app = require("./app");
const PORT = process.env.PORT || 5005;
const MessageModel = require('./models/Message.model');

// Only call `app.listen()` once and store the server instance
let myServer = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Set up Socket.io with CORS configuration
const { Server } = require("socket.io");
const io = new Server(myServer, {
  cors: {
    origin: '*',  // Adjust this to your frontend URL if needed
  }
});

// Set up the socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Handle joining a chat room
  socket.on("join_chat", (data) => {
    socket.join(data);
    console.log("User Joined Room: " + data);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { content: { sender, message }, chatId } = data;
    let newMessage = {
      sender: sender._id, 
      message: message, 
      conversationId: chatId
    };

    // Save the message to the database
    MessageModel.create(newMessage)
      .then(() => {
        // Emit the message to other users in the room
        socket.to(chatId).emit("receive_message", data.content);
      })
      .catch(err => console.error('Error saving message:', err));
  });
});
