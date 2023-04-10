const jwt = require('jsonwebtoken');
let activeUsers = []
function initializeSocket() {
    const io = require("socket.io")(8900, {
        cors: {
            origin: "http://localhost:3000",
        },
    });
    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const myId = socket.id;
        // console.log(myId);
        console.log("A user connected")
        socket.on("disconnect", () => {
            // remove user from active users
            activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
            console.log("User Disconnected", activeUsers);
            // send all active users to all users
            io.emit("get-users", activeUsers);
        });
        io.to(socket.id).emit("test", socket.id);
        socket.on("new-user-add", (newUserId) => {
            console.log("new user add emitted")
            // if user is not added previously
            if (!activeUsers.some((user) => user.userId === newUserId)) {
                activeUsers.push({ userId: newUserId, socketId: socket.id });
                console.log("New User Connected", activeUsers);
            }
            // send all active users to new user
            io.emit("get-users", activeUsers);
        });
        socket.on("send-notification", (toUserId, type) => {
            const user = activeUsers.find((user) => user.userId === toUserId);
            console.log("Data: TYhis is my data and it has been fired ")
            console.log(type)
            if (user) {
                if (type === "role update") {
                    io.to(user.socketId).emit("get-notification", type);
                }
            }
        });
    });
    return io;
}
module.exports = initializeSocket;
