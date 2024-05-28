import ProductDAO from "../dao/productDAO";

/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {
    private dao: ProductDAO

    constructor() {
        this.dao = new ProductDAO
    }

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @param arrivalDate The optional date in which the product arrived.
     * @returns A Promise that resolves to nothing.
     */
    
    async registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
        if (!model || !category || quantity <= 0 || sellingPrice <= 0 || (arrivalDate && new Date(arrivalDate) > new Date())) {
            throw new Error('Invalid input parameters');
        }
    
        // Check if the product model already exists
        const productExists = await ProductDAO.checkProductExists(model);
        if (productExists) {
            throw new ProductAlreadyExistsError();
        }
    
        // Set the current date if arrivalDate is not provided
        const dateToUse = arrivalDate || new Date().toISOString().split('T')[0];
    
        // Register the product
        await ProductDAO.registerProducts(model, category, quantity, details, sellingPrice, dateToUse);
    }


    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @param changeDate The optional date in which the change occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async  changeProductQuantity(model: string, newQuantity: number, changeDate: string | null): Promise<number> {
        if (!model) {
            throw new Error("Model cannot be empty");
        }
    
        if (newQuantity <= 0) {
            throw new Error("Quantity must be higher than 0");
        }
    
        const product = await ProductDAO.findByModel(model);
    
        if (!product) {
            throw new ProductNotFoundError();
        }
    
        const currentDate = new Date();
        let changeDateObj: Date;
    
        if (changeDate) {
            changeDateObj = new Date(changeDate);
            if (isNaN(changeDateObj.getTime())) {
                throw new Error("Invalid date format. Date must be in YYYY-MM-DD format.");
            }
    
            if (changeDateObj > currentDate) {
                throw new Error("Change date cannot be after the current date");
            }
    
            const arrivalDateObj = new Date(product.arrivalDate);
            if (changeDateObj < arrivalDateObj) {
                throw new Error("Change date cannot be before the product's arrival date");
            }
        } else {
            changeDateObj = currentDate;
        }
    
        product.quantity += newQuantity;
        await ProductDAO.save(product);
    
        return product.quantity;
    }

    /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell
     * @param quantity The number of product units that were sold.
     * @param sellingDate The optional date in which the sale occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async sellProduct(model: string, quantity: number, sellingDate: string | null) /**:Promise<number> */ { }

    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getProducts(grouping: string | null, category: string | null, model: string | null) /**Promise<Product[]> */ { }

    /**
     * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getAvailableProducts(grouping: string | null, category: string | null, model: string | null) /**:Promise<Product[]> */ { }

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts() /**:Promise <Boolean> */ { }


    /**
     * Deletes one product, identified by its model
     * @param model The model of the product to delete
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    async deleteProduct(model: string) /**:Promise <Boolean> */ { }

}

export default ProductController;