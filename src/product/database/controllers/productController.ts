import mongoose from "mongoose";
import { Products as ProductModel, ProductStatus } from "../models/products";

export class ProductController {

    bulkUpdate = async (data: []) => {
        const result = await ProductModel.bulkWrite(data);
        return result;
    }

    getProducts = async (merchantId: string, query: { [key: string]: any }, page: number, perPage: number) => {
        const FILTER: Array<{}> = [
            { merchantId: new mongoose.Types.ObjectId(merchantId) }
        ];

        if (query.categories) {
            const catagory = query.categories.split(",");
            FILTER.push({ baseCategory: { $in: catagory } });
        }

        if (query.search) {
            FILTER.push({ $text: { $search: `"${query.search}"` } });
        }

        if (query.title) {
            FILTER.push({ title: query.title });
        }

        if (query.brands) {
            const brands = query.brands.split(",");
            FILTER.push({ brandName: { $in: brands } });
        }

        if (query.styleID) {
            FILTER.push({ styleID: +query.styleID });
        }
        if (query.view) {
            if (query.view == 'queue') {
                FILTER.push({ view: query.view });
            }

            if (query.view == 'feed') {
                FILTER.push({ status: ProductStatus.NOT_UPLOADED });
            }
        }

        const products = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'styleID',
                    foreignField: 'styleID',
                    as: 'variants'
                }
            },
            {
                $project: {
                    styleID: 1,
                    baseCategory: 1,
                    styleImage: 1,
                    styleName: 1,
                    brandName: 1,
                    title: 1,
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                colorName: "$$variant.colorName",
                                sizeName: "$$variant.sizeName",
                                sku: "$$variant.sku",
                                salePrice: "$$variant.salePrice",
                                customerPrice: "$$variant.customerPrice"
                            }
                        }
                    }

                }
            }
        ]).skip((perPage * page) - perPage).limit(perPage);
        const totalCountQuery = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $count: "totalCount"
            }
        ]);
        const totalCount = (products.length > 0) ? totalCountQuery.length > 0 ? totalCountQuery[0].totalCount : 0 : 0;
        return { data: products, count: totalCount };

    }

    getMyCatalog = async (merchantId: string, query: { [key: string]: any }, page: number, perPage: number) => {
        const FILTER: Array<{}> = [
            { merchantId: new mongoose.Types.ObjectId(merchantId) }
        ];

        if (query.categories) {
            const catagory = query.categories.split(",");
            FILTER.push({ baseCategory: { $in: catagory } });
        }

        if (query.search) {
            FILTER.push({ $text: { $search: `"${query.search}"` } });
        }

        if (query.title) {
            FILTER.push({ title: query.title });
        }

        if (query.brands) {
            const brands = query.brands.split(",");
            FILTER.push({ brandName: { $in: brands } });
        }

        if (query.styleID) {
            FILTER.push({ styleID: +query.styleID });
        }

        FILTER.push({ view: 'my_catalog' });



        const products = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'styleID',
                    foreignField: 'styleID',
                    as: 'variants'
                }
            },
            {
                $project: {
                    styleID: 1,
                    baseCategory: 1,
                    styleImage: 1,
                    styleName: 1,
                    brandName: 1,
                    title: 1,
                    shopifyProductId: 1,
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                colorName: "$$variant.colorName",
                                sizeName: "$$variant.sizeName",
                                sku: "$$variant.sku",
                                salePrice: "$$variant.salePrice",
                                customerPrice: "$$variant.customerPrice"
                            }
                        }
                    }

                }
            }
        ]).skip((perPage * page) - perPage).limit(perPage);
        const totalCountQuery = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $count: "totalCount"
            }
        ]);
        const totalCount = (products.length > 0) ? totalCountQuery.length > 0 ? totalCountQuery[0].totalCount : 0 : 0;
        return { data: products, count: totalCount };

    }


    addInqueue = async (userId: string, styles: number[]) => {
        const queueCountPromise = ProductModel.countDocuments({ merchantId: userId, styleID: { $in: styles }, view: 'queue' });
        const catalogCountPromise = ProductModel.countDocuments({ merchantId: userId, styleID: { $in: styles }, view: 'my_catalog' });
        const [queue, my_catalog] = await Promise.all([queueCountPromise, catalogCountPromise]);
        const updateResponse = await ProductModel.updateMany({ merchantId: userId, styleID: { $in: styles }, view: { $nin: ['queue', 'my_catalog'] } }, { $set: { view: 'queue' } });
        return { success: true, status: 200, my_catalog: my_catalog, queue: queue, addedCount: updateResponse.modifiedCount };
    }

    removeInqueue = async (userId: string, styles: number[]) => {
        const removeItemList = await ProductModel.find({ merchantId: userId, styleID: { $in: styles }, inQueue: false, view: 'queue' }).select({ styleID: 1, _id: 0 });
        const removeItem = removeItemList.map(item => item.styleID);
        const updateResponse = await ProductModel.updateMany({ merchantId: userId, styleID: { $in: styles }, inQueue: false, view: 'queue' }, { $unset: { view: '' } });
        const inProcessingCount = await ProductModel.countDocuments({ merchantId: userId, styleID: { $in: styles }, inQueue: true });
        return { success: true, status: 200, removeCount: updateResponse.modifiedCount, inProcessingCount: inProcessingCount, removeItem };
    }

    getFilterOptions = async (merchantId: string) => {
        const products = await ProductModel.find({ merchantId: merchantId }).select({ styleID: 1, brandName: 1, baseCategory: 1, title: 1, brandImage: 1 });
        const brands = products.map((product: { [key: string]: any }) => product.brandName);
        const catagory = products.map((product: { [key: string]: any }) => product.baseCategory);
        return { brands: Array.from(new Set(brands)), categories: Array.from(new Set(catagory)) }
    }

    getProductList = async (userId: string, styles: number[]) => {

        const FILTER: Array<{}> = [];
        FILTER.push({
            merchantId: new mongoose.Types.ObjectId(userId),
            styleID: { $in: styles },
            status: ProductStatus.NOT_UPLOADED
        });

        const products = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'styleID',
                    foreignField: 'styleID',
                    as: 'variants'
                }
            },
            {
                $project: {
                    merchantId: 1,
                    styleID: 1,
                    baseCategory: 1,
                    styleImage: 1,
                    styleName: 1,
                    brandName: 1,
                    title: 1,
                    description: 1,
                    priceRuleId: 1,
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                colorName: "$$variant.colorName",
                                sizeName: "$$variant.sizeName",
                                sku: "$$variant.sku",
                                salePrice: "$$variant.salePrice",
                                customerPrice: "$$variant.customerPrice",
                                gtin: "$$variant.gtin",
                                colorFrontImage: "$$variant.colorFrontImage",
                                colorBackImage: "$$variant.colorBackImage",
                                colorSideImage: "$$variant.colorSideImage",
                                colorDirectSideImage: "$$variant.colorDirectSideImage",
                                colorSwatchTextColor: "$$variant.colorSwatchTextColor",
                                colorSwatchImage: "$$variant.colorSwatchImage",
                                warehouses: "$$variant.warehouses"
                            }
                        }
                    }

                }
            }
        ]);

        return products;

    }

    getProductListForUpdate = async (userId: string, styles: number[]) => {

        const FILTER: Array<{}> = [];
        FILTER.push({
            merchantId: new mongoose.Types.ObjectId(userId),
            styleID: { $in: styles },
            view: "my_catalog",
            status: ProductStatus.UPLOADED
        });

        const products = await ProductModel.aggregate([
            {
                $match: {
                    $and: FILTER
                }
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'styleID',
                    foreignField: 'styleID',
                    as: 'variants'
                }
            },
            {
                $project: {
                    merchantId: 1,
                    styleID: 1,
                    baseCategory: 1,
                    styleImage: 1,
                    styleName: 1,
                    brandName: 1,
                    title: 1,
                    description: 1,
                    shopifyProductId: 1,
                    shopifyData: 1,
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                colorName: "$$variant.colorName",
                                sizeName: "$$variant.sizeName",
                                sku: "$$variant.sku",
                                salePrice: "$$variant.salePrice",
                                customerPrice: "$$variant.customerPrice",
                                gtin: "$$variant.gtin",
                                colorFrontImage: "$$variant.colorFrontImage",
                                colorBackImage: "$$variant.colorBackImage",
                                colorSideImage: "$$variant.colorSideImage",
                                colorDirectSideImage: "$$variant.colorDirectSideImage",
                                colorSwatchTextColor: "$$variant.colorSwatchTextColor",
                                colorSwatchImage: "$$variant.colorSwatchImage",
                                warehouses: "$$variant.warehouses"
                            }
                        }
                    }

                }
            }
        ]);

        return products;

    }

    updateProduct = async (userId: string, shopifydata: { [key: string]: any }, styleID: number) => {
        const updateResult = await ProductModel.updateOne({ merchantId: userId, styleID: styleID }, { $set: { shopifyData: shopifydata, status: ProductStatus.UPLOADED, view: "my_catalog", shopifyProductId: shopifydata.id } });
        return updateResult;

    }


    assignPriceRule = async (userId: string, styles: number[], priceRuleId: string) => {
        const updateResult = await ProductModel.updateOne({ merchantId: userId, styleID: { $in: styles } }, { $set: { priceRuleId: priceRuleId } });
        return updateResult;
    }


    deleteProduct = async (merchantId: string, styeID: number) => {
        const result = await ProductModel.deleteOne({ merchantId: merchantId, styleID: styeID });
        return result;
    }
}