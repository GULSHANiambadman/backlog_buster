import mongoose from 'mongoose';

const playSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for finding active sessions
playSessionSchema.index({ userId: 1, gameId: 1, isActive: 1 });

// Calculate duration before saving
playSessionSchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.floor((this.endTime - this.startTime) / (1000 * 60)); // minutes
        this.isActive = false;
    }
    next();
});

export default mongoose.model('PlaySession', playSessionSchema);
