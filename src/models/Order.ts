import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    itemName: { // Denormalize name to avoid extra queries if item is deleted/changed
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const OrderSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    employeeName: {
        type: String,
        required: true // Denormalize for easier display
    },
    department: {
        type: String,
        required: true
    },
    items: [OrderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'delivered', 'cancelled'],
        default: 'pending',
    },
    note: {
        type: String,
        maxlength: 200,
    },
    orderedAt: {
        type: Date,
        default: Date.now,
    },
    deliveredAt: {
        type: Date,
    },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
