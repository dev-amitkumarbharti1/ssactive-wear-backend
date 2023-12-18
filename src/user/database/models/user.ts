import mongoose, { Document, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../../../core/config";

enum Status {
    Active = "active",
    Inactive = "inactive",
    Disabled = "disabled",
}

export enum Role {
    Supplier = "supplier",
    Merchant = "merchant",
    Guest = "guest"
}

export const onBoarded = {
    Yes: 1,
    No: 0
}

enum EPlatform {
    Shopify = "shopify",
    Magento = "magento",
}

interface IUser extends Document {
    username: string;
    email: string;
    status: Status;
    password_hash: string;
    email_activation_otp?: number;
    email_activation_token?: string;
    email_activation_timestamp?: Date;
    password_reset_token?: string;
    blocked_by?: string;
    role: Role;
    password_reset_timestamp?: Date;
    supplier_id?: mongoose.Types.ObjectId;
    info?: object;
    created_at: Date;
    updated_at: Date;
    is_verified_by_admin?: boolean;
    is_verified_by_supplier?: boolean;
    shop_details?: { [key: string]: any };
    supplier_api_credentials?: object;
    global_settings?: { [key: string]: any };
    collection_rules?: object;
    ecommerce_plateform?: EPlatform;
    onboarded: number;
    getJwtToken?: any;
    locations?: { [key: string]: any }
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, index: true },
        status: {
            type: String,
            enum: Object.values(Status),
            required: true,
            default: Status.Inactive,
        },
        password_hash: { type: String, required: true },
        email_activation_otp: { type: Number },
        email_activation_token: { type: String },
        email_activation_timestamp: { type: Date },
        password_reset_token: { type: String },
        blocked_by: { type: String, enum: ["admin", "supplier"] },
        role: { type: String, enum: Object.values(Role), default: Role.Guest },
        password_reset_timestamp: { type: Date },
        supplier_id: { type: Schema.Types.ObjectId },
        is_verified_by_admin: { type: Boolean, default: true },
        is_verified_by_supplier: { type: Boolean, default: true },
        info: { type: Object },
        shop_details: { type: Object },
        supplier_api_credentials: { type: Object },
        global_settings: { type: Object },
        collection_rules: { type: Object },
        ecommerce_plateform: { type: String, enum: Object.values(EPlatform) },
        onboarded: { type: Number, enum: Object.values(onBoarded), default: onBoarded.No },
        locations: { type: Object }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.getJwtToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role,
            is_verified_by_admin: this.is_verified_by_admin,
            is_verified_by_supplier: this.is_verified_by_supplier,
            ecommerce_plateform: this.ecommerce_plateform,
            onboarded: this.onboarded
        },
        config.JWT_SECRETE_KEY,
        { expiresIn: "5h" }
    );
};

userSchema.index({ username: 'text', email: 'text' });

export const userModel = mongoose.model<IUser>("User", userSchema);
