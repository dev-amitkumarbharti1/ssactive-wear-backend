interface IObject { [key: string]: any };
export class PrepareOrder {

    static getSupplierFormate = (shopifyData: IObject) => {

        const supplierOrderFormate: IObject = {};
        const shopifyShippingAddress = shopifyData.shipping_address;
        const shippingAddress: IObject = {};
        shippingAddress.customer = shopifyShippingAddress.name;
        shippingAddress.address = `${shopifyShippingAddress.address1} ${shopifyShippingAddress.address2}`;
        shippingAddress.city = `${shopifyShippingAddress.city}`;
        shippingAddress.country = shopifyShippingAddress.country;
        shippingAddress.state = shopifyShippingAddress.province;
        shippingAddress.zip = shopifyShippingAddress.zip;
        const lines = shopifyData.line_items.map((lineItem: IObject) => {
            return { identifier: lineItem.sku, qty: lineItem.quantity }
        });
        supplierOrderFormate.shippingAddress = shippingAddress;


        supplierOrderFormate.shippingMethod = 1;

        // supplierOrderFormate.emailConfirmation = "chris.holcomb100@gmail.com";

        supplierOrderFormate.lines = lines;

        //for testing purposes
        supplierOrderFormate.testOrder = true;

        supplierOrderFormate.autoselectWarehouse = true;
        supplierOrderFormate.autoselectWarehouse = true;
        supplierOrderFormate.AutoSelectWarehouse_Preference = "fastest";
        supplierOrderFormate.paymentProfile = { email: "chris.holcomb100@gmail.com", profileID: 1039405403 };
        supplierOrderFormate.rejectLineErrors_Email = true;

        return supplierOrderFormate;

    }
}