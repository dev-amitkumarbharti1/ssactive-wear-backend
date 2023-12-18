import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Types.ObjectId },
    shopifyOrderId: { type: Number, required: true },
    shopifyOrderData: { type: Object, required: true },
    suplierData: { type: [Object] },
    suppierOrderNumber: { type: String },
    isCreated: { type: Boolean, default: false, required: true },
    isTrackingRecieved: { type: Boolean, default: false, required: true },
    trackingInfo: { type: Object },
    cancelOrder: { type: Boolean, default: false, required: true },
}, {
    timestamps: true
});

export const OrderModel = mongoose.model('order', orderSchema);