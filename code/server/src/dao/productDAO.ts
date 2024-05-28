
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




}

export default ProductDAO  