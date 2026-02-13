import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an item name'],
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: false, // Optional as per requirements (office supplies usually free for employees?)
    },
    available: {
        type: Boolean,
        default: true,
    },
    category: {
        type: String, // e.g., 'Beverage', 'Snack'
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
