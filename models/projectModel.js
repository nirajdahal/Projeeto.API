const mongoose = require("mongoose")
const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [30, 'Name can not be more than 30 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [50, 'Description can not be more than 50 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)
// Reverse populate with virtuals
ProjectSchema.virtual('stages', {
    ref: 'Stage',
    localField: '_id',
    foreignField: 'project',
    justOne: false
});
//cascade delete task when a project is deleted
ProjectSchema.pre('remove', async function (next) {
    console.log('stage being removed from project', this._id)
    await this.model('Stage').deleteMany({ stage: this._id })
    next()
})
module.exports = mongoose.model('Project', ProjectSchema)