import { test, expect, jest } from "@jest/globals"
import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { Role } from "../../src/components/user"; // Import the Role enum
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts")
jest.mock("crypto")

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
    const mockProduct = { model: testModel, quantity: 10, sellingPrice: 100, category: "category" };
    const mockCart = { id: 1, customer: testUser.username, paid: false, payment_date: null as unknown as Date, total: 0 };
    const mockProductInCart = { cart_id: mockCart.id, product_model: testModel, quantity: 1, category: "category", sellingPrice: 100 };

    // Mock db.get for product
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any, callback: (err: Error | null, row: any) => void) => {
        if (sql.includes("SELECT * FROM products WHERE model = ?")) {
            callback(null, mockProduct);
        } else if (sql.includes("SELECT * FROM carts WHERE customer = ? AND paid = ?")) {
            callback(null, mockCart);
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
    expect(db.get).toHaveBeenCalledTimes(3); // Adjusted expectation based on the logic
    expect(db.run).toHaveBeenCalledTimes(2); // Adjusted expectation based on the logic

    jest.restoreAllMocks();
});
