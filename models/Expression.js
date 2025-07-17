import mongoose from 'mongoose';

const expressionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    draft: {
        type: String,
        required: true
    },
    english: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    isMemory: {
        type: Boolean,
        default: false
    },
    numberStudy: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date,
        default: null
    }
});

// Create compound index for unique ID per user
expressionSchema.index({ id: 1, userId: 1 }, { unique: true });

const Expression = mongoose.model('Expression', expressionSchema);

export default Expression; 