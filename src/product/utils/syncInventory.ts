import { Products } from "../database/models/products";
import { ProductStatus } from "../database/models/products";
import { Setting } from "../../user/database/controllers/setting";
import { ShopifyApi } from "../../core/shopify/shopify";
import { ProductApi } from "../../core/ssactiveware-sdk/productApi";
import { ProductController } from "../database/controllers/productController";
import { VariantController } from "../database/controllers/variantController";

interface IObject { [key: string]: any };
export class SyncInventory extends ProductController {

    updateInventory = async (merchantId: string) => {

        const styles = await Products.find({ merchantId: merchantId, status: ProductStatus.UPLOADED }).select({ styleID: 1, _id: 0 });
        const styeIDs = styles.map((item: IObject) => { return item.styleID });

        for (let i = 0; i < styeIDs.length; i++) {

            const styeID = styeIDs[i];
            const response = await this.getProductListForUpdate(merchantId, [styeID]);
            const product = response[0];
            const shopify = new ShopifyApi(`${process.env.SHOPIFY_STORE_URL}`, `${process.env.SHOPIFY_ACCESS_TOKEN}`).getShopifyObj();

            try {



                const locations = await new Setting().getLocations(merchantId);

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
                            filter: { merchantId: merchantId, sku: variant.sku },
                            update: { $set: { warehouses: variant.warehouses } },
                        }
                    }
                });

                const result = await new VariantController().bulkWrite(variantQuery);
                console.log(result);

            } catch (e: any) {
                if (e.message === "Request failed with status code 404") {
                    console.log("remove Product");
                    //Product not found on supplier end remove from shopify

                    const deleteMuatation = `
                    mutation productDelete($input: ProductDeleteInput!) {
                      productDelete(input: $input) {
                        deletedProductId
                        userErrors {
                          field
                          message
                        }
                      }
                    }
                    `;

                    const variables = {
                        input: {
                            id: product.shopifyProductId
                        }

                    }

                    const deleteResponse = await shopify.graphql(deleteMuatation, variables);
                    if (deleteResponse.productDelete.deletedProductId === null) {
                        await this.deleteProduct(merchantId, styeID);
                    }

                }
            }



        }

        return { success: true, message: "inventory syncing done" };

    }
}