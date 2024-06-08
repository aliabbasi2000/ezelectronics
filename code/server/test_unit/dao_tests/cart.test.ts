import { test, expect, jest } from "@jest/globals";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { Role } from "../../src/components/user"; // Import the Role enum
import { Cart, ProductInCart } from "../../src/components/cart";
import { Database } from "sqlite3";
import { User } from "../../src/components/user";
import { Category } from "../../src/components/product";

jest.mock("../../src/db/db.ts");

//addTOCart method unit test
test("It should resolve true", async () => {
    const cartDAO = new CartDAO();
    const testUser = { 
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER, // Use the Role enum
        address: "test",
        birthdate: "test"
    };
    const testModel = "testModel";
    
    // Mock data
    const mockProduct = { model: testModel, quantity: 10, sellingPrice: 100, category: Category.SMARTPHONE };
    const mockCart = { id: 1, customer: testUser.username, paid: false, paymentDate: null as unknown as Date, total: 0 };
    const mockProductInCart = { cart_id: mockCart.id, product_model: testModel, quantity: 1, category: Category.SMARTPHONE, sellingPrice: 100 };

    // Counter to simulate different calls to db.get
    let getCallCount = 0;

    // Mock db.get for product
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        getCallCount++;
        if (sql.includes("SELECT * FROM products WHERE model = ?")) {
            callback(null, mockProduct);
        } else if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            if (getCallCount === 2) { // Simulate no cart found on first call
                callback(null, null);
            } else {
                callback(null, mockCart);
            }
        } else if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?")) {
            callback(null, mockProductInCart);
        } else {
            callback(null, null); // Default case for other queries
        }
        return {} as Database;
    });

    // Mock db.run for various SQL commands
    jest.spyOn(db, "run").mockImplementation((sql: string, params: any, callback: (err: Error | null) => void) => {
        console.log(`SQL: ${sql}, Params: ${params}`);
        callback(null);
        return {} as Database;
    });

    const result = await cartDAO.addToCart(testUser, testModel);
    expect(result).toBe(true);

    // Check the calls
    expect(db.get).toHaveBeenCalledTimes(3); // We expect db.get to be called 3 times: once for product, once for cart, once for product_in_cart
    expect(db.run).toHaveBeenCalledTimes(4); // We expect db.run to be called 4 times: once for inserting new cart, once for inserting product into cart, once for updating product quantity in cart, once for updating cart total

    jest.restoreAllMocks();
});



//getCart method unit test

jest.mock("../../src/db/db.ts");
jest.mock("crypto");

test("It should retrieve the cart with products", async () => {
    const cartDAO = new CartDAO();
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
    const mockCart = { id: 1, customer: testUser.username, paid: false, paymentDate: null as unknown as string, total: 100, products: [] as ProductInCart[] };
    const mockProductsInCart: ProductInCart[] = [
        { product_model: "testModel1", quantity: 2, category: Category.APPLIANCE, price: 50 },
        { product_model: "testModel2", quantity: 1, category: Category.APPLIANCE, price: 50 }
    ];

    // Mock db.get for cart
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCart);
        } else {
            callback(null, null); // Default case for other queries
        }
        return {} as Database;
    });

    // Mock db.all for products in cart
    jest.spyOn(db, "all").mockImplementation((sql: string, params: any, callback: (err: Error | null, rows: any[]) => void) => {
        if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ?")) {
            callback(null, mockProductsInCart);
        } else {
            callback(null, []); // Default case for other queries
        }
        return {} as Database;
    });

    const result = await cartDAO.getCart(testUser);

    // Validate the result
    expect(result).toEqual(new Cart(testUser.username, false, null as unknown as string, 100, mockProductsInCart));

    // Check the calls
    expect(db.get).toHaveBeenCalledTimes(1); // Expect db.get to be called once for cart
    expect(db.all).toHaveBeenCalledTimes(1); // Expect db.all to be called once for products in cart

    jest.restoreAllMocks();
});


//CheckoutCart method unit test

jest.mock("../../src/db/db.ts");

test("It should checkout the cart", async () => {
    const cartDAO = new CartDAO();
    const testUser = {
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER,
        address: "test",
        birthdate: "test"
    };

    // Mock data
    const mockCart: Cart = { id: 1, customer: testUser.username, paid: false, paymentDate: "", total: 0, products: [] };
    const mockProductsInCart: ProductInCart[] = [
        { product_model: "testModel1", quantity: 2, category: Category.SMARTPHONE, price: 50 },
        { product_model: "testModel2", quantity: 1, category: Category.SMARTPHONE, price: 50 }
    ];

    // Mock db.get for cart
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        if (sql.includes("SELECT id FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCart);
        } else {
            callback(null, null); // Default case for other queries
        }
        return {} as Database;
    });

    // Mock db.all for products in cart
    jest.spyOn(db, "all").mockImplementation((sql: string, params: any, callback: (err: Error | null, rows: any[]) => void) => {
        if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ?")) {
            callback(null, mockProductsInCart);
        } else {
            callback(null, []); // Default case for other queries
        }
        return {} as Database;
    });

    // Mock db.run for updating cart and products
    jest.spyOn(db, "run").mockImplementation((sql: string, params: any, callback: (err: Error | null) => void) => {
        callback(null);
        return {} as Database;
    });

    const result = await cartDAO.checkoutCart(testUser);

    // Validate the result
    expect(result).toBe(true);

    // Check the calls
    expect(db.get).toHaveBeenCalledTimes(1); // Expect db.get to be called once for cart
    expect(db.all).toHaveBeenCalledTimes(1); // Expect db.all to be called once for products in cart
    expect(db.run).toHaveBeenCalledTimes(2); // Expect db.run to be called twice for updating cart and products

    jest.restoreAllMocks();
});


//getCustomerCarts method unit test

jest.mock("../../src/db/db.ts");
jest.mock("crypto");

test("It should return customer carts", async () => {
    const cartDAO = new CartDAO();
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
        { product_model: "testModel", quantity: 1, category: Category.APPLIANCE, price: 100 }
    ];

    const mockCarts = [
        { id: 1, customer: testUser.username, paid: true, paymentDate: "2023-01-01", total: 100, products: [] }
    ];

    const mockCartsWithProducts = [
        { ...mockCarts[0], products: mockProductsInCart }
    ];

    const dbAllSpy = jest.spyOn(db, "all").mockImplementation((sql: string, params: any, callback: (err: Error | null, rows: any[]) => void) => {
        if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCarts);
        } else if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ?")) {
            callback(null, mockProductsInCart);
        } else {
            callback(null, []);
        }
        return {} as Database; // Ensure the return type is Database
    });

    const result = await cartDAO.getCustomerCarts(testUser);

    expect(dbAllSpy).toHaveBeenCalledTimes(2); // Called once for carts and once for products in the cart
    expect(dbAllSpy).toHaveBeenCalledWith("SELECT * FROM carts WHERE customer = ? AND paid = ?", [testUser.username, true], expect.any(Function));
    expect(dbAllSpy).toHaveBeenCalledWith("SELECT * FROM products_in_cart WHERE cart_id = ?", [mockCarts[0].id], expect.any(Function));
    expect(result).toEqual(mockCartsWithProducts);

    jest.restoreAllMocks();
});
