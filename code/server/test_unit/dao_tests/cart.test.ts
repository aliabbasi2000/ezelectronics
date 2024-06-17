//my new version
import { test, expect, jest, describe, afterEach, beforeEach } from "@jest/globals";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { Role } from "../../src/components/user"; // Import the Role enum
import { Cart, ProductInCart } from "../../src/components/cart";
import { Database } from "sqlite3";
import { User } from "../../src/components/user";
import { Category } from "../../src/components/product";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from  "../../src/errors/cartError"; 
import { Product } from "../../src/components/product";
import { ProductNotFoundError } from "../../src/errors/productError";

jest.mock("../../src/db/db.ts");
jest.mock("crypto");


describe("CartDAO", () => {
    let cartDAOInstance: CartDAO;

    beforeEach(() => {
        cartDAOInstance = new CartDAO();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const user: User = {
        username: "test",
        name: "test",
        surname: "test",
        role: Role.CUSTOMER,
        birthdate: "test",
        address: "test",
    };
    const productModel = "testmodel";
    const product: Product = {
        model: productModel,
        quantity: 15,
        category: Category.SMARTPHONE,
        sellingPrice: 999,
        arrivalDate: "",
        details: "",
    };
    const cart: Cart = {
        id: 1,
        customer: user.username,
        paid: false,
        paymentDate: "",
        total: 0,
        products: [],
    };
    const productInCart: ProductInCart = {
        product_model: productModel,
        quantity: 1,
        category: product.category,
        price: product.sellingPrice,
    };

    const productsInCart: ProductInCart = {
        product_model: productModel,
        quantity: 2,
        category: product.category,
        price: product.sellingPrice,
    };


    //addTOCart method unit test
    describe("addToCart Tests:", () => {
        test("It should add a product to an existing cart", async () => {
            // Mock db responses

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    if (
                        sql.includes("SELECT * FROM products WHERE model = ?")
                    ) {
                        return callback(null, product);
                    } else if (
                        sql.includes(
                            "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                        )
                    ) {
                        callback(null, cart);
                    } else if (
                        sql.includes(
                            "SELECT * FROM products_in_cart WHERE cart_id = ? AND product_model = ?"
                        )
                    ) {
                        return callback(null, null); // Product not in cart
                    }
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    return callback(null);
                }
            );

            const result = await CartDAO.prototype.addToCart(
                user,
                productModel
            );
            expect(result).toBe(true);
            expect(db.get).toHaveBeenCalledTimes(3); 
            expect(db.run).toHaveBeenCalledTimes(2); 
        });

        test("It should create a new cart and add a product to it", async () => {
            const dbGetMock = jest
                .spyOn(db, "get")
                .mockImplementationOnce((sql, params, callback) => {
                    if (
                        sql.includes("SELECT * FROM products WHERE model = ?")
                    ) {
                        return callback(null, product);
                    }
                });

            dbGetMock.mockImplementationOnce((sql, params, callback) => {
                if (
                    sql.includes(
                        "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                    )
                ) {
                    return callback(null, null); // No cart found
                }
            });

            dbGetMock.mockImplementationOnce((sql, params, callback) => {
                if (
                    sql.includes(
                        "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                    )
                ) {
                    return callback(null, { ...cart, id: 2 }); // Return new cart
                }
            });

            
            const dbRunMock = jest
                .spyOn(db, "run")
                .mockImplementation((sql, params, callback) => {
                    return callback(null);
                });

            const result = await CartDAO.prototype.addToCart(
                user,
                productModel
            );

            expect(result).toBe(true);
            expect(db.get).toHaveBeenCalledTimes(3); 
            expect(db.run).toHaveBeenCalledTimes(3); 
        });

        test("It should throw ProductNotFoundError if the product is not found", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null);
                }
            );

            await expect(
                CartDAO.prototype.addToCart(user, productModel)
            ).rejects.toThrow(ProductNotFoundError);
            expect(db.get).toHaveBeenCalledTimes(1); // Check product
        });
    });


    //getCart method unit test
    describe("getCart Tests:", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("It should return an empty cart if the user has no unpaid cart", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, null); 
                }
            );

            const result = await CartDAO.prototype.getCart(user);
            expect(result.customer).toBe(user.username);
            expect(result.paid).toBe(false);
            expect(result.products.length).toBe(0);
        });

        test("It should return the user's current cart if it exists", async () => {
            const cart = {
                id: 1,
                customer: "test",
                paid: false,
                paymentDate: "",
                total: 0,
                products: [{ product_model: "testmodel", quantity: 1 }],
            };
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, cart); 
                }
            );
            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, cart.products);
                }
            );


            const result = await CartDAO.prototype.getCart(user);
            expect(result).toEqual(cart);
        });

        test("It should reject with an error if there's an issue with the database query", async () => {
            
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(new Error("Database error")); 
                }
            );

            await expect(CartDAO.prototype.getCart(user)).rejects.toThrow(
                Error
            );
        });
    });



    //CheckoutCart method unit test
    describe("checkoutCart Tests:", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("It should set the user's current cart to paid", async () => {
            const mockUser: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.CUSTOMER,
                birthdate: "test",
                address: "test",
            };

            const mockCart = {
                id: 1,
                customer: mockUser.username,
                paid: true,
                paymentDate: "2024-01-01",
                total: 100,
                product: [
                    {
                        model: "Iphone",
                        quantity: 20,
                        category: Category.SMARTPHONE,
                        sellingPrice: 1199,
                        arrivalDate: "",
                        details: "",
                    },
                    {
                        model: "Samsung",
                        quantity: 20,
                        category: Category.LAPTOP,
                        sellingPrice: 999,
                        arrivalDate: "",
                        details: "",
                    },
                ],
            };

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, mockCart); 
                }
            );

            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, mockCart.product); 
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    return callback(null); 
                }
            );

            const result = await CartDAO.prototype.checkoutCart(mockUser);

            expect(result).toBe(true);
        });

        test("It should reject with CartNotFoundError if the user has no unpaid cart", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, null); 
                }
            );

            await expect(CartDAO.prototype.checkoutCart(user)).rejects.toThrow(
                CartNotFoundError
            );
        });

        test("It should reject with EmptyCartError if the cart is empty", async () => {

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, cart); 
                }
            );
            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, []); 
                }
            );

            
            await expect(CartDAO.prototype.checkoutCart(user)).rejects.toThrow(
                EmptyCartError
            );
        });
    });


    //getCustomerCarts method unit test
    describe("getCustomerCarts Tests:", () => {
        test("It should return the user's paid carts", async () => {
            const user: User = {
                username: "test",
                name: "test",
                surname: "test",
                role: Role.CUSTOMER,
                birthdate: "test",
                address: "test",
            };

            const paidCart1: Cart = {
                id: 1,
                customer: user.username,
                paid: true,
                paymentDate: "2024-01-01",
                total: 100,
                products: [],
            };

            const paidCart2: Cart = {
                id: 2,
                customer: user.username,
                paid: true,
                paymentDate: "2024-01-02",
                total: 150,
                products: [],
            };

            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    if (
                        sql ===
                        "SELECT * FROM carts WHERE customer = ? AND paid = ?"
                    ) {
                        return callback(null, [paidCart1, paidCart2]);
                    } else if (
                        sql ===
                        "SELECT * FROM products_in_cart WHERE cart_id = ?"
                    ) {

                        return callback(null, []); 
                    } else {
                        return callback(new Error("Unexpected SQL query"));
                    }
                }
            );

            const result = await CartDAO.prototype.getCustomerCarts(user);

            expect(result).toHaveLength(2); 
            expect(result[0]).toEqual(paidCart1); 
            expect(result[1]).toEqual(paidCart2); 
        });
    });


    //removeProductFromCart method unit test
    describe("removeProductFromCart Tests:", () => {
        test("It should remove a product from the cart if the quantity is greater than 1", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    if (sql.includes("SELECT * FROM carts")) {
                        return callback(null, cart);
                    } else if (sql.includes("SELECT * FROM products_in_cart")) {
                        return callback(null, productsInCart);
                    }
                }
            );
            const runMock = jest
                .spyOn(db, "run")
                .mockImplementation((sql, params, callback) => {
                    return callback(null); 
                });

            const result = await CartDAO.prototype.removeProductFromCart(
                user,
                "testProduct"
            );

            expect(result).toBe(true);
            expect(runMock).toHaveBeenCalledTimes(1);
            expect(runMock.mock.calls[0][0]).toContain(
                "UPDATE products_in_cart SET quantity = quantity - 1"
            );
        });

        test("It should remove a product from the cart if the quantity is 1", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    if (sql.includes("SELECT * FROM carts")) {
                        return callback(null, cart);
                    } else if (sql.includes("SELECT * FROM products_in_cart")) {
                        return callback(null, productInCart);
                    }
                }
            );
            const runMock = jest
                .spyOn(db, "run")
                .mockImplementation((sql, params, callback) => {
                    return callback(null); 
                });

            const result = await CartDAO.prototype.removeProductFromCart(
                user,
                "testProduct"
            );

            expect(result).toBe(true);
            expect(runMock).toHaveBeenCalledTimes(1);
            expect(runMock.mock.calls[0][0]).toContain(
                "DELETE FROM products_in_cart"
            );
        });

        test("It should throw CartNotFoundError if the cart is not found", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null);
                }
            );

            await expect(
                CartDAO.prototype.removeProductFromCart(user, "testProduct")
            ).rejects.toThrowError(CartNotFoundError);
        });

        test("It should throw ProductNotInCartError if the product is not found in the cart", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    if (sql.includes("SELECT * FROM carts")) {
                        return callback(null, cart);
                    } else if (sql.includes("SELECT * FROM products_in_cart")) {
                        return callback(null); 
                    }
                }
            );

            await expect(
                CartDAO.prototype.removeProductFromCart(user, "testProduct")
            ).rejects.toThrowError(ProductNotInCartError);
        });
    });


    //clearCart method test unit
    describe("clearCart Tests:", () => {
        test("It should clear the user's cart", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, cart);
                }
            );
            const runMock = jest
                .spyOn(db, "run")
                .mockImplementation((sql, params, callback) => {
                    return callback(null); 
                });

            const result = await CartDAO.prototype.clearCart(user);

            expect(result).toBe(true);
            expect(runMock).toHaveBeenCalledTimes(1);
            expect(runMock.mock.calls[0][0]).toContain(
                "DELETE FROM products_in_cart"
            );
        });

        test("It should throw CartNotFoundError if the cart is not found", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null); 
                }
            );

            await expect(
                CartDAO.prototype.clearCart(user)
            ).rejects.toThrowError(CartNotFoundError);
        });
    });



    //deleteAllCarts method test unit
    describe("deleteAllCarts Tests:", () => {
        test("It should delete all carts from the database", async () => {
            const runMock = jest
                .spyOn(db, "run")
                .mockImplementation((sql, callback) => {
                    return callback(null); 
                });

            const result = await CartDAO.prototype.deleteAllCarts();

            expect(result).toBe(true);
            expect(runMock).toHaveBeenCalledTimes(2); 
            expect(runMock.mock.calls[0][0]).toContain(
                "DELETE FROM products_in_cart"
            );
            expect(runMock.mock.calls[1][0]).toContain("DELETE FROM carts");
        });
    });



    //getAllCarts method test unit
    describe("getAllCarts Tests:", () => {
        test("It should return all carts from the database", async () => {
            const mockRows = [
                {
                    id: 1,
                    customer: "user1",
                    paid: true,
                    paymentDate: "2024-01-01",
                    total: 100,
                    product: [
                        {
                            model: "Iphone",
                            quantity: 20,
                            category: Category.SMARTPHONE,
                            sellingPrice: 1199,
                            arrivalDate: "",
                            details: "",
                        },
                        {
                            model: "Samsung",
                            quantity: 20,
                            category: Category.LAPTOP,
                            sellingPrice: 999,
                            arrivalDate: "",
                            details: "",
                        },
                    ],
                },
                {
                    id: 2,
                    customer: "user2",
                    paid: false,
                    paymentDate: "",
                    total: 0,
                    product: [
                        {
                            model: "Samsung",
                            quantity: 5,
                            category: Category.SMARTPHONE,
                            sellingPrice: 899,
                            arrivalDate: "",
                            details: "",
                        },
                        {
                            model: "Dell",
                            quantity: 10,
                            category: Category.LAPTOP,
                            sellingPdrice: 1200,
                            arrivalDate: "",
                            details: "",
                        },
                    ],
                },
            ];
            jest.spyOn(db, "all").mockImplementationOnce((sql, callback) => {
                return callback(null, mockRows); 
            });

            const result = await CartDAO.prototype.getAllCarts();

            expect(result).toEqual(mockRows);
        });

        test("It should return an empty array if no carts are found in the database", async () => {

            jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                return callback(null, []);
            });

            const result = await CartDAO.prototype.getAllCarts();

            expect(result).toEqual([]);
        });
    });
});
