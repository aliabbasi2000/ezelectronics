import db from "../db/db"

import { Cart } from "../components/cart";
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";


class ProductInCart {
    model: string;
    quantity: number;
    category: string;
    price: number;

    constructor(model: string, quantity: number, category: string, price: number) {
        this.model = model;
        this.quantity = quantity;
        this.category = category;
        this.price = price;
    }
}


/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {



    /**
     * Retrieves the current cart for a specific user.
     * @param userId - The ID of the user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    getCart(userId: string): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            try {
                const sql = `
                    SELECT c.customer, c.paid, c.paymentDate, c.total, p.model, p.category, cp.quantity, p.price
                    FROM carts c
                    LEFT JOIN cart_products cp ON c.id = cp.cartId
                    LEFT JOIN products p ON cp.productId = p.id
                    WHERE c.customerId = ? AND c.paid = 0
                `;
                db.all(sql, [userId], (err: Error | null, rows: any[]) => {
                    if (err) {
                        return reject(err);
                    }
                    if (rows.length === 0) {
                        return resolve({
                            customer: userId,
                            paid: false,
                            paymentDate: null,
                            total: 0,
                            products: []
                        });
                    }
                    const products = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        price: row.price
                    }));
                    const cart = {
                        customer: rows[0].customer,
                        paid: rows[0].paid,
                        paymentDate: rows[0].paymentDate,
                        total: rows.reduce((sum, row) => sum + row.price * row.quantity, 0),
                        products: products
                    };
                    resolve(cart);
                });
            } catch (error) {
                reject(error);
            }
        });
    }



    async getUnpaidCartByUser(customer: string): Promise<Cart | null> {
        const sql = "SELECT * FROM carts WHERE customer = ? AND paid = 0";
        return new Promise((resolve, reject) => {
            db.get(sql, [customer], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                resolve(new Cart(row.customer, row.paid, row.paymentDate, row.total, []));
            });
        });
    }


    async createCart(customer: string): Promise<Cart> {
        const sql = "INSERT INTO carts (customer, paid) VALUES (?, 0)";
        return new Promise((resolve, reject) => {
            db.run(sql, [customer], function(err: Error | null) {
                if (err) {
                    return reject(err);
                }
                resolve(new Cart(customer, false, null, 0, []));
            });
        });
    }

    async addProductToCart(customer: string, model: string, price: number): Promise<void> {
        const sql = "INSERT INTO cart_products (customer, model, quantity, price) VALUES (?, ?, 1, ?)";
        return new Promise((resolve, reject) => {
            db.run(sql, [customer, model, price], (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async getProductInCart(customer: string, model: string): Promise<ProductInCart | null> {
        const sql = "SELECT * FROM cart_products WHERE customer = ? AND model = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [customer, model], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                resolve(new ProductInCart(row.model, row.quantity, row.category, row.price));
            });
        });
    }

    async updateProductQuantity(customer: string, model: string, quantity: number): Promise<void> {
        const sql = "UPDATE cart_products SET quantity = ? WHERE customer = ? AND model = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [quantity, customer, model], (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async updateCartTotal(customer: string, price: number): Promise<void> {
        const sql = "UPDATE carts SET total = total + ? WHERE customer = ? AND paid = 0";
        return new Promise((resolve, reject) => {
            db.run(sql, [price, customer], (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }


    async checkoutCart(customer: string, products: ProductInCart[]): Promise<void> {
        const updateCartSql = "UPDATE carts SET paid = 1, paymentDate = ? WHERE customer = ? AND paid = 0";
        const updateProductSql = "UPDATE products SET availableQuantity = availableQuantity - ? WHERE model = ?";
        const paymentDate = new Date().toISOString().split('T')[0];

        return new Promise((resolve, reject) => {
            db.run(updateCartSql, [paymentDate, customer], (err: Error | null) => {
                if (err) {
                    return reject(err);
                }

                const updateProductPromises = products.map(product => {
                    return new Promise<void>((resolve, reject) => {
                        db.run(updateProductSql, [product.quantity, product.model], (err: Error | null) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(updateProductPromises)
                    .then(() => resolve())
                    .catch(err => reject(err));
            });
        });
    }


    async getPaidCartsByUser(customer: string): Promise<Cart[]> {
        const cartSql = "SELECT * FROM carts WHERE customer = ? AND paid = 1";
        const productSql = "SELECT * FROM cart_products WHERE customer = ? AND cart_id = ?";

        return new Promise((resolve, reject) => {
            db.all(cartSql, [customer], (err: Error | null, cartRows: any[]) => {
                if (err) {
                    return reject(err);
                }

                const carts: Cart[] = [];
                const productPromises = cartRows.map(cartRow => {
                    return new Promise<void>((resolve, reject) => {
                        db.all(productSql, [customer, cartRow.id], (err: Error | null, productRows: any[]) => {
                            if (err) {
                                return reject(err);
                            }
                            const products = productRows.map(row => new ProductInCart(row.model, row.quantity, row.category, row.price));
                            carts.push(new Cart(cartRow.customer, cartRow.paid, cartRow.paymentDate, cartRow.total, products));
                            resolve();
                        });
                    });
                });

                Promise.all(productPromises)
                    .then(() => resolve(carts))
                    .catch(err => reject(err));
            });
        });
    }


    async removeProductFromCart(username: string, model: string): Promise<void> {
        const sql = "DELETE FROM cart_products WHERE customer = ? AND model = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [username, model], function (err: Error | null) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async decreaseProductQuantity(username: string, model: string): Promise<void> {
        const sql = "UPDATE cart_products SET quantity = quantity - 1 WHERE customer = ? AND model = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [username, model], function (err: Error | null) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }


    async clearCartProducts(username: string): Promise<void> {
        const sql = "DELETE FROM cart_products WHERE customer = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [username], function (err: Error | null) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }


    async deleteAllCarts(): Promise<void> {
        const deleteCartsSql = "DELETE FROM carts";
        const deleteCartProductsSql = "DELETE FROM cart_products";

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(deleteCartProductsSql, function(err: Error | null) {
                    if (err) {
                        return reject(err);
                    }
                });

                db.run(deleteCartsSql, function(err: Error | null) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }

    

    async getAllCarts(): Promise<Cart[]> {
    const getAllCartsSql = `
        SELECT carts.*, products.model, products.category, products.price, cart_products.quantity
        FROM carts
        LEFT JOIN cart_products ON carts.id = cart_products.cart_id
        LEFT JOIN products ON cart_products.product_id = products.id
    `;

    return new Promise((resolve, reject) => {
        db.all(getAllCartsSql, (err: Error | null, rows: any[]) => {
            if (err) {
                return reject(err);
            }
            const cartsMap: { [key: string]: Cart } = {};

            rows.forEach(row => {
                if (!cartsMap[row.id]) {
                    cartsMap[row.id] = {
                        customer: row.customer,
                        paid: row.paid,
                        paymentDate: row.paymentDate,
                        total: row.total,
                        products: []
                    };
                }

                if (row.model) {
                    cartsMap[row.id].products.push({
                        model: row.model,
                        category: row.category,
                        price: row.price,
                        quantity: row.quantity
                    });
                }
            });

            resolve(Object.keys(cartsMap).map(key => cartsMap[key]));
        });
    });
}

}

export default CartDAO