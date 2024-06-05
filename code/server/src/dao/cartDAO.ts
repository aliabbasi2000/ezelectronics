import db from "../db/db"
import {User} from "../components/user";
import {Product} from "../components/product";
import { Cart,ProductInCart } from "../components/cart";
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";


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
    getCart(user: User): Promise<Cart> {
        return new Promise<Cart>(async (resolve, reject) => {
            try {
                const search_cart_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?";
                let cart = await new Promise<any>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: any) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!cart) resolve(new Cart(user.username, false, null, 0.0, []));
                else {
                    const get_products_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ?"
                    db.all(get_products_in_cart_sql, [cart.id], (err: Error, rows: ProductInCart[]) => {
                        if (err) reject(err);

                        cart.products = rows;
                        resolve(cart);
                    })
                }
            } catch (err) {
                reject(err);
            }
        })
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

    addToCart(user: User, model: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const search_cart_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?";

                // Finds the product
                const search_product_sql = "SELECT * FROM products WHERE model = ?";
                let product = await new Promise<Product>((resolve, reject) => {
                    db.get(search_product_sql, [model], (err: Error | null, row: Product) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!product) reject(new ProductNotFoundError);
                if (product.quantity <= 0) reject(new EmptyProductStockError);

                // Finds the cart for the given customer
                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                let cart_id = await new Promise<number>(async (resolve, reject) => {
                    if (!cart) {
                        // If no cart is found, creates a new one
                        const new_cart_sql = "INSERT INTO carts (customer, paid, payment_date, total) VALUES (?, ?, ?, ?)"
                        await new Promise<void>((resolve, reject) => {
                            db.run(new_cart_sql, [user.username, false, null, 0.0], (err: Error | null) => {
                                if (err) reject(err);

                                resolve();
                            })
                        })

                        // Fetches the id of the new cart
                        let new_cart_id = await new Promise<number>((resolve, reject) => {
                            db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                                if (err) reject(err);

                                resolve(row.id);
                            })
                        })

                        // Since the cart is new, there's no need to check if there was already the given product in it
                        // Therefore, creates a new ProductInCart
                        const new_product_in_cart_sql = "INSERT INTO products_in_cart VALUES (?, ?, ?, ?, ?)";
                        db.run(new_product_in_cart_sql, [new_cart_id, product.model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                            if (err) reject(err);

                            // Returns the id of the new cart (used later to update the cart's total)
                            resolve(new_cart_id);
                        })
                    } else {
                        // If the cart is found, checks if the given product is already present in it
                        const search_product_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ? AND model = ?";
                        let product_in_cart = await new Promise<ProductInCart>((resolve, reject) => {
                            db.get(search_product_in_cart_sql, [cart.id, product.model], (err: Error | null, row: ProductInCart) => {
                                if (err) reject(err);

                                resolve(row);
                            })
                        })

                        if (!product_in_cart) {
                            // If the product is not already in the cart, creates a new ProductInCart
                            const post_sql = "INSERT INTO products_in_cart VALUES (?, ?, ?, ?, ?)";
                            db.run(post_sql, [cart.id, product.model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                                if (err) reject(err);

                                // Returns the cart id
                                resolve(cart.id);
                            })
                        } else {
                            // Otherwise, updates the quantity of the relevant ProductInCart
                            const update_sql = "UPDATE products_in_cart SET quantity = quantity + 1 WHERE cart_id = ? AND model = ?";
                            db.run(update_sql, [cart.id, product.model], (err: Error | null) => {
                                if (err) reject(err);

                                // Returns the cart id
                                resolve(cart.id);
                            })
                        }
                    }
                })

                // Updates the cart total
                const update_cart_sql = "UPDATE carts SET total = total + ? WHERE id = ?";
                db.run(update_cart_sql, [product.sellingPrice, cart_id], (err: Error | null) => {
                    if (err) reject(err);

                    resolve(true);
                })
            } catch (err) {
                reject(err);
            }
        })
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


    checkoutCart(user: User): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                // Searches for the user's cart
                const search_cart_sql = "SELECT id FROM carts WHERE customer = ? AND paid = ?"
                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                // If no cart is found, rejects
                if (!cart) reject(new CartNotFoundError);

                // Otherwise, get the products in the cart
                const get_products_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ?";
                let products = await new Promise<ProductInCart[]>((resolve, reject) => {
                    db.all(get_products_in_cart_sql, [cart.id], (err: Error | null, rows: ProductInCart[]) => {
                        if (err) reject(err);

                        resolve(rows);
                    })
                })

                // If no products are found, rejects
                if (!products || !products.length) reject(new EmptyCartError);

                // Otherwise, checks each product
                await new Promise<void>((resolve, reject) => {
                    products.forEach((product, index) => {
                        const search_product_sql = "SELECT * FROM products WHERE model = ?"
                        db.get(search_product_sql, [product.model], (err: Error | null, row: Product) => {
                            if (err) reject(err);
                            if (!row) reject(new ProductNotFoundError)

                            // If a product's stock is not enough, rejects
                            if (row.quantity < product.quantity) reject(new LowProductStockError)

                            if (index >= products.length - 1) resolve();
                        })
                    })
                })

                // Finally, updates the cart, setting paid to true and payment_date to the current date.
                const update_cart_sql = "UPDATE carts SET paid = ?, payment_date = ? WHERE id = ?"
                db.run(update_cart_sql, [true, (new Date(Date.now())).toDateString(), cart.id], (err: Error | null) => {
                    if (err) reject(err);

                    products.forEach((product, index) => {
                        const update_product_sql = "UPDATE products SET quantity = quantity - ? WHERE model = ?"
                        db.run(update_product_sql, [product.quantity, product.model], (err: Error | null) => {
                            if (err) reject(err);

                            if (index >= products.length - 1) resolve(true);
                        })
                    })
                })

            } catch (error) {
                reject(error);
            }
        })
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
                        id: row.id,
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