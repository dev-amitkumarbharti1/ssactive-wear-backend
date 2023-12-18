import Joi from "joi";

interface register {
    username: string;
    email: string;
    password: string;
    role: string;
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
}