import {
    describe,
    test,
    expect,
    jest,
    afterEach,
    beforeEach,
} from "@jest/globals";
import UserController from "../../src/controllers/userController";
import UserDAO from "../../src/dao/userDAO";
import crypto from "crypto";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import {
    UserNotFoundError,
    UserNotAdminError,
    UserIsAdminError,
    UnauthorizedUserError,
    UserAlreadyExistsError,
} from "../../src/errors/userError";
import { User, Role } from "../../src/components/user";

jest.mock("crypto");
jest.mock("../../src/db/db.ts");

describe("UserDAO", () => {
    let userDAO: UserDAO;

    beforeEach(() => {
        userDAO = new UserDAO();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser method", () => {
        test("It should resolve true", async () => {
            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }
            );
            jest.spyOn(crypto, "randomBytes").mockImplementation(async () =>
                Buffer.from("salt")
            );
            jest.spyOn(crypto, "scryptSync").mockImplementation(() =>
                Buffer.from("hashedPassword")
            );

            const result = await userDAO.createUser(
                "username",
                "name",
                "surname",
                "password",
                "role"
            );

            expect(result).toBe(true);
        });

        test("It should reject with UserAlreadyExistsError when username already exists", async () => {
            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    const error = new Error(
                        "UNIQUE constraint failed: users.username"
                    );
                    callback(error);
                    return {} as Database;
                }
            );
            jest.spyOn(crypto, "randomBytes").mockImplementation(() =>
                Buffer.from("salt")
            );
            jest.spyOn(crypto, "scryptSync").mockImplementation(() =>
                Buffer.from("hashedPassword")
            );

            await expect(
                userDAO.createUser(
                    "username",
                    "name",
                    "surname",
                    "password",
                    "role"
                )
            ).rejects.toThrow(UserAlreadyExistsError);
        });
    });

    describe("getUserByUsername method", () => {
        test("It should resolve the user object", async () => {
            const testUser = {
                username: "testuser",
                name: "Test",
                surname: "User",
                role: "user",
                address: "123 Main St",
                birthdate: "1990-01-01",
            };

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    callback(null, testUser);
                    return {} as Database;
                }
            );

            const result = await userDAO.getUserByUsername("testuser");

            expect(result).toEqual(testUser);
        });


        test("It should reject with error if database query fails", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    callback(new Error("Database error"));
                    return {} as Database;
                }
            );

            await expect(
                userDAO.getUserByUsername("testuser")
            ).rejects.toThrowError("Database error");
        });
    });

    describe("getUsersByRole method", () => {
        test("It should resolve an array of user objects", async () => {
            const testUsers = [
                {
                    username: "user1",
                    name: "User",
                    surname: "One",
                    role: "user",
                    address: "123 Main St",
                    birthdate: "1990-01-01",
                },
                {
                    username: "user2",
                    name: "User",
                    surname: "Two",
                    role: "user",
                    address: "456 Elm St",
                    birthdate: "1991-02-02",
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    callback(null, testUsers);
                    return {} as Database;
                }
            );

            const result = await userDAO.getUsersByRole("user");

            expect(result).toEqual(testUsers);
        });


        test("It should reject with error if database query fails", async () => {
            jest.spyOn(db, "all").mockImplementation(
                (sql, params, callback) => {
                    callback(new Error("Database error"));
                    return {} as Database;
                }
            );

            await expect(userDAO.getUsersByRole("user")).rejects.toThrowError(
                "Database error"
            );
        });
    });
    describe("deleteUser method", () => {
        const adminUser: User = {
            username: "adminUser",
            role: Role.ADMIN,
            name: "",
            surname: "",
            address: "",
            birthdate: "",
        };

        test("It should resolve to true on successful deletion by Admin", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    callback(null, { username: "userToDelete", role: "user" });
                    return {} as Database;
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }
            );

            const result = await userDAO.deleteUser("userToDelete");

            expect(result).toBe(true);
        });

        test("It should resolve to true on successful self-deletion by non-Admin", async () => {
            const userToDelete: User = {
                username: "userToDelete",
                role: Role.CUSTOMER,
                name: "",
                surname: "",
                address: "",
                birthdate: "",
            };

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    callback(null, userToDelete);
                    return {} as Database;
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                }
            );

            const result = await userDAO.deleteUser("userToDelete");

            expect(result).toBe(true);
        });


        test("It should reject with database error", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    callback(null, { username: "userToDelete", role: "user" });
                    return {} as Database;
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    callback(new Error("Database error"));
                    return {} as Database;
                }
            );

            await expect(
                userDAO.deleteUser("userToDelete")
            ).rejects.toThrowError("Database error");
        });
    });

    describe("updateUserInfo method", () => {
        const user: User = {
            username: "user1",
            name: "User",
            surname: "One",
            role: Role.CUSTOMER,
            address: "123 Main St",
            birthdate: "1990-01-01",
        };

        const adminUser: User = {
            username: "adminUser",
            name: "Admin",
            surname: "User",
            role: Role.ADMIN,
            address: "456 Elm St",
            birthdate: "1980-01-01",
        };

        test("Valid user updates their own information", async () => {
            // Mock database response
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    // Simulate retrieving the user before update
                    if (params[0] === "user1") {
                        return callback(null, user);
                    } else {
                        return callback(null, null); // Simulate non-existing user
                    }
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    // Simulate updating the user in the database
                    if (params[4] === "user1") {
                        user.name = params[0]; // Update user object with new data
                        user.surname = params[1];
                        user.address = params[2];
                        user.birthdate = params[3];
                        return callback(null);
                    } else {
                        return callback(new Error("User not found")); // Simulate user not found
                    }
                }
            );

            const updatedUser = await userDAO.updateUserInfo(
                user.username,
                "NewName",
                "NewSurname",
                "NewAddress",
                "1995-01-01"
                
            );

            expect(updatedUser.name).toBe("NewName");
            expect(updatedUser.surname).toBe("NewSurname");
            expect(updatedUser.address).toBe("NewAddress");
            expect(updatedUser.birthdate).toBe("1995-01-01");
        });

        test("It should reject with database error when user retrieval fails", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(new Error("Database error"));
                }
            );

            await expect(
                userDAO.updateUserInfo(
                    "user1",
                    "NewName",
                    "NewSurname",
                    "NewAddress",
                    "1995-01-01",
                    
                )
            ).rejects.toThrowError("Database error");
        });

        
        test("It should reject with database error when update operation fails", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, {
                        username: "user1",
                        role: "Customer",
                    }); // Simulate user found
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    return callback(new Error("Update error")); // Simulate update error
                }
            );

            await expect(
                userDAO.updateUserInfo(
                    "user1",
                    "NewName",
                    "NewSurname",
                    "NewAddress",
                    "1995-01-01",
                    
                )
            ).rejects.toThrowError("Update error");
        });

        test("It should reject with database error when retrieving updated user fails", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(null, {
                        username: "user1",
                        role: "Customer",
                    }); // Simulate user found
                }
            );

            jest.spyOn(db, "run").mockImplementation(
                (sql, params, callback) => {
                    return callback(null); // Simulate successful update operation
                }
            );

            jest.spyOn(db, "get").mockImplementation(
                (sql, params, callback) => {
                    return callback(new Error("Database error")); // Simulate retrieval error
                }
            );

            await expect(
                userDAO.updateUserInfo(
                    "user1",
                    "NewName",
                    "NewSurname",
                    "NewAddress",
                    "1995-01-01",
                    
                )
            ).rejects.toThrowError("Database error");
        });
    });
});
