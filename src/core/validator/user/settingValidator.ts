import Joi from "joi";

export interface priceSetting {
    custom_price: boolean;
    settings: {
        type: 'increase' | 'decrease';
        value: number;
        value_type: 'flat' | 'percentage';
    }
}

export class SettingValidator {

    validateLocations = (object: { location_id: Array<{ [key: string]: any }> }) => {
        const schema: Joi.Schema = Joi.object({
            location_id: Joi.number().required(),
        });
        return schema.validate(object);
    }

    savePriceSetting = (object: priceSetting): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            custom_price: Joi.boolean().strict().required(),
            settings: Joi.object({
                type: Joi.string().valid('increase', 'decrease').required(),
                value: Joi.number().required(),
                value_type: Joi.string().valid('flat', 'percentage').required(),
            }).required()
        });
        return schema.validate(object);
    }

    currencySetting = (object: { enable: boolean, value: number }): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            enable: Joi.boolean().strict().required(),
            value: Joi.number().required()
        });
        return schema.validate(object);
    }

    uploadoriginalPrice = (object: { upload_original_price: boolean }): { error?: Error } => {
        const schema: Joi.Schema = Joi.object({
            upload_original_price: Joi.boolean().strict().required()
        });
        return schema.validate(object);
    }

    syncingSetting = (object: { enable: boolean, settings: { title: boolean, description: boolean, price: boolean, tags: boolean } }) => {
        const schema: Joi.Schema = Joi.object({
            enable: Joi.boolean().strict().required(),
            settings: Joi.object({
                title: Joi.boolean().strict().required(),
                description: Joi.boolean().strict().required(),
                price: Joi.boolean().strict().required(),
                tags: Joi.boolean().strict().required(),
            }).required()
        });
        return schema.validate(object);

    }

}