import { User } from "../components/user";
import { Cart } from "../components/cart";
import CartDAO from "../dao/cartDAO";
import ProductDAO from "../dao/productDAO"; 
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";


/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private cartDAO: CartDAO;
    private productDAO: ProductDAO;

    constructor() {
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO(); 
    }


    
    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param model - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */

    async addToCart(user: User, model: string) : Promise<Boolean> {
        const ret = await this.cartDAO.addToCart(user, model);
        return this.cartDAO.addToCart(user, model);

    }

    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    async getCart(user: User): Promise<Cart> {
        return this.cartDAO.getCart(user);
    }



    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     */

    async checkoutCart(user: User){
        return this.cartDAO.checkoutCart(user);
    }



    /**
     * Retrieves all paid carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        return this.cartDAO.getPaidCartsByUser(user.username);
    }
    


    /**
     * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
     * @param user The user who owns the cart.
     * @param product The model of the product to remove.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeProductFromCart(user: User, product: string): Promise<boolean> {
        const cart = await this.cartDAO.getCart(user);

        if (!cart) {
            throw new CartNotFoundError();
        }

        const productInCart = cart.products.find((p) => p.model === product);
        if (!productInCart) {
            throw new ProductNotInCartError();
        }

        if (productInCart.quantity === 1) {

            await this.cartDAO.removeProductFromCart(user.username, product);
        } else {
  
            await this.cartDAO.decreaseProductQuantity(user.username, product);
        }


        await this.cartDAO.updateCartTotal(user.username, -productInCart.price);

        return true;
    }


    /**
     * Removes all products from the current cart.
     * @param user - The user who owns the cart.
     * @returns A Promise that resolves to `true` if the cart was successfully cleared.
     */
    async clearCart(user: User): Promise<boolean> {
        const cart = await this.cartDAO.getCart(user);

        if (!cart) {
            throw new CartNotFoundError();
        }

        await this.cartDAO.clearCartProducts(user.username);
        await this.cartDAO.updateCartTotal(user.username, 0);

        return true;
    }



    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts(): Promise<boolean> {
        await this.cartDAO.deleteAllCarts();
        return true;
    }



    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts(): Promise<Cart[]> {
        return this.cartDAO.getAllCarts();
    }

}

export default CartController