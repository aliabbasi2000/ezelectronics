import db from "../db/db"
import dayjs from "dayjs"
import { User } from "../components/user"
import { ProductReview } from "../components/review"
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError"
import { ProductNotFoundError } from "../errors/productError"
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {

  /**
  * Adds a new review for a product
  * @param model The model of the product to review
  * @param user The username of the user who made the review
  * @param score The score assigned to the product, in the range [1, 5]
  * @param comment The comment made by the user
  * @returns A Promise that resolves to nothing
  */
  addReview(model: string, user: User, score: number, comment: string) /**:Promise<void> */ {
    return new Promise<void>((resolve, reject) => {
      try {
        const checkReviewSql = "SELECT COUNT(*) as count FROM ProductReview WHERE product_model = ? AND user = ?"
        db.get(checkReviewSql, [model, user.username], (err: Error | null, row: any) => {
          if (err) {
            reject(err)
            return
          }
          if (row.count > 0) {
            reject(new ExistingReviewError);
            return
          }
        })
        const now = dayjs().format('YYYY-MM-DD')
        const sql = "INSERT INTO ProductReview(product_model, user, score, date, comment) VALUES(? ? ? ? ?)"
        db.run(sql, [model, user.username, score, now, comment], (err: Error | null) => {
          if (err) {
            if (err)
              reject(err)
              return
          }
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
  * Returns all reviews for a product
  * @param model The model of the product to get reviews from
  * @returns A Promise that resolves to an array of ProductReview objects
  */
  getProductReviews(model: string): Promise<ProductReview[]> {
    return new Promise<ProductReview[]>((resolve, reject) => {
      try {
        const sql = "SELECT * FROM ProductReview"
        db.all(sql, (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err)
            return
          }
          if (!rows) {
            reject(new NoReviewProductError())
            return
          }
          const reviews: ProductReview[] = rows.map(row => new ProductReview(row.ProductReview, row.user, row.score, row.date, row.comment))
          resolve(reviews)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
  * Deletes the review made by a user for a product
  * @param model The model of the product to delete the review from
  * @param user The user who made the review to delete
  * @returns A Promise that resolves to nothing
  */
  deleteReview(model: string, user: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const checkProductSql = "SELECT * FROM products where model = ?"
        db.get(checkProductSql, [model], (err: Error | null, row: any) =>{
          if (err) {
            reject(err)
            return
          }
          if (!row) {
            reject(new ProductNotFoundError)
            return
          }
        })

        const checkReviewSql = "SELECT * FROM ProductReview WHERE product_model = ? AND user = ?"
        db.get(checkReviewSql, [model, user.username], (err: Error | null, row: any) => {
          if (err) {
            reject(err)
            return
          }
          if (!row) {
            reject(new NoReviewProductError)
            return
          }
        })

        const sql = "DELETE FROM ProductReview WHERE product_model = ? AND user = ?"
        db.run(sql, [model, user.username], (err: Error | null) => {
          if (err) {
            reject(err)
            return
        }
        resolve()
        })
      } catch(error){
        reject(error)
      }
    })
   }

  /**
  * Deletes all reviews for a product
  * @param model The model of the product to delete the reviews from
  * @returns A Promise that resolves to nothing
  */
  deleteReviewsOfProduct(model: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const checkProductSql = "SELECT * FROM products where model = ?"
        db.get(checkProductSql, [model], (err: Error | null, row: any) =>{
          if (err) {
            reject(err)
            return
          }
          if (!row) {
            reject(new ProductNotFoundError)
            return
          }
        })
        
        const sql = "DELETE FROM ProductReview WHERE product_model = ?"
        db.run(sql, [model], (err: Error | null) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
  * Deletes all reviews of all products
  * @returns A Promise that resolves to nothing
  */
  deleteAllReviews():Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql = "DELETE FROM ProductReview"
        db.run(sql, (err: Error | null) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
   }
}

export default ReviewDAO;