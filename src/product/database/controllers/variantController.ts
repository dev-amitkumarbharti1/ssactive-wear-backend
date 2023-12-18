import Variant from "../models/variants";

export class VariantController {
    bulkWrite = async (data: []) => {
        const result = await Variant.bulkWrite(data);
        return result;
    }

    insertMany = async (data: []) => {

        const result = await Variant.insertMany(data);
        return result;

    }

    getVariants = async (merchantId: string, styleID: number) => {
        const variants = await Variant.findOne({ merchantId: merchantId, styleID: styleID });
        return variants;
    }

    getWareHouses = async () => {
        const wareHouses = await Variant.aggregate([
            {
                $unwind: "$warehouses"
            },
            {
                $group: {
                    _id: null,
                    warehouses: {
                        $addToSet: "$warehouses.warehouseAbbr"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    warehouses: 1
                }
            }
        ]);
        return wareHouses[0];
    }
}