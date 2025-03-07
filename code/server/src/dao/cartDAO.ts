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





    addToCart(user: User, model: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const search_cart_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?";

                const search_product_sql = "SELECT * FROM products WHERE model = ?";
                let product = await new Promise<Product>((resolve, reject) => {
                    db.get(search_product_sql, [model], (err: Error | null, row: Product) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!product) reject(new ProductNotFoundError);
                if (product.quantity <= 0) reject(new EmptyProductStockError);

                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                let cart_id = await new Promise<number>(async (resolve, reject) => {
                    if (!cart) {

                        const new_cart_sql = "INSERT INTO carts (customer, paid, payment_date, total) VALUES (?, ?, ?, ?)"
                        await new Promise<void>((resolve, reject) => {
                            db.run(new_cart_sql, [user.username, false, null, 0.0], (err: Error | null) => {
                                if (err) reject(err);

                                resolve();
                            })
                        })


                        let new_cart_id = await new Promise<number>((resolve, reject) => {
                            db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                                if (err) reject(err);

                                resolve(row.id);
                            })
                        })

                       
                        const new_product_in_cart_sql = "INSERT INTO products_in_cart VALUES (?, ?, ?, ?, ?)";
                        db.run(new_product_in_cart_sql, [new_cart_id, product.model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                            if (err) reject(err);

                        
                            resolve(new_cart_id);
                        })
                    } else {
                        
                        const search_product_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?";
                        let product_in_cart = await new Promise<ProductInCart>((resolve, reject) => {
                            db.get(search_product_in_cart_sql, [cart.id, product.model], (err: Error | null, row: ProductInCart) => {
                                if (err) reject(err);

                                resolve(row);
                            })
                        })

                        if (!product_in_cart) {
                            
                            const post_sql = "INSERT INTO products_in_cart VALUES (?, ?, ?, ?, ?)";
                            db.run(post_sql, [cart.id, product.model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                                if (err) reject(err);

                                
                                resolve(cart.id);
                            })
                        } else {
                            
                            const update_sql = "UPDATE products_in_cart SET quantity = quantity + 1 WHERE cart_id = ? AND product_model = ?";
                            db.run(update_sql, [cart.id, product.model], (err: Error | null) => {
                                if (err) reject(err);


                                resolve(cart.id);
                            })
                        }
                    }
                })

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
    

    checkoutCart(user: User): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
  
                const search_cart_sql = "SELECT id FROM carts WHERE customer = ? AND paid = ?"
                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })


                if (!cart) reject(new CartNotFoundError);

                const get_products_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ?";
                let products = await new Promise<ProductInCart[]>((resolve, reject) => {
                    db.all(get_products_in_cart_sql, [cart.id], (err: Error | null, rows: ProductInCart[]) => {
                        if (err) reject(err);

                        resolve(rows);
                    })
                })

                if (!products || !products.length) reject(new EmptyCartError);

                await new Promise<void>((resolve, reject) => {
                    products.forEach((product, index) => {
                        const search_product_sql = "SELECT * FROM products WHERE model = ?"
                        db.get(search_product_sql, [product.product_model], (err: Error | null, row: Product) => {
                            if (err) reject(err);
                            if (!row) reject(new ProductNotFoundError)

                            if (row.quantity < product.quantity) reject(new LowProductStockError)

                            if (index >= products.length - 1) resolve();
                        })
                    })
                })

                
                const update_cart_sql = "UPDATE carts SET paid = ?, payment_date = ? WHERE id = ?"
                db.run(update_cart_sql, [true, (new Date(Date.now())).toDateString(), cart.id], (err: Error | null) => {
                    if (err) reject(err);

                    products.forEach((product, index) => {
                        const update_product_sql = "UPDATE products SET quantity = quantity - ? WHERE model = ?"
                        db.run(update_product_sql, [product.quantity, product.product_model], (err: Error | null) => {
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


    getCustomerCarts(user: User): Promise<Cart[]> {
        return new Promise<Cart[]>(async (resolve, reject) => {
            try {
                const get_carts_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                let carts: Cart[] = await new Promise<Cart[]>((resolve, reject) => {
                    db.all(get_carts_sql, [user.username, true], (err: Error | null, rows: any[]) => {
                        if (err) reject(err);

                        resolve(rows);
                    })
                })

                if (!carts || !carts.length) resolve([]);
                else await new Promise<void>((resolve, reject) => {
                    carts.forEach((cart, index) => {
                        const get_products_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ?";
                        db.all(get_products_in_cart_sql, [cart.id], (err: Error | null, rows: ProductInCart[]) => {
                            if (err) reject(err);

                            cart.products = rows;

                            if (index >= carts.length - 1) resolve();
                        })
                    })
                })

                resolve(carts);
            } catch (error) {
                reject(error);
            }
        })
    }



    removeProductFromCart(user: User, product: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const search_cart_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!cart) reject(new CartNotFoundError)

                const search_product_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?";
                let product_in_cart = await new Promise<ProductInCart>((resolve, reject) => {
                    db.get(search_product_in_cart_sql, [cart.id, product], (err: Error | null, row: ProductInCart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!product_in_cart) reject(new ProductNotInCartError)

                if (product_in_cart.quantity <= 1) {
                    const delete_product_in_cart_sql = "DELETE FROM products_in_cart WHERE cart_id = ? AND product_model = ?";
                    db.run(delete_product_in_cart_sql, [cart.id, product], (err: Error | null) => {
                        if (err) reject(err);

                        resolve(true);
                    })
                } else {
                    const update_product_in_cart_sql = "UPDATE products_in_cart SET quantity = quantity - 1 WHERE cart_id = ? AND product_model = ?";
                    db.run(update_product_in_cart_sql, [cart.id, product], (err: Error | null) => {
                        if (err) reject(err);

                        resolve(true);
                    })
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    clearCart(user: User): Promise<boolean>{
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const search_cart_sql = "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                let cart = await new Promise<Cart>((resolve, reject) => {
                    db.get(search_cart_sql, [user.username, false], (err: Error | null, row: Cart) => {
                        if (err) reject(err);

                        resolve(row);
                    })
                })

                if (!cart) reject(new CartNotFoundError);

                const delete_products_from_cart_sql = "DELETE FROM products_in_cart WHERE cart_id = ?"
                db.run(delete_products_from_cart_sql, [cart.id], (err: Error | null) => {
                    if (err) reject(err);

                    resolve(true);
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const delete_products_in_cart = "DELETE FROM products_in_cart"
                await new Promise<void>((resolve, reject) => {
                    db.run(delete_products_in_cart, (err: Error | null) => {
                        if (err) reject(err);

                        resolve();
                    })
                })

                const delete_carts_sql = "DELETE FROM carts"
                db.run(delete_carts_sql, (err: Error | null) => {
                    if (err) reject(err);

                    resolve(true);
                })
            } catch (error) {
                reject(error);
            }
        })
    }
    

    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>(async (resolve, reject) => {
            try {
                const get_carts_sql = "SELECT * FROM carts"
                let carts: Cart[] = await new Promise<Cart[]>((resolve, reject) => {
                    db.all(get_carts_sql, (err: Error | null, rows: any[]) => {
                        if (err) reject(err);

                        resolve(rows);
                    })
                })

                if (!carts || !carts.length) resolve([]);
                else await new Promise<void>((resolve, reject) => {
                    carts.forEach((cart, index) => {
                        const get_products_in_cart_sql = "SELECT * FROM products_in_cart WHERE cart_id = ?";
                        db.all(get_products_in_cart_sql, [cart.id], (err: Error | null, rows: ProductInCart[]) => {
                            if (err) reject(err);

                            cart.products = rows;

                            if (index >= carts.length - 1) resolve();
                        })
                    })
                })

                resolve(carts);
            } catch (error) {
                reject(error);
            }
        })
    }

}

export default CartDAO