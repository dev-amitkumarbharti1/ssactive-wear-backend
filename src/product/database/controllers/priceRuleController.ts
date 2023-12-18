import { PriceModel } from "../models/priceRule";

interface IObject { [key: string]: any };

export class PriceRule {

    addPriceRule = async (userId: string, rules: IObject) => {
        rules.merchantId = userId;
        const result = await PriceModel.create(rules);
        return result;
    }

    getRules = async (userId: string) => {
        const rules = await PriceModel.find({ merchantId: userId });
        return rules;
    }


    deleteRules = async (userId: string, id: string) => {
        const result = await PriceModel.deleteOne({ _id: id });
        return result;
    }

    updateRule = async (userId: string, id: string, rules: IObject) => {

        const priceRule = await PriceModel.findOne({ userId: userId, _id: id });
        if (priceRule) {
            priceRule.template_name = rules.template_name;
            priceRule.type = rules.type;
            priceRule.value = rules.value;
            priceRule.value_type = rules.value_type;
            priceRule.save();
            return true;
        } else {
            return false;
        }

    }


    priceRule = async (ruleId: string) => {
        const rule = await PriceModel.findOne({ _id: ruleId });
        return rule;
    }

}