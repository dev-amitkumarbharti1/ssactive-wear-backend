import mongoose, { Schema, Document } from "mongoose";

export enum ProductStatus {
    NOT_UPLOADED = 0,
    UPLOADED = 1,
    UPLOAD_AS_DRAFT = 2,
    UPLOADED_AS_ARCHIVED = 3
}

interface IProduct extends Document {
    merchantId: mongoose.Types.ObjectId;
    styleID: number;
    partNumber: string;
    brandName: string;
    styleName: string;
    title: string;
    description: string;
    baseCategory: string;
    categories: string;
    catalogPageNumber: string;
    newStyle: boolean;
    comparableGroup: string;
    companionGroup: string;
    priceRuleId: mongoose.Types.ObjectId;
    brandImage: string;
    styleImage: string;
    shopifyProductId?: string;
    shopifyData?: { [key: string]: any };
    view: 'queue' | 'my_catalog' | undefined;
    inQueue: boolean;
    status: ProductStatus;
}

const productSchema: Schema<IProduct> = new Schema<IProduct>(
    {
        merchantId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        styleID: { type: Number, unique: true, required: true, index: true },
        partNumber: { type: String, required: true },
        brandName: { type: String, required: true },
        styleName: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        baseCategory: { type: String, required: true },
        categories: { type: String, required: true },
        catalogPageNumber: { type: String, required: true },
        newStyle: { type: Boolean, required: true },
        comparableGroup: { type: String, required: true },
        companionGroup: { type: String, required: true },
        priceRuleId: { type: mongoose.Schema.Types.ObjectId },
        brandImage: { type: String, required: true },
        styleImage: { type: String, required: true },
        shopifyProductId: { type: String },
        shopifyData: { type: Object },
        view: { type: String, enum: ['queue', 'my_catalog'] },
        inQueue: { type: Boolean, default: false },
        status: { type: Number, enum: ProductStatus, required: true, default: ProductStatus.NOT_UPLOADED },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ merchantId: 1, styleID: 1 });
productSchema.index({ merchantId: 1, styleID: 1, view: 1 });
productSchema.index({ merchantId: 1, view: 1 });
productSchema.index({ title: 'text' });

export const Products = mongoose.model<IProduct>('Product', productSchema);
