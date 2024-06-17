import { User } from "../components/user"
import UserDAO from "../dao/userDAO"
import { UserNotFoundError, UserNotManagerError, UserNotCustomerError, UserAlreadyExistsError, UserNotAdminError, UserIsAdminError, UnauthorizedUserError } from "../errors/userError";

/**
 * Represents a controller for managing users.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class UserController {
    private dao: UserDAO

    constructor() {
        this.dao = new UserDAO
    }

    /**
     * Creates a new user.
     * @param username - The username of the new user. It must not be null and it must not be already taken.
     * @param name - The name of the new user. It must not be null.
     * @param surname - The surname of the new user. It must not be null.
     * @param password - The password of the new user. It must not be null.
     * @param role - The role of the new user. It must not be null and it can only be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to true if the user has been created.
     */


    async createUser(username: string, name: string, surname: string, password: string, role: string) :Promise<Boolean> {
        const ret: any = await this.dao.createUser(username, name, surname, password, role)
        return ret

    }

  

    /**
     * Returns all users.
     * @returns A Promise that resolves to an array of users.
     */

    async getUsers(): Promise<any[]> {
        const users = await this.dao.getUsers();
        return users;
    }



    /**
     * Returns all users with a specific role.
     * @param role - The role of the users to retrieve. It can only be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to an array of users with the specified role.
     */
    async getUsersByRole(role: string) :Promise<User[]> {
        const users = await this.dao.getUsersByRole(role);
        return users;
     }




    /**
     * Returns a specific user.
     * The function has different behavior depending on the role of the user calling it:
     * - Admins can retrieve any user
     * - Other roles can only retrieve their own information
     * @param username - The username of the user to retrieve. The user must exist.
     * @returns A Promise that resolves to the user with the specified username.
     */

    // async getUserByUsername(user: User, username: string) :Promise<User> {
    //     const user = await this.dao.getUserByUsername(username);
    //     return user;
    //  }

    async getUserByUsername(user: User, username: string): Promise<User> {

        if (user.role !== "Admin" && user.username !== username) {
            throw new UnauthorizedUserError();
        }
        const ret = await this.dao.getUserByUsername(username)
        return ret;
    }



    /**
     * Deletes a specific user
     * The function has different behavior depending on the role of the user calling it:
     * - Admins can delete any non-Admin user
     * - Other roles can only delete their own account
     * @param username - The username of the user to delete. The user must exist.
     * @returns A Promise that resolves to true if the user has been deleted.
     */
    async deleteUser(user: User, username: string): Promise<boolean> {
        const userToDelete = await this.dao.getUserByUsername(username);

        // Check if the user exists
        if (!userToDelete) {
            throw new UserNotFoundError();
        }

        // Admins can delete any non-Admin user and themselves, but not other Admins
        if (user.role === 'Admin') {
            if (userToDelete.role === 'Admin' && user.username !== username) {
                throw new UserNotAdminError();
            }
        } else {
            // Other roles can only delete their own account
            if (user.username !== username) {
                throw new UnauthorizedUserError();
            }
        }

        // Delete the user
        const ret = await this.dao.deleteUser(username);
        return ret;
    }




    /**
     * Deletes all non-Admin users from the database.
     * Can only be called by a logged in user whose role is Admin.
     * @param user - The user making the request.
     * @returns A Promise that resolves to true if the operation was successful.
     */
    async deleteAll(): Promise<boolean> {

        // Delete all non-Admin users
        const result = await this.dao.deleteAll();
        return result;
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
    async updateUserInfo(user: User, name: string, surname: string, address: string, birthdate: string, username: string): Promise<User> {
        // Check if the username corresponds to the logged-in user or the user is an Admin
        if (user.role !== 'Admin' && user.username !== username) {
            throw new UnauthorizedUserError();
        }

        // Validate birthdate (it should not be in the future)
        const birthdateObj = new Date(birthdate);
        if (birthdateObj > new Date()) {
            throw new Error("Birthdate cannot be in the future"); // Consider creating a custom error for this
        }

        // Admins can update any non-Admin user; other roles can only update their own information
        if (user.role === 'Admin') {
            const targetUser = await this.dao.getUserByUsername(username);
            if (targetUser.role === 'Admin' && user.username !== username) {
                throw new UnauthorizedUserError(); // Admins cannot update other Admins
            }
        }

        const updatedUser = await this.dao.updateUserInfo(username, name, surname, address, birthdate);
        return updatedUser;
    }


}

export default UserController