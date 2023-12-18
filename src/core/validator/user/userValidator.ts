import Joi from "joi";
import { otpPayload, onBoardPayload, tokenPayload } from "../../../user/database/controllers/user";

interface register {
    username: string;
    email: string;
    password: string;
}

interface login {
    email: string;
    password: string;
}

interface resetPassword {
    email: string;
}

interface changePassword {
    token: string;
    new_password: string;
}

export interface supplierSettingPayload {
    username: string;
    identifier: string;
    key: string;
}
export interface merchantSettingPayload {
    username: string;
    identifier: string;
    key: string;
    status?: boolean;
}

export class UserValidator {

    register = (object: register): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        return schema.validate(object);
    };


    login = (object: login): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        return schema.validate(object);
    };

    resetPassword = (object: resetPassword): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            email: Joi.string().email().required()
        });

        return schema.validate(object);

    }

    changePassword = (object: changePassword): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            token: Joi.string().required(),
            new_password: Joi.string().required()
        });

        return schema.validate(object);

    }

    verifyOtp = (object: otpPayload): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            otp: Joi.number().required(),
            token: Joi.string().required()
        });

        return schema.validate(object);

    }

    onBoard = (object: onBoardPayload): { error?: Error } => {

        const schema: Joi.Schema = Joi.object({
            role: Joi.string().required(),
            ecommerce_plateform: Joi.string(),
            shop_details: Joi.object(),
            supplier_id: Joi.string(),
            info: Joi.object(),
        });

        return schema.validate(object);

    }

    reSendOtp = (object: tokenPayload): { error?: Error } => {

        const schema: Joi.Schema = Joi.object({
            token: Joi.string().required(),
        });

        return schema.validate(object);

    }

    supplierSetting = (object: supplierSettingPayload): { error?: Error } => {

        const schema: Joi.Schema = Joi.object({
            username: Joi.string().required(),
            identifier: Joi.string().required(),
            key: Joi.string().required()
        });

        return schema.validate(object);

    }
    merchantSetting = (object: merchantSettingPayload): { error?: Error } => {

        const schema: Joi.Schema = Joi.object({
            username: Joi.string().required(),
            identifier: Joi.string().required(),
            key: Joi.string().required(),
            status: Joi.boolean().strict().required()
        });

        return schema.validate(object);

    }
    installApp = (object: { shop: string }) => {

        const schema: Joi.Schema = Joi.object({
            shop: Joi.string().required()
        });
        return schema.validate(object);

    }

    validateShopDetails = (object: { shop_name: string, access_token: string }) => {
        const schema: Joi.Schema = Joi.object({
            shop_name: Joi.string().regex(/^[a-zA-Z0-9-]+\.myshopify\.com$/).required(),
            access_token: Joi.string().required()
        });
        return schema.validate(object);
    }

}