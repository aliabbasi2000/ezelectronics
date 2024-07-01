import db from "../db/db"
import { User } from "../components/user"
import crypto from "crypto"
import dayjs from "dayjs"
import { UserAlreadyExistsError, UserNotFoundError, UserNotAdminError, UserIsAdminError, UnauthorizedUserError,} from "../errors/userError";
import { error } from "console";

/**
 * A class that implements the interaction with the database for all user-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class UserDAO {

    /**
     * Checks whether the information provided during login (username and password) is correct.
     * @param username The username of the user.
     * @param plainPassword The password of the user (in plain text).
     * @returns A Promise that resolves to true if the user is authenticated, false otherwise.
     */
    getIsUserAuthenticated(
        username: string,
        plainPassword: string
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                /**
                 * Example of how to retrieve user information from a table that stores username, encrypted password and salt (encrypted set of 16 random bytes that ensures additional protection against dictionary attacks).
                 * Using the salt is not mandatory (while it is a good practice for security), however passwords MUST be hashed using a secure algorithm (e.g. scrypt, bcrypt, argon2).
                 */
                const sql = "SELECT username, password, salt FROM users WHERE username = ?"
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) reject(err)
                    //If there is no user with the given username, or the user salt is not saved in the database, the user is not authenticated.
                    if (!row || row.username !== username || !row.salt) {
                        resolve(false)
                    } else {
                        //Hashes the plain password using the salt and then compares it with the hashed password stored in the database
                        const hashedPassword = crypto.scryptSync(plainPassword, row.salt, 16)
                        const passwordHex = Buffer.from(row.password, "hex")
                        if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
                            resolve(false);
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Creates a new user and saves their information in the database
     * @param username The username of the user. It must be unique.
     * @param name The name of the user
     * @param surname The surname of the user
     * @param password The password of the user. It must be encrypted using a secure algorithm (e.g. scrypt, bcrypt, argon2)
     * @param role The role of the user. It must be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to true if the user has been created.
     */
    createUser(
        username: string,
        name: string,
        surname: string,
        password: string,
        role: string
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const salt = crypto.randomBytes(16);
                const hashedPassword = crypto.scryptSync(password, salt, 16);
                const sql =
                    "INSERT INTO users(username, name, surname, role, password, salt) VALUES(?, ?, ?, ?, ?, ?)";
                db.run(
                    sql,
                    [username, name, surname, role, hashedPassword, salt],
                    (err: Error | null) => {
                        if (err) {
                            if (
                                err.message.includes(
                                    "UNIQUE constraint failed: users.username"
                                )
                            )
                                reject(new UserAlreadyExistsError());
                            reject(err);
                        }
                        resolve(true);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns a user object from the database based on the username.
     * @param username The username of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
     */
    getUserByUsername(username: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM users WHERE username = ?";
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new UserNotFoundError());
                        return;
                    }
                    const user: User = new User(
                        row.username,
                        row.name,
                        row.surname,
                        row.role,
                        row.address,
                        row.birthdate
                    );
                    resolve(user);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns a user object from the database based on the role.
     * @param role The role of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
     */
    getUsersByRole(role: string): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM users WHERE role = ?";
                db.all(sql, [role], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // This method was sending an empty array so I used rows.length === O for testing...
                    if (!rows || rows.length === 0) {
                        reject(new UserNotFoundError());
                        return;
                    }
                    const users: User[] = rows.map(
                        (row) =>
                            new User(
                                row.username,
                                row.name,
                                row.surname,
                                row.role,
                                row.address,
                                row.birthdate
                            )
                    );
                    resolve(users);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns all user object from the database
     * @returns A Promise that resolves the information of the requested user
     */
    getUsers(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM users";
                db.all(sql, (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // This method was sending an empty array so I used rows.length === O for testing...
                    if (!rows || rows.length === 0) {
                        reject(new UserNotFoundError());
                        return;
                    }
                    const users: User[] = rows.map(
                        (row) =>
                            new User(
                                row.username,
                                row.name,
                                row.surname,
                                row.role,
                                row.address,
                                row.birthdate
                            )
                    );
                    resolve(users);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes a specific user
     * The function has different behavior depending on the role of the user calling it:
     * - Admins can delete any non-Admin user
     * - Other roles can only delete their own account
     * @param user - The user who makes the request.
     * @param username - The username of the user to delete. The user must exist.
     * @returns A Promise that resolves to true if the user has been deleted.
     */

    deleteUser(user: User, username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const userRoleQuery = "SELECT * FROM users WHERE username = ?";
                db.get(
                    userRoleQuery,
                    [username],
                    (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (!row) {
                            reject(new UserNotFoundError());
                            return;
                        }

                        const requestedUserRole = row.role;
                        const isSelf = user.username === username;

                        if (user.role === "Admin") {
                            if (requestedUserRole === "Admin" && !isSelf) {
                                reject(new UserIsAdminError());
                                return;
                            }
                        } else {
                            if (!isSelf) {
                                reject(new UserNotAdminError());
                                return;
                            }
                        }

                        const sql = "DELETE FROM users WHERE username = ?";
                        db.run(sql, [username], (err: Error | null) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(true);
                        });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes all non-Admin users
     * @returns A Promise that resolves to true if all non-Admin users have been deleted.
     */
    deleteAll() {
        return new Promise<boolean>((resolve, reject) => {
            try {
                db.serialize(() => {
                    db.run("PRAGMA foreign_keys = OFF");

                    const sql = "DELETE FROM users WHERE role <> ?";
                    db.run(sql, ["Admin"], (err: Error | null) => {
                        if (err) {
                            db.run("PRAGMA foreign_keys = ON");
                            reject(err);
                            return;
                        }

                        db.run("PRAGMA foreign_keys = ON");
                        resolve(true);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Updates the personal information of one user. The user can only update their own information.
     * @param user The user who wants to update their information
     * @param name The new name of the user
     * @param surname The new surname of the user
     * @param address The new address of the user
     * @param birthdate The new birthdate of the user
     * @param username The username of the user to update. It must be equal to the username of the user parameter.
     * @returns A Promise that resolves to the updated user
     */
    updateUserInfo(
        user: User,
        name: string,
        surname: string,
        address: string,
        birthdate: string,
        username: string
    ): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            try {
                const userQuery = "SELECT * FROM users WHERE username = ?";
                db.get(userQuery, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!row) {
                        reject(new UserNotFoundError());
                        return;
                    }

                    const requestedUserRole = row.role;
                    const isSelf = user.username === username;

                    if (user.role === "Admin") {
                        if (requestedUserRole === "Admin" && !isSelf) {
                            reject(new UnauthorizedUserError());
                            return;
                        }
                    } else {
                        if (!isSelf) {
                            reject(new UnauthorizedUserError());
                            return;
                        }
                    }

                    const birthdateObj = dayjs(birthdate);
                    if (
                        !birthdateObj.isValid() ||
                        birthdateObj.isAfter(dayjs())
                    ) {
                        // throwing error to reject promise and use this error in testing...
                        throw Error("Invalid birthdate");
                    }

                    const sql =
                        "UPDATE users SET name = ?, surname = ?, address = ?, birthdate = ? WHERE username = ?";
                    db.run(
                        sql,
                        [name, surname, address, birthdate, username],
                        (err: Error | null) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                        }
                    );

                    const updatedUserQuery =
                        "SELECT * FROM users WHERE username = ?";
                    db.get(
                        updatedUserQuery,
                        [username],
                        (err: Error | null, row: any) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            if (!row) {
                                reject(err);
                                return;
                            }
                            const user: User = new User(
                                row.username,
                                row.name,
                                row.surname,
                                row.role,
                                row.address,
                                row.birthdate
                            );
                            resolve(user);
                        }
                    );
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
export default UserDAO;
