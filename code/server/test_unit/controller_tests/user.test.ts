import {test, expect, jest, describe, beforeEach, afterEach} from "@jest/globals";
import UserController from "../../src/controllers/userController";
import UserDAO from "../../src/dao/userDAO";
import { User, Role } from "../../src/components/user";
import { UnauthorizedUserError } from "../../src/errors/userError";

jest.mock("../../src/dao/userDAO");

describe("UserController", () => {
    let userController: UserController;

    beforeEach(() => {
        userController = new UserController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        test("createUser returns true when DAO method returns true", async () => {
            const newUser = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                password: "examplePassword",
                role: "Admin",
            };

            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true);

            const result = await userController.createUser(
                newUser.username,
                newUser.name,
                newUser.surname,
                newUser.password,
                newUser.role
            );

            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
                newUser.username,
                newUser.name,
                newUser.surname,
                newUser.password,
                newUser.role
            );
            expect(result).toBe(true);
        });
    });

    describe("getUsers", () => {
        test("getUsers returns an array of users when DAO method returns users", async () => {
            const sampleUsers: User[] = [
                {
                    username: "user1",
                    name: "User One",
                    surname: "One",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1990-01-01",
                },
                {
                    username: "user2",
                    name: "User Two",
                    surname: "Two",
                    role: Role.MANAGER,
                    address: "456 Elm St",
                    birthdate: "1980-02-02",
                },
            ];

            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce(sampleUsers);

            const result = await userController.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(expect.arrayContaining(sampleUsers));
        });
    });

    describe("getUsersByRole", () => {
        test("getUsersByRole returns an array of users when DAO method returns users with the specified role", async () => {
            const specificRole = Role.CUSTOMER;
            const sampleUsers: User[] = [
                {
                    username: "user1",
                    name: "User One",
                    surname: "One",
                    role: specificRole,
                    address: "123 Main St",
                    birthdate: "1990-01-01",
                },
                {
                    username: "user2",
                    name: "User Two",
                    surname: "Two",
                    role: specificRole,
                    address: "456 Elm St",
                    birthdate: "1980-02-02",
                },
            ];

            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce(sampleUsers);

            const result = await userController.getUsersByRole(specificRole);

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(specificRole);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(expect.arrayContaining(sampleUsers));
        });
    });

    describe("getUserByUsername", () => {
        test("getUserByUsername returns the user when user is admin", async () => {
            const sampleUser: User = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                role: Role.CUSTOMER,
                address: "789 Maple St",
                birthdate: "1990-01-01",
            };

            const adminUser: User = {
                username: "adminUser",
                name: "Admin",
                surname: "User",
                role: Role.ADMIN,
                address: "101 Pine St",
                birthdate: "1980-02-02",
            };

            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(sampleUser);

            const result = await userController.getUserByUsername(adminUser, sampleUser.username);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(sampleUser.username);
            expect(result).toEqual(sampleUser);
        });

        test("getUserByUsername returns the user when user is authorized to access", async () => {
            const sampleUser: User = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                role: Role.CUSTOMER,
                address: "789 Maple St",
                birthdate: "1990-01-01",
            };

            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(sampleUser);

            const result = await userController.getUserByUsername(sampleUser, sampleUser.username);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(sampleUser.username);
            expect(result).toEqual(sampleUser);
        });

        test("getUserByUsername returns UnauthorizedUserError when user is not authorized to access", async () => {
            const sampleUser: User = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                role: Role.CUSTOMER,
                address: "789 Maple St",
                birthdate: "1990-01-01",
            };

            const unauthorizedUser: User = {
                username: "unauthorizedUser",
                name: "Unauthorized",
                surname: "User",
                role: Role.CUSTOMER,
                address: "102 Oak St",
                birthdate: "1980-03-03",
            };

            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(sampleUser);

            await expect(
                userController.getUserByUsername(unauthorizedUser, sampleUser.username)
            ).rejects.toThrow(new UnauthorizedUserError());

            expect(UserDAO.prototype.getUserByUsername).not.toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {
        test("deleteUser deletes a specific user", async () => {
            const sampleUser: User = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                role: Role.CUSTOMER,
                address: "789 Maple St",
                birthdate: "1990-01-01",
            };

            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);

            const result = await userController.deleteUser(sampleUser, sampleUser.username);

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(sampleUser, sampleUser.username);
            expect(result).toBe(true);
        });
    });

    describe("deleteAll", () => {
        test("deleteAll deletes all non-Admin users", async () => {
            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);

            const result = await userController.deleteAll();

            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });
    });

    describe("updateUserInfo", () => {
        test("updateUserInfo updates user information and returns the updated user", async () => {
            const sampleUser: User = {
                username: "exampleUser",
                name: "Example",
                surname: "User",
                address: "789 Maple St",
                birthdate: "1990-01-01",
                role: Role.CUSTOMER,
            };

            const updatedUser: User = {
                username: "exampleUser",
                name: "UpdatedExample",
                surname: "User",
                address: "101 Pine St",
                birthdate: "1990-01-01",
                role: Role.CUSTOMER,
            };

            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(updatedUser);

            const result = await userController.updateUserInfo(
                sampleUser,
                updatedUser.name,
                updatedUser.surname,
                updatedUser.address,
                updatedUser.birthdate,
                updatedUser.username
            );

            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(
                sampleUser,
                updatedUser.name,
                updatedUser.surname,
                updatedUser.address,
                updatedUser.birthdate,
                updatedUser.username
            );
            expect(result).toEqual(updatedUser);
        });
    });
});
