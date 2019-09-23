const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    members: {type: [{userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                    position: Number,
                    madeInAdvance: Boolean}
                    ]},
    inCharge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model('Task', taskSchema);
