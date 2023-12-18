import mongoose, { Document, Schema, Model } from 'mongoose';

interface IWarehouse extends Document {
    warehouseAbbr: string;
    skuID: number;
    qty: number;
    closeout: boolean;
    dropship: boolean;
    excludeFreeFreight: boolean;
    fullCaseOnly: boolean;
    returnable: boolean;
}

interface IVariant extends Document {
    merchantId: string;
    sku: string;
    gtin: string;
    skuID_Master: number;
    yourSku: string;
    styleID: number;
    brandName: string;
    styleName: string;
    colorName: string;
    colorCode: string;
    colorPriceCodeName: string;
    colorGroup: string;
    colorGroupName: string;
    colorFamilyID: string;
    colorFamily: string;
    colorSwatchImage: string;
    colorSwatchTextColor: string;
    colorFrontImage: string;
    colorSideImage: string;
    colorBackImage: string;
    colorDirectSideImage: string;
    colorOnModelFrontImage: string;
    colorOnModelSideImage: string;
    colorOnModelBackImage: string;
    color1: string;
    color2: string;
    sizeName: string;
    sizeCode: string;
    sizeOrder: string;
    sizePriceCodeName: string;
    caseQty: number;
    unitWeight: number;
    mapPrice: number;
    piecePrice: number;
    dozenPrice: number;
    casePrice: number;
    salePrice: number;
    customerPrice: number;
    saleExpiration: Date;
    noeRetailing: boolean;
    caseWeight: number;
    caseWidth: number;
    caseLength: number;
    caseHeight: number;
    PolyPackQty: string;
    qty: number;
    countryOfOrigin: string;
    warehouses: IWarehouse[];
    shopifyVariant?: { [key: string]: any }
}

const warehouseSchema: Schema<IWarehouse> = new Schema<IWarehouse>({
    warehouseAbbr: String,
    skuID: Number,
    qty: Number,
    closeout: Boolean,
    dropship: Boolean,
    excludeFreeFreight: Boolean,
    fullCaseOnly: Boolean,
    returnable: Boolean,
});

const variantSchema: Schema<IVariant> = new Schema<IVariant>({
    merchantId: mongoose.Types.ObjectId,
    sku: String,
    gtin: String,
    skuID_Master: Number,
    yourSku: String,
    styleID: { type: Number, index: true },
    brandName: String,
    styleName: String,
    colorName: String,
    colorCode: String,
    colorPriceCodeName: String,
    colorGroup: String,
    colorGroupName: String,
    colorFamilyID: String,
    colorFamily: String,
    colorSwatchImage: String,
    colorSwatchTextColor: String,
    colorFrontImage: String,
    colorSideImage: String,
    colorBackImage: String,
    colorDirectSideImage: String,
    colorOnModelFrontImage: String,
    colorOnModelSideImage: String,
    colorOnModelBackImage: String,
    color1: String,
    color2: String,
    sizeName: String,
    sizeCode: String,
    sizeOrder: String,
    sizePriceCodeName: String,
    caseQty: Number,
    unitWeight: Number,
    mapPrice: Number,
    piecePrice: Number,
    dozenPrice: Number,
    casePrice: Number,
    salePrice: Number,
    customerPrice: Number,
    saleExpiration: Date,
    noeRetailing: Boolean,
    caseWeight: Number,
    caseWidth: Number,
    caseLength: Number,
    caseHeight: Number,
    PolyPackQty: String,
    qty: Number,
    countryOfOrigin: String,
    warehouses: [warehouseSchema],
    shopifyVariant: Object,
});

variantSchema.index({ merchantId: 1, styleID: 1 });

const Variant: Model<IVariant> = mongoose.model<IVariant>('Variant', variantSchema);

export default Variant;
