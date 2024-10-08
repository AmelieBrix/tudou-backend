require("dotenv").config();
require("./db");


const express = require("express");
const app = express();

app.use(express.json());
 
require("./config/index")(app);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const authRouter = require("./routes/authRoutes");       
app.use("/auth", authRouter);

const postRoutes = require('./routes/postRoutes'); 
app.use("/posts", postRoutes);

const userRouter = require('./routes/userRoutes');
app.use("/users", userRouter);

const chatRoutes = require('./routes/chatRoutes');
app.use("/", chatRoutes); //check if it works, when frontend part of package is implemented

app.post('/message', (req, res) => {
    const { message } = req.body;
  
    // Log the message to the console
    console.log('Received message from frontend:', message);
  
    // Respond back to the frontend
    res.status(200).json({ message: 'Message received successfully' });
  });
  console.log('Cloudinary Name:', process.env.CLOUDINARY_NAME);
  console.log('Cloudinary Key:', process.env.CLOUDINARY_KEY);
  console.log('Cloudinary Secret:', process.env.CLOUDINARY_SECRET);

  const path = require('path');
  app.use('./public', express.static(path.join(__dirname, 'public')));  

module.exports = app;