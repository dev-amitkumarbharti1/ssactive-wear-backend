import { Rmq } from "../../core/rmq";
import { ShopifyApi } from "../../core/shopify/shopify";
import { ProductController } from "../database/controllers/productController";
import { Setting } from "../../user/database/controllers/setting";
import { PrepareProduct } from "../utils/prepareProduct";
import { PriceRule } from "../database/controllers/priceRuleController";
export class Consumer {

    handleProductCreateMessage = async () => {
        const rmp = new Rmq();
        const channel = await rmp.createConsumer("productCreteQueue");
        if (channel) {
            channel.consume('productCreteQueue', async (msg) => {
                if (msg !== null) {
                    const message = JSON.parse(msg.content.toString());
                    const result = await this.createProduct(message.merchantId, message);
                    if (result) channel.ack(msg);

                } else {
                    console.log('Consumer cancelled by server');
                }
            });
        }

    }




    createProduct = async (userId: string, message: { [key: string]: any }) => {
        try {
            const locations = await new Setting().getLocations(userId);
            const shopify = new ShopifyApi(`${process.env.SHOPIFY_STORE_URL}`, `${process.env.SHOPIFY_ACCESS_TOKEN}`).getShopifyObj();

            let priceSettings: any = {};
            // console.log(message.priceRuleId);
            if (message?.priceRuleId) {
                const priceId = message.priceRuleId;
                priceSettings = await new PriceRule().priceRule(priceId);
            }

            const prepareProduct = new PrepareProduct(message, locations, priceSettings);
            const input = prepareProduct.getProductQuery();

            const imagesQuery = prepareProduct.getImages();
            const images = imagesQuery.map((image: any) => {
                return {
                    "originalSource": `${image.src.replace("_fm", "_fl")}`,
                    "alt": `${image.altText}`,
                    "mediaContentType": "IMAGE"
                };
            });

            const createProductMutation = `mutation CreateProductWithNewMedia($input: ProductInput!, $media: [CreateMediaInput!]) {
                    productCreate(input: $input, media: $media) {
                    product {
                        id
                        title
                        variants(first: 99) {
                            edges {
                            node {
                                id
                                title
                                sku
                                price
                                inventoryQuantity
                                compareAtPrice
                                inventoryItem {
                                 id
                                }
                            }
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                    }
                }
              `;

            const productCreateResponse = await shopify.graphql(createProductMutation, { input: input, media: images });
            if (!(productCreateResponse.productCreate.userErrors.length > 0)) {
                console.log(productCreateResponse.productCreate.product);
                const result = await new ProductController().updateProduct(userId, productCreateResponse.productCreate.product, message.styleID);
                console.log(result);
                return true
            }
            console.log(productCreateResponse.productCreate.userErrors);
            return false;

        } catch (e: any) {
            console.log(e);
            if (e?.extensions?.code === 'THROTTLED') return true;
            return false;
        }

    }

}








