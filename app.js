require("dotenv").config();
require("./db");


const express = require("express");
const app = express();

app.use(express.json());
 
require("./config/index")(app);

const authRouter = require("./routes/authRoutes");       
app.use("/auth", authRouter);
// --für später

const postRoutes = require('./routes/postRoutes'); 
app.use("/posts", postRoutes);


app.post('/message', (req, res) => {
    const { message } = req.body;
  
    // Log the message to the console
    console.log('Received message from frontend:', message);
  
    // Respond back to the frontend
    res.status(200).json({ message: 'Message received successfully' });
  });

module.exports = app;