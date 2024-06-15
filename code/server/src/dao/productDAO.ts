import db from "../db/db";
import {Product} from "../components/product";
import {
    EmptyProductStockError,
    LowProductStockError,
    ProductAlreadyExistsError,
    ProductNotFoundError
} from "../errors/productError";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
 /**
     * Adds a new product to the database.
     * @param model - The model of the new product.
     * @param category - The product's category.
     * @param details - The details of this product.
     * @param quantity - The product stock quantity.
     * @param sellingPrice - The product's selling price.
     * @param arrivalDate - The product's arrival date.
     * @returns A Promise that resolves if the product has been added to the database.
     */
 registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            const insert_sql = "INSERT INTO products(model, sellingPrice, category, arrivalDate, details, quantity) VALUES(?, ?, ?, ?, ?, ?)";
            let date: String | null = arrivalDate;
            if (!date) date = (new Date(Date.now())).toDateString();

            db.run(insert_sql, [model, sellingPrice, category, date, details, quantity], (error: Error | null) => {
                if (error && error.message.includes("UNIQUE constraint failed: products.model")) reject(new ProductAlreadyExistsError)
                if (error) reject(error);

                resolve();
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Increases the quantity of a given product.
 * @param model - The product's model.
 * @param newQuantity - The quantity increase.
 * @param changeDate - The date in which the increase happened.
 * @returns A Promise that resolves to the new quantity of the product.
 */
changeProductQuantity(model: string, newQuantity: number, changeDate: string | null): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
        try {
            const search_product_sql = "SELECT * FROM products WHERE model = ?"
            let product = await new Promise<Product>((resolve, reject) => {
                db.get(search_product_sql, [model], (err: Error | null, row: Product) => {
                    if (err) reject(err);

                    resolve(row);
                })
            })

            if (!product) reject (new ProductNotFoundError);

            const update_sql = "UPDATE products SET quantity = quantity + ?, arrivalDate = ? WHERE model = ?";
            let date: String | null = changeDate;
            if (!date) date = (new Date(Date.now())).toDateString();

            await new Promise<void>((resolve, reject) => {
                db.run(update_sql, [newQuantity, date, product.model], (error: Error | null) => {
                    if (error) reject(error);

                    resolve();
                })
            })

            const get_quantity_sql = "SELECT quantity FROM products WHERE model = ?"
            db.get(get_quantity_sql, [model], (err: Error | null, row: number) => {
                if (err) reject(err);

                resolve(row);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Decreases the quantity of a given product.
 * @param model - The product's model.
 * @param quantity - The quantity decrease.
 * @param sellingDate - The date in which the decrease happened.
 * @returns A Promise that resolves to the new quantity of the product.
 */
sellProduct(model: string, quantity: number, sellingDate: string | null): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
        try {
            const search_product_sql = "SELECT * FROM products WHERE model = ?"

            let product = await new Promise<Product>((resolve, reject) => {
                db.get(search_product_sql, [model], (err: Error | null, row: Product) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(row);
                })
            })

            if (!product) reject(new ProductNotFoundError)
            if (product.quantity == 0) reject(new EmptyProductStockError)
            if (product.quantity < quantity) reject(new LowProductStockError)

            const update_sql = "UPDATE products SET quantity = quantity - ?, arrivalDate = ? WHERE model = ? AND quantity >= ?";
            let date: String | null = sellingDate;
            if (!date) date = (new Date(Date.now())).toDateString();

            await new Promise<void>((resolve, reject) => {
                db.run(update_sql, [quantity, date, product.model, quantity], (error: Error | null) => {
                    if (error) reject(error);

                    resolve();
                })
            })

            const get_sql = "SELECT quantity FROM products WHERE model = ?"
            db.get(get_sql, [product.model], (err: Error | null, row: number) => {
                if (err) reject(err);

                resolve(row);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Provides information on all products registered in the database.
 * @param grouping - If not empty, the filter to apply to the search (category or model).
 * @param category - If not empty and grouping is set to "category", the category filter to apply to the search.
 * @param model - If not empty and grouping is set to "model", the model filter to apply to the search.
 * @returns A Promise that resolves to an array of Product objects, matching the query provided.
 */
getProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
        try {
            if (!grouping && !category && !model) {
                let get_products_sql = "SELECT * FROM products";
                db.all(get_products_sql, (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
            if (grouping == "category" && category) {
                let get_products_sql = "SELECT * FROM products WHERE category = ?";
                db.all(get_products_sql, [category], (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
            if (grouping == "model" && model) {
                let get_products_sql = "SELECT * FROM products WHERE model = ?";
                db.all(get_products_sql, [model], (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Provides information on all available products (quantity > 0) registered in the database.
 * @param grouping - If not empty, the filter to apply to the search (category or model).
 * @param category - If not empty and grouping is set to "category", the category filter to apply to the search.
 * @param model - If not empty and grouping is set to "model", the model filter to apply to the search.
 * @returns A Promise that resolves to an array of Product objects, matching the query provided.
 */
getAvailableProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
        try {
            if (!grouping && !category && !model) {
                let get_products_sql = "SELECT * FROM products WHERE quantity > 0";
                db.all(get_products_sql, (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
            if (grouping == "category" && category) {
                let get_products_sql = "SELECT * FROM products WHERE quantity > 0 AND category = ?";
                db.all(get_products_sql, [category], (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
            if (grouping == "model" && model) {
                let get_products_sql = "SELECT * FROM products WHERE quantity > 0 AND model = ?";
                db.all(get_products_sql, [model], (err: Error | null, rows: Product[]) => {
                    if (err) reject(err);

                    resolve(rows);
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Removes all products from the database
 * @returns A Promise that resolves to true if the deletion is successful.
 */
deleteAllProducts(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const sql = "DELETE FROM products"
            db.run(sql, (err: Error | null) => {
                if (err) reject(err);

                resolve(true);
            })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Removes a given product from the database.
 * @param model - The product's model.
 * @returns A Promise that resolves to true if the deletion is successful.
 */
deleteProduct(model: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            const search_product_sql = "SELECT * FROM products WHERE model = ?"
            let product = await new Promise<Product>((resolve, reject) => {
                db.get(search_product_sql, [model], (err: Error | null, row: Product) => {
                    if (err) reject(err);

                    resolve(row);
                })
            })

            if (!product) reject(new ProductNotFoundError)

            const delete_sql = "DELETE FROM products WHERE model = ?";
            db.run(delete_sql, [product.model], (err: Error | null) => {
                if (err) reject(err);

                resolve(true)
            })
        } catch (error) {
            reject(error);
        }
    })
}
productModelExists(model: string): Promise<Product | null> {
    const sql = "SELECT * FROM Product WHERE model = ?";
    return new Promise((resolve, reject) => {
      db.get(sql, [model], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as Product : null);
        }
      });
    });
  }

}

export default ProductDAO  