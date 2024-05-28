
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    static async findByUserAndModel(userId: number, model: string): Promise<ProductReview | null> {
        // Database query to find the review by user and product model
        // Example using a hypothetical database method:
        return await database.query('SELECT * FROM reviews WHERE userId = ? AND model = ?', [userId, model]);
    }

    static async addReview(review: ProductReview): Promise<void> {
        // Database query to add a new review
        // Example using a hypothetical database method:
        await database.query('INSERT INTO reviews (model, userId, score, comment, date) VALUES (?, ?, ?, ?, ?)', 
                             [review.model, review.userId, review.score, review.comment, review.date]);
    }
    static async findByModel(model: string): Promise<ProductReview[]> {
        return await database.query('SELECT * FROM reviews WHERE model = ?', [model]);
    }
    static async findByUserAndModel(userId: number, model: string): Promise<ProductReview | null> {
        return await database.query('SELECT * FROM reviews WHERE userId = ? AND model = ?', [userId, model]);
    }

    static async deleteReview(userId: number, model: string): Promise<void> {
        await database.query('DELETE FROM reviews WHERE userId = ? AND model = ?', [userId, model]);
    }
}
export default ReviewDAO;