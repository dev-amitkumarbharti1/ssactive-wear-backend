import Joi from "joi";

export class ProductValidator {

    validateStockPayload = (object: { stocks: number[] }) => {
        const schema: Joi.Schema = Joi.object({
            stocks: Joi.array().required(),
        });
        return schema.validate(object);
    }

    validateSyncPayload = (object: { type: 'inventory' | 'product' }) => {

        const schema: Joi.Schema = Joi.object({
            type: Joi.string().allow('inventory', 'product').required()
        })

        return schema.validate(object);

    }

}