const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        type: { type: String, required: true }
    },
    { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification