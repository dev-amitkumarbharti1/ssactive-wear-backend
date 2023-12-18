import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Types.ObjectId, required: true },
    template_name: { type: String, required: true },
    type: { type: String, required: true, enum: ['increase', 'decrease'] },
    value: { type: Number, required: true },
    value_type: { type: String, required: true, enum: ['flat', 'percentage'] }
}, {
    timestamps: true
});

export const PriceModel = mongoose.model('price_rules', priceSchema);