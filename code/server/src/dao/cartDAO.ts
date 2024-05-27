import db from "../db/db"
import { Cart, ProductInCart } from "../components/user"
import crypto from "crypto"
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";


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
    getCartByUserId(userId: string): Promise<Cart> {
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

}

export default CartDAO