import { Request, Response, NextFunction } from "express";
import { ProductApi } from "../../core/ssactiveware-sdk/productApi";
import { ProductController } from "../database/controllers/productController";
import { VariantController } from "../database/controllers/variantController";
import { Rmq } from "../../core/rmq";
import { Consumer } from "../messageHandler/consumer";
import { Setting } from "../../user/database/controllers/setting";
import event from "events";
import { ShopifyApi } from "../../core/shopify/shopify";
import { ProductStatus, Products } from "../database/models/products";
const productController = new ProductController();
const variantController = new VariantController();

interface IObject { [key: string]: any; }

export class ProductService {

    importProduct = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const productApi = new ProductApi();
        const products = await productApi.getProducts();

        const productsList = products.data.map((product: { [key: string]: any }) => {
            let productData = { ...product };
            delete product.styleID;
            return {
                updateOne: {
                    filter: { merchantId: userId, styleID: productData.styleID },
                    update: { $set: { ...product } },
                    upsert: true
                }
            }
        });

        const writeResult = await productController.bulkUpdate(productsList);
        res.status(200).send({ success: true, message: "product imported successfully", insertCount: writeResult.insertedCount, updateCount: writeResult.modifiedCount });
    }

    importVariants = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const productApi = new ProductApi();
        const variants = await productApi.getVariants();
        const variantsList = variants.data.map((variant: { [key: string]: any }) => {
            let variantData = variant;
            variantData.merchantId = userId;
            return variantData;
        });
        let chunkSize = 20000;

        for (let i = 0; i < variantsList.length; i += chunkSize) {
            const chunk = variantsList.slice(i, i + chunkSize)
            await variantController.insertMany(chunk);
        }
        res.status(200).send({ success: true, message: "product imported successfully" });

    }

    getProducts = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const queryObj = req.query;
        const page = +(queryObj.page || 1);
        const perPage = +(queryObj.perPage || 50);
        const products = await productController.getProducts(userId, queryObj, page, perPage);
        res.send({ data: products.data, success: true, count: products.count, message: "products list" });
    }

    getMyCatalogs = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const queryObj = req.query;
        const page = +(queryObj.page || 1);
        const perPage = +(queryObj.perPage || 50);
        const products = await productController.getMyCatalog(userId, queryObj, page, perPage);
        res.send({ data: products.data, success: true, count: products.count, message: "products list" });
    }

    getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
        const filters = await productController.getFilterOptions(req.user._id);
        res.send({ ...filters, success: true, message: "filter" });
    }


    addInQueue = async (req: Request, res: Response, next: NextFunction) => {
        const response = await productController.addInqueue(req.user._id, req.body.styles);
        console.log(response);
        res.status(200).send(response);
    }

    deleteFromQueue = async (req: Request, res: Response, next: NextFunction) => {
        const response = await productController.removeInqueue(req.user._id, req.body.styles);
        res.status(200).send(response);
    }

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        const rm = new Rmq();
        const eventEmitter = new event.EventEmitter();
        eventEmitter.on('create', new Consumer().handleProductCreateMessage);
        const products = await productController.getProductList(req.user._id, req.body.styles);
        const sendMessagePromise = products.map((product) => rm.sendMessage("productCreteQueue", JSON.stringify(product)));
        await Promise.all(sendMessagePromise);
        eventEmitter.emit('create');
        res.send({ success: true, message: "New products added for processing; they will be created on Shopify" });

    }

    createOneProduct = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const styleID = +req.params.styleID;
        const productData = await productController.getProductList(req.user._id, [styleID]);
        console.log(productData);
        const product = productData[0];
        console.log(product);
        const isUploaded = await new Consumer().createProduct(userId, product);
        if (isUploaded) {
            return res.send({ success: true, message: "Product uploaded to Shopify successfully." });
        }
        res.send({ success: false, message: "Error While product uploading." });
    }


    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        console.log(req.body);
        res.send({ message: "product deleted successfully" });

    }

    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body.styles);
        const products = await productController.getProductListForUpdate(req.user._id, req.body.styles);
        console.log(products);
        res.send({ success: true, message: "update Products" });
    }




    updateInventory = async (req: Request, res: Response, next: NextFunction) => {
        //const styeID = 7248;

        const styles = await Products.find({ merchantId: req.user._id, status: ProductStatus.UPLOADED }).select({ styleID: 1, _id: 0 });
        const styeIDs = styles.map((item: IObject) => { return item.styleID });

        for (let i = 0; i < styeIDs.length; i++) {

            const styeID = styeIDs[i];
            const response = await productController.getProductListForUpdate(req.user._id, [styeID]);
            const product = response[0];

            try {


                const shopify = new ShopifyApi(`${process.env.SHOPIFY_STORE_URL}`, `${process.env.SHOPIFY_ACCESS_TOKEN}`).getShopifyObj();
                const locations = await new Setting().getLocations(req.user._id);

                const currentInventoryObj: IObject = {};
                product.variants.forEach((item: any) => {
                    const warehouseInventory: IObject = {};
                    item.warehouses.forEach((warehouse: IObject) => {
                        warehouseInventory[warehouse.warehouseAbbr] = warehouse.qty
                    })
                    currentInventoryObj[item.sku] = warehouseInventory;
                });

                const inventoryResponse = await new ProductApi().getInventory(styeID);


                const shopifyInventoryObj: IObject = {};
                product.shopifyData.variants.edges.forEach((item: any) => {
                    shopifyInventoryObj[item.node.sku] = item.node.inventoryItem.id;
                });


                const inventoryQuery = inventoryResponse.data.map((item: IObject) => {
                    return item.warehouses.map((warehouse: IObject) => {
                        if (warehouse.qty == currentInventoryObj[item.sku][warehouse.warehouseAbbr]) return null;
                        return {
                            locationId: locations[warehouse.warehouseAbbr].id,
                            inventoryItemId: shopifyInventoryObj[item.sku],
                            delta: (warehouse.qty - currentInventoryObj[item.sku][warehouse.warehouseAbbr]) ? warehouse.qty - currentInventoryObj[item.sku][warehouse.warehouseAbbr] : 0
                        }
                    }).filter((item: IObject) => item !== null);
                }).flat();

                const input = {
                    changes: inventoryQuery,
                    name: "available",
                    reason: "received",
                }

                const quantityChangesMuatation = `
                  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
                    inventoryAdjustQuantities(input: $input) {
                      userErrors {
                        field
                        message
                      }
                      inventoryAdjustmentGroup {
                        createdAt
                        reason
                        referenceDocumentUri
                        changes {
                          name
                          delta
                        }
                      }
                    }
                  }
                  `;

                const inventoryChangeResponse = await shopify.graphql(quantityChangesMuatation, { input });
                console.log(JSON.stringify(inventoryChangeResponse.inventoryAdjustQuantities.userErrors));



                const variantsParams = Object.keys(currentInventoryObj).join(',');

                const variantResponse = await new ProductApi().getVariantList(variantsParams);

                const variantQuery = variantResponse.data.map((variant: IObject) => {
                    return {
                        updateOne: {
                            filter: { merchantId: req.user._id, sku: variant.sku },
                            update: { $set: { warehouses: variant.warehouses } },
                        }
                    }
                });

                const result = await variantController.bulkWrite(variantQuery);
                console.log(result);

            } catch (e: any) {
                if (e.message === "Request failed with status code 404") {
                    console.log("remove Product");
                    //Product not found on supplier end remove from shopify
                }
            }



        }

        res.send({ success: true, message: "inventory syned successfully!" });


    }



    addPriceRule = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const result = await productController.assignPriceRule(userId, req.body.styles, req.body.priceId);
        res.send({ success: true, message: "price rule added in product", assingedCount: result.modifiedCount });
    }



}