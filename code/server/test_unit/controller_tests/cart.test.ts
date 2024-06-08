import { test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import CartDAO from "../../src/dao/cartDAO"
import { User, Role } from "../../src/components/user";
import { Category } from "../../src/components/product";
import CartController from "../../src/controllers/cartController"

jest.mock("../../src/dao/userDAO")
jest.mock("../../src/dao/cartDAO")


//addTOCart method unit test
test("It should return true", async () => {
    const testUser = { // Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER, // Use the Role enum
        address: "test",
        birthdate: "test"
    }
    const testModel = "testModel";

    jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(true); // Mock the addToCart method of the DAO

    const controller = new CartController(); // Create a new instance of the controller
    // Call the addToCart method of the controller with the test user object and model
    const response = await controller.addToCart(testUser, testModel);

    // Check if the addToCart method of the DAO has been called once with the correct parameters
    expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
    expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(testUser, testModel);
    expect(response).toBe(true); // Check if the response is true
});


//getCart method unit test
import { Cart, ProductInCart } from "../../src/components/cart"; // Import the Cart and ProductInCart classes

jest.mock("../../src/dao/cartDAO");

test("It should retrieve the cart with products", async () => {
    const testUser = { 
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER, // Use the Role enum
        address: "test",
        birthdate: "test"
    };
    
    // Mock data
    const mockCart = new Cart(
        testUser.username, 
        false, 
        null as unknown as string, 
        0, 
        [
            new ProductInCart("testModel1", 2, Category.APPLIANCE, 50),
            new ProductInCart("testModel2", 1, Category.LAPTOP , 100)
        ]
    );

    jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(mockCart);

    const controller = new CartController();
    const result = await controller.getCart(testUser);

    expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1); // Check if the getCart method of the DAO has been called once
    expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser); // Check if the getCart method of the DAO has been called with the correct parameter
    expect(result).toEqual(mockCart); // Check if the response matches the mock cart

    jest.restoreAllMocks();
});


//checkoutCart method unit test
jest.mock("../../src/dao/cartDAO");

test("It should checkout the cart", async () => {
    const testUser = {
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER, // Use the Role enum
        address: "test",
        birthdate: "test"
    };

    // Mock CartDAO's checkoutCart method
    jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(true);

    const controller = new CartController();
    const result = await controller.checkoutCart(testUser);

    // Validate the result
    expect(result).toBe(true);

    // Check if the checkoutCart method of the DAO has been called once with the correct parameters
    expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
    expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(testUser);

    jest.restoreAllMocks();
});


//getCustomerCarts method unit test

jest.mock("../../src/dao/cartDAO");

test("It should return customer carts", async () => {
    const testUser = { 
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER,
        address: "test",
        birthdate: "test"
    };

    const mockProductsInCart: ProductInCart[] = [
        { product_model: "testModel", quantity: 1, category: Category.APPLIANCE , price: 100 }
    ];

    const mockCarts: Cart[] = [
        { id: 1, customer: testUser.username, paid: true, paymentDate: "2023-01-01", total: 100, products: mockProductsInCart }
    ];

    jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValueOnce(mockCarts);

    const controller = new CartController();
    const response = await controller.getCustomerCarts(testUser);

    expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
    expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(testUser);
    expect(response).toEqual(mockCarts);
});



//removeProductFromCart method test unit
jest.mock("../../src/dao/cartDAO");

test("It should remove product from cart", async () => {
    const testUser = { 
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER,
        address: "test",
        birthdate: "test"
    };

    jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValueOnce(true);

    const controller = new CartController();
    const response = await controller.removeProductFromCart(testUser, "testModel");

    expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
    expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledWith(testUser, "testModel");
    expect(response).toBe(true);
});
