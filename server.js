require("dotenv").config();
const express = require("express");
const http = require('http');
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute")
const notificationRoute = require("./routes/notificationRoute")
const projectRoute = require("./routes/projectRoute")
const stageRoute = require("./routes/stageRoute")
const taskRoute = require("./routes/taskRoute")
const dashboardRoute = require("./routes/dashboardRoute")
const errorHandler = require("./middleware/errorMiddleware");
const initializeSocket = require('./socket/Socket');
// import the initializeSocket function
const app = express();
const server = http.createServer(app);
const io = initializeSocket();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://authz-app.vercel.app"],
    credentials: true,
  })
);
app.options('*', cors({
  origin: ["http://localhost:3000", "https://authz-app.vercel.app"],
  credentials: true,
}));
// Routes
app.use("/api/users", userRoute)
app.use("/api/notifications", notificationRoute)
app.use("/api/projects", projectRoute)
app.use("/api/stages", stageRoute)
app.use("/api/tasks", taskRoute)
app.use("/api/dashboard", dashboardRoute)
app.get("/", (req, res) => {
  res.send("Home Page");
});
// Error Handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
// io.on("connection", (socket) => {
//   console.log("a user connected.");
//   // add new User
//   socket.on("new-user-add", (newUserId) => {
//     io.emit("test", { message: 'Welcome to the server.' })
//     // if user is not added previously
//     if (!activeUsers.some((user) => user.userId === newUserId)) {
//       activeUsers.push({ userId: newUserId, socketId: socket.id });
//       console.log("New User Connected", activeUsers);
//     }
//     // send all active users to new user
//     io.emit("get-users", activeUsers);
//   });
//   socket.on("disconnect", () => {
//     // remove user from active users
//     activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
//     console.log("User Disconnected", activeUsers);
//     // send all active users to all users
//     io.emit("get-users", activeUsers);
//   });
//   // send message to a specific user
//   socket.on("send-message", (data) => {
//     const { receiverId } = data;
//     const user = activeUsers.find((user) => user.userId === receiverId);
//     console.log("Sending from socket to :", receiverId)
//     console.log("Data: ", data)
//     if (user) {
//       io.to(user.socketId).emit("recieve-message", data);
//     }
//   });
//   // send notification to a specific user
//   socket.on("send-notification", (data) => {
//     const { receiverId } = data;
//     const user = activeUsers.find((user) => user.userId === receiverId);
//     console.log("Sending from socket to :", receiverId)
//     console.log("Data: ", data)
//     if (user) {
//       io.to(user.socketId).emit("recieve-message", data);
//     }
//   });
// });
