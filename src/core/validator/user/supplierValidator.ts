import Joi from "joi";

export interface priceSetting {
    custom_price: boolean;
    settings: {
        type: 'increase' | 'decrease';
        value: number;
        value_type: 'flat' | 'percentage';
    }
}

export class SupplierValidator {

    validateApproval = (object: { is_verified_by_supplier: boolean }) => {
        const schema: Joi.Schema = Joi.object({
            is_verified_by_supplier: Joi.boolean().strict().required(),
        });
        return schema.validate(object);
    }

}