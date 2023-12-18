export class PrepareProduct {

    supplierData: { [key: string]: any };
    locations: { [key: string]: any };
    priceSettings: { [key: string]: any };
    constructor(data: { [key: string]: any }, locations: { [key: string]: any }, priceSettings: { [key: string]: any }) {
        this.supplierData = data;
        this.locations = locations;
        this.priceSettings = priceSettings
    }

    getProductQuery = () => {
        const input: { [key: string]: any } = {
            title: this.supplierData.title,
            descriptionHtml: this.supplierData.description,
            productType: this.supplierData.baseCategory,
            vendor: this.supplierData.brandName,
            options: ['Color', 'Size'],
            variants: this.getVariants()
        };
        return input;
    }

    getImageQuery = () => {
        const input: { [key: string]: any } = {
            images: this.getImages(),
        };
        return input;
    }


    getImages = () => {
        const baseImageUrl: string = "https://cdn.ssactivewear.com";
        const styleImageUrl: string = this.supplierData.styleImage;
        const images = this.supplierData.variants.map((variant: any, index: number) => {
            const images = [];
            if (index == 0) {
                images.push(`${styleImageUrl}^Main`)
            }
            if (variant.colorFrontImage && variant.colorFrontImage !== '') {
                images.push(`${variant.colorFrontImage}^${variant.colorName}`);
            }
            if (variant.colorDirectSideImage && variant.colorDirectSideImage != '') {
                images.push(`${variant.colorDirectSideImage}^${variant.colorName}`);
            }
            if (variant.colorBackImage && variant.colorBackImage != '') {
                images.push(`${variant.colorBackImage}^${variant.colorName}`);
            }
            if (variant.colorSideImage && variant.colorSideImage != '') {
                images.push(`${variant.colorSideImage}^${variant.colorName}`);
            }
            return images;
        }).flat().filter((image: string, index: number, self: string[]) => self.indexOf(image) === index);
        return images.map((item: string) => {
            return { "altText": `${item.split("^")[1]}`, "src": `${baseImageUrl}/${item.split("^")[0]}` }
        });
    }

    getVariants = () => {
        const variants = this.supplierData.variants;
        return variants.map((variant: { [key: string]: any }) => {
            return {
                mediaSrc: [`https://cdn.ssactivewear.com/${variant.colorFrontImage.replace("_fm", "_fl")}`],
                barcode: variant.gtin,
                options: [variant.colorName, variant.sizeName],
                sku: variant.sku,
                compareAtPrice: this.getPrice(variant.salePrice),
                price: this.getPrice(variant.customerPrice),
                inventoryItem: { tracked: true },
                inventoryQuantities: [
                    ...variant.warehouses.map((item: { [key: string]: string }) => {
                        if (this.getLocationId(item.warehouseAbbr) == false) return null;
                        return { availableQuantity: +item.qty, locationId: this.getLocationId(item.warehouseAbbr) }
                    }).filter((item: any) => item !== null)
                ],
                metafields: [
                    {
                        key: `colorSwatchTextColor`,
                        namespace: "attribute",
                        type: "single_line_text_field",
                        value: `${variant.colorSwatchTextColor}`
                    },
                    {
                        key: `colorSwatchImage`,
                        namespace: "attribute",
                        type: "single_line_text_field",
                        value: `https://cdn.ssactivewear.com/${variant.colorSwatchImage}`
                    }
                ],
            }
        });

    }

    getLocationId = (warehouseAbbr: string) => {
        return (this.locations[warehouseAbbr]) ? this.locations[warehouseAbbr].id : false;
    }


    getPrice = (price: number) => {
        let newPrice: number = price;
        if (this.priceSettings.value_type === 'percentage') {
            if (this.priceSettings.type === 'increase') {
                const increaseAmount = (this.priceSettings.value / 100) * price;
                newPrice += increaseAmount;
            } else if (this.priceSettings.type === 'decrease') {
                const decreaseAmount = (this.priceSettings.value / 100) * price;
                newPrice -= decreaseAmount;
            }
        } else if (this.priceSettings.value_type === 'flat') {
            if (this.priceSettings.type === 'increase') {
                newPrice += this.priceSettings.value;
            } else if (this.priceSettings.type === 'decrease') {
                newPrice -= this.priceSettings.value;
            }
        }
        return newPrice;
    }

}


