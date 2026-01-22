import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    appId: {
        type: String,
        default: ''
    },
    playTime: {
        type: Number,
        default: 0, // in minutes
    },
    genres: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    source: {
        type: String,
        enum: ['steam', 'local', 'manual'],
        default: 'manual'
    },
    installPath: {
        type: String,
        default: ''
    },
    lastPlayed: {
        type: Date,
        default: null
    },
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Create compound index to prevent duplicate games per user
gameSchema.index({ userId: 1, title: 1 }, { unique: true });

export default mongoose.model('Game', gameSchema);
