const mongoose = require('mongoose');

const taskExecutionSchema = mongoose.Schema({
    executionTime: {type: Date, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inAdvance: {type: Boolean, required: true},
    make: {type: Boolean, required: true}
});

module.exports = mongoose.model('TaskExecution', taskExecutionSchema);