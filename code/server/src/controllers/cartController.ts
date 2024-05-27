import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";


/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private dao: CartDAO

    constructor() {
        this.dao = new CartDAO
    }


    
    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param model - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */
    async addToCart(user: User, model: string): Promise<boolean> {
        const product = await this.productDAO.getProductByModel(model);
        if (!product) {
            throw new ProductNotFoundError();
        }
        if (product.availableQuantity === 0) {
            throw new ProductOutOfStockError();
        }

        let cart = await this.cartDAO.getUnpaidCartByUser(user.username);
        if (!cart) {
            cart = await this.cartDAO.createCart(user.username);
        }

        const cartProduct = await this.cartDAO.getProductInCart(cart.customer, model);
        if (!cartProduct) {
            await this.cartDAO.addProductToCart(cart.customer, model, product.price);
        } else {
            await this.cartDAO.updateProductQuantity(cart.customer, model, cartProduct.quantity + 1);
        }

        await this.cartDAO.updateCartTotal(cart.customer, product.price);
        return true;
}



    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
        async getCart(user: User): Promise<Cart> {
            return this.cartDAO.getCart(user.username);
        }



    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     */
    async checkoutCart(user: User): Promise<boolean> {
        const cart = await this.cartDAO.getUnpaidCartByUser(user.username);
        if (!cart) {
            throw new CartNotFoundError();
        }
        if (cart.products.length === 0) {
            throw new EmptyCartError();
        }

        for (const product of cart.products) {
            const dbProduct = await this.productDAO.getProductByModel(product.model);
            if (!dbProduct) {
                throw new ProductNotFoundError();
            }
            if (dbProduct.availableQuantity === 0) {
                throw new EmptyProductStockError();
            }
            if (product.quantity > dbProduct.availableQuantity) {
                throw new LowProductStockError();
            }
        }

        await this.cartDAO.checkoutCart(cart.customer, cart.products);
        return true;
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
        const cart = await this.cartDAO.getCart(user.username);

        if (!cart) {
            throw new CartNotFoundError();
        }

        const productInCart = cart.products.find(p => p.model === product);
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
        const cart = await this.cartDAO.getCart(user.username);

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
    async deleteAllCarts() /**Promise<Boolean> */ { }

    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts() /*:Promise<Cart[]> */ { }
}

export default CartController