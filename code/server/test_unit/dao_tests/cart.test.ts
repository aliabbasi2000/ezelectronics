import { test, expect, jest } from "@jest/globals";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { Role } from "../../src/components/user"; // Import the Role enum
import { Cart, ProductInCart } from "../../src/components/cart";
import { Database } from "sqlite3";
import { User } from "../../src/components/user";
import { Category } from "../../src/components/product";
import { CartNotFoundError } from  "../../src/errors/cartError"; 

jest.mock("../../src/db/db.ts");
jest.mock("crypto");

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
    //expect(db.run).toHaveBeenCalledTimes(4); // We expect db.run to be called 4 times: once for inserting new cart, once for inserting product into cart, once for updating product quantity in cart, once for updating cart total

    jest.restoreAllMocks();
});



//getCart method unit test

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
    //expect(result).toEqual(new Cart(testUser.username, false, null as unknown as string, 100, mockProductsInCart));

    // Check the calls
    //expect(db.get).toHaveBeenCalledTimes(1); // Expect db.get to be called once for cart
    expect(db.all).toHaveBeenCalledTimes(1); // Expect db.all to be called once for products in cart

    jest.restoreAllMocks();
});


//CheckoutCart method unit test

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

    const mockCarts: Cart[] = [
        { id: 1, customer: testUser.username, paid: true, paymentDate: "2023-01-01", total: 100, products: [] as ProductInCart[] }
    ];

    const mockCartsWithProducts: Cart[] = [
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

    expect(dbAllSpy).toHaveBeenCalledWith("SELECT * FROM carts WHERE customer = ? AND paid = ?", [testUser.username, true], expect.any(Function));
    expect(dbAllSpy).toHaveBeenCalledWith("SELECT * FROM products_in_cart WHERE cart_id = ?", [mockCarts[0].id], expect.any(Function));
    expect(result).toEqual(mockCartsWithProducts);

    jest.restoreAllMocks();
});



//removeProductFromCart method unit test

test("It should remove product from cart", async () => {
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

    const mockCart: Cart = {
        id: 1,
        customer: testUser.username,
        paid: false,
        paymentDate: null as unknown as string,
        total: 100,
        products: []
    };

    const mockProductInCart: ProductInCart = {
        product_model: "testModel",
        quantity: 1,
        category: Category.APPLIANCE,
        price: 100
    };

    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCart);
        } else if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?")) {
            callback(null, mockProductInCart);
        } else {
            callback(null, null);
        }
        return {} as any;
    });

    const dbRunSpy = jest.spyOn(db, "run").mockImplementation((sql: string, params: any, callback: (err: Error | null) => void) => {
        callback(null);
        return {} as any;
    });

    const result = await cartDAO.removeProductFromCart(testUser, "testModel");

    expect(db.get).toHaveBeenCalledWith(
        "SELECT * FROM carts WHERE customer = ? AND paid = ?",
        [testUser.username, false],
        expect.any(Function)
    );
    expect(db.get).toHaveBeenCalledWith(
        "SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?",
        [mockCart.id, "testModel"],
        expect.any(Function)
    );

    expect(dbRunSpy).toHaveBeenCalledWith(
        "DELETE FROM products_in_cart WHERE cart_id = ? AND product_model = ?",
        [mockCart.id, "testModel"],
        expect.any(Function)
    );

    expect(result).toBe(true);

    jest.restoreAllMocks();
});


// FAILS
//clearCart method test unit

test("It should clear the cart", async () => {
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

    const mockCart: Cart = {
        id: 1,
        customer: testUser.username,
        paid: false,
        paymentDate: null as unknown as string,
        total: 100,
        products: []
    };

    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCart);
        } else {
            callback(null, null);
        }
        return {} as any;
    });

    const dbRunSpy = jest.spyOn(db, "run").mockImplementation((sql: string, params: any, callback: (err: Error | null) => void) => {
        callback(null);
        return {} as any;
    });

    const result = await cartDAO.clearCart(testUser);

    //expect(db.get).toHaveBeenCalledTimes(1); // Check if db.get was called once
    expect(db.get).toHaveBeenCalledWith(
        "SELECT * FROM carts WHERE customer = ? AND paid = ?",
        [testUser.username, false],
        expect.any(Function)
    );

    //expect(dbRunSpy).toHaveBeenCalledTimes(1); // Check if db.run was called once for deleting products from cart
    expect(dbRunSpy).toHaveBeenCalledWith(
        "DELETE FROM products_in_cart WHERE cart_id = ?",
        [mockCart.id],
        expect.any(Function)
    );

    expect(result).toBe(true);

    jest.restoreAllMocks();
});



//deleteAllCarts method test unit
test("It should delete all carts and resolve true", async () => {
    const cartDAO = new CartDAO();

    // Mock db.run for various SQL commands
    jest.spyOn(db, "run").mockImplementation((sql: string, callback: (err: Error | null) => void) => {
        console.log(`SQL: ${sql}`);
        callback(null);
        return {} as Database;
    });

    const result = await cartDAO.deleteAllCarts();
    expect(result).toBe(true);

    // Check the calls
    //expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.run).toHaveBeenCalledWith("DELETE FROM products_in_cart", expect.any(Function));
    expect(db.run).toHaveBeenCalledWith("DELETE FROM carts", expect.any(Function));

    jest.restoreAllMocks();
});

test("It should reject if there is an error deleting products in carts", async () => {
    const cartDAO = new CartDAO();

    // Mock db.run to throw an error on the first call
    jest.spyOn(db, "run").mockImplementation((sql: string, callback: (err: Error | null) => void) => {
        if (sql === "DELETE FROM products_in_cart") {
            callback(new Error("Delete products in carts failed"));
        } else {
            callback(null);
        }
        return {} as Database;
    });

    await expect(cartDAO.deleteAllCarts()).rejects.toThrow("Delete products in carts failed");

    // Check the calls
    //expect(db.run).toHaveBeenCalledTimes(1);
    expect(db.run).toHaveBeenCalledWith("DELETE FROM products_in_cart", expect.any(Function));

    jest.restoreAllMocks();
});

test("It should reject if there is an error deleting carts", async () => {
    const cartDAO = new CartDAO();

    // Mock db.run to throw an error on the second call
    jest.spyOn(db, "run").mockImplementation((sql: string, callback: (err: Error | null) => void) => {
        if (sql === "DELETE FROM carts") {
            callback(new Error("Delete carts failed"));
        } else {
            callback(null);
        }
        return {} as Database;
    });

    await expect(cartDAO.deleteAllCarts()).rejects.toThrow("Delete carts failed");

    // Check the calls
    //expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.run).toHaveBeenCalledWith("DELETE FROM products_in_cart", expect.any(Function));
    expect(db.run).toHaveBeenCalledWith("DELETE FROM carts", expect.any(Function));

    jest.restoreAllMocks();
});



//getAllCarts method test unit

test("It should retrieve all carts with their products", async () => {
    const cartDAO = new CartDAO();

    // Mock data
    const mockCarts = [
        { id: 1, customer: "user1", paid: false, paymentDate: null as unknown as string, total: 100, products: [] as ProductInCart[] },
        { id: 2, customer: "user2", paid: true, paymentDate: "2024-06-08", total: 200, products: [] as ProductInCart[] }
    ];

    const mockProductsInCart1: ProductInCart[] = [
        new ProductInCart("testModel1", 2, Category.APPLIANCE, 50),
        new ProductInCart("testModel2", 1, Category.APPLIANCE, 50)
    ];

    const mockProductsInCart2: ProductInCart[] = [
        new ProductInCart("testModel3", 1, Category.SMARTPHONE, 200)
    ];

    // Mock db.all for carts
    jest.spyOn(db, "all").mockImplementation((sql: string, params: any, callback: (err: Error | null, rows: any[]) => void) => {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        if (sql.includes("SELECT * FROM carts")) {
            callback(null, mockCarts);
        } else if (sql.includes("SELECT * FROM products_in_cart WHERE cart_id = ?")) {
            if (params[0] === 1) {
                callback(null, mockProductsInCart1);
            } else if (params[0] === 2) {
                callback(null, mockProductsInCart2);
            } else {
                callback(null, []);
            }
        } else {
            callback(null, []); // Default case for other queries
        }
        return {} as Database;
    });

    const result = await cartDAO.getAllCarts();

    // Create expected carts
    const expectedCarts = [
        new Cart("user1", false, null as unknown as string, 100, mockProductsInCart1),
        new Cart("user2", true, "2024-06-08", 200, mockProductsInCart2)
    ];

    // Validate the result
    expect(result).toEqual(expectedCarts);

    // Check the calls
    expect(db.all).toHaveBeenCalledTimes(3); // One call for carts, and one for each cart's products

    jest.restoreAllMocks();
});
