
/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {



    static async checkProductExists(model: string): Promise<boolean> {
        const result = await dbClient.query('SELECT COUNT(*) FROM products WHERE model = $1', [model]);
        return result.rows[0].count > 0;
    }



    
    // Method to register a new product
    static async registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string): Promise<void> {
        const query = `
            INSERT INTO products (model, category, quantity, details, selling_price, arrival_date)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await dbClient.query(query, [model, category, quantity, details, sellingPrice, arrivalDate]);
    }


    
    async getProductByModel(model: string): Promise<Product | null> {
        const sql = "SELECT * FROM products WHERE model = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [model], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                resolve(new Product(row.model, row.category, row.price, row.availableQuantity));
            });
        });
    }
    
    async  changeProductQuantity(model: string, newQuantity: number, changeDate: string | null): Promise<number> {

    const query = 'UPDATE products SET stock = $1 WHERE model = $2';
    await dbClient.query(query, [model, newQuantity,changeDate]);
}

static async sellProduct(model: string, quantity: number): Promise<void> {
    const query = `
        UPDATE products
        SET available_quantity = available_quantity - $1
        WHERE model = $2;
    `;
    await dbClient.query(query, [quantity, model]);
}

async  getAllProducts(): Promise<Product[]> {
    // Simulate a database call
    return await database.query('SELECT * FROM products');
}

/**
 * Retrieves products by category from the database.
 * @param category The category of the products to retrieve.
 * @returns A Promise that resolves to an array of Product objects.
 */
async  getProductByCategory(category: string): Promise<Product[]> {
    // Simulate a database call
    return await database.query('SELECT * FROM products WHERE category = ?', [category]);
}

/**
 * Retrieves a product by model from the database.
 * @param model The model of the product to retrieve.
 * @returns A Promise that resolves to a Product object or null if not found.
 */
async  getProductByModel(model: string): Promise<Product | null> {
    // Simulate a database call
    const results = await database.query('SELECT * FROM products WHERE model = ?', [model]);
    return results.length > 0 ? results[0] : null;
}





}

export default ProductDAO  