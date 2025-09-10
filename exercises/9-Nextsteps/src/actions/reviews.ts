"use server"

import { connectDB, Review } from "../db/mongo";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

export async function getReviews(bookId: string) {
  await connectDB();
  
  try {
    const reviews = await Review.find({ bookId })
      .populate("userId", "username")
      .sort({ date: -1 });
    
    // Convert Mongoose documents to plain objects
    return reviews.map(review => {
      // Get the populated user data
      const populatedUser = review.userId as any; // Using any since it's a populated document
      
      return {
        _id: review._id.toString(),
        // Handle populated user differently
        userId: typeof populatedUser === 'object' && populatedUser !== null 
          ? {
              _id: populatedUser._id.toString(),
              username: populatedUser.username
            }
          : review.userId.toString(),
        bookId: review.bookId,
        rating: review.rating,
        content: review.content,
        date: review.date,
        upvotes: review.upvotes,
        downvotes: review.downvotes,
        // Handle voters if they exist
        voters: review.voters ? {
          upvoters: review.voters.upvoters?.map((id: Types.ObjectId) => id.toString()) || [],
          downvoters: review.voters.downvoters?.map((id: Types.ObjectId) => id.toString()) || []
        } : {
          upvoters: [],
          downvoters: []
        }
      };
    });
  } catch (error) {
    console.error("[getReviews] Error:", error);
    return [];
  }
}

export async function getUserReviews(userId: string) {
  await connectDB();
  
  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.error("[getUserReviews] Invalid userId:", userId);
      return [];
    }
    
    const reviews = await Review.find({ 
      userId: new Types.ObjectId(userId) 
    }).sort({ date: -1 });
    
    // Convert Mongoose documents to plain objects
    return reviews.map(review => ({
      _id: review._id.toString(),
      userId: review.userId.toString(),
      bookId: review.bookId,
      rating: review.rating,
      content: review.content,
      date: review.date,
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      // Handle voters if they exist
      voters: review.voters ? {
        upvoters: review.voters.upvoters?.map((id: Types.ObjectId) => id.toString()) || [],
        downvoters: review.voters.downvoters?.map((id: Types.ObjectId) => id.toString()) || []
      } : {
        upvoters: [],
        downvoters: []
      }
    }));
  } catch (error) {
    console.error("[getUserReviews] Error:", error);
    return [];
  }
}

export async function addReview({ bookId, rating, content, userId }: { bookId: string; rating: number; content: string; userId: Types.ObjectId | string }) {
  await connectDB();
  
  try {
    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const review = await Review.create({ 
      bookId, 
      rating, 
      content, 
      userId: userObjectId,
      date: new Date(),
      upvotes: 0,
      downvotes: 0,
      voters: {
        upvoters: [],
        downvoters: []
      }
    });
    
    revalidatePath(`/book/${bookId}`);
    revalidatePath('/profile');
    
    // Return a plain object
    return {
      _id: review._id.toString(),
      userId: review.userId.toString(),
      bookId: review.bookId,
      rating: review.rating,
      content: review.content,
      date: review.date,
      upvotes: review.upvotes,
      downvotes: review.downvotes
    };
  } catch (error) {
    console.error("[addReview] Error:", error);
    throw error; // Re-throw to allow the client to handle the error
  }
}

export async function upvoteReview(reviewId: string, userId: string) {
  if (!userId) {
    throw new Error("Authentication required to vote");
  }
  
  await connectDB();
  
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");
  
  const userObjectId = new Types.ObjectId(userId);
  
  // Check if user has already voted
  const hasUpvoted = review.voters?.upvoters.some((voter: Types.ObjectId) => voter.equals(userObjectId));
  const hasDownvoted = review.voters?.downvoters.some((voter: Types.ObjectId) => voter.equals(userObjectId));

  let updatedReview;
  
  // If already upvoted, remove the upvote (toggle behavior)
  if (hasUpvoted) {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { upvotes: -1 },
        $pull: { "voters.upvoters": userObjectId }
      },
      { new: true }
    );
  }
  // If previously downvoted, remove downvote and add upvote
  else if (hasDownvoted) {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { upvotes: 1, downvotes: -1 },
        $pull: { "voters.downvoters": userObjectId },
        $push: { "voters.upvoters": userObjectId }
      },
      { new: true }
    );
  }
  // Otherwise add a new upvote
  else {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { upvotes: 1 },
        $push: { "voters.upvoters": userObjectId }
      },
      { new: true }
    );
  }
  
  // Convert Mongoose document to a plain object
  return updatedReview ? {
    _id: updatedReview._id.toString(),
    userId: typeof updatedReview.userId === 'object' ? updatedReview.userId.toString() : updatedReview.userId,
    bookId: updatedReview.bookId,
    rating: updatedReview.rating,
    content: updatedReview.content,
    date: updatedReview.date,
    upvotes: updatedReview.upvotes,
    downvotes: updatedReview.downvotes,
    voters: updatedReview.voters ? {
      upvoters: updatedReview.voters.upvoters?.map((id: Types.ObjectId) => id.toString()) || [],
      downvoters: updatedReview.voters.downvoters?.map((id: Types.ObjectId) => id.toString()) || []
    } : { upvoters: [], downvoters: [] }
  } : null;
}

export async function downvoteReview(reviewId: string, userId: string) {
  if (!userId) {
    throw new Error("Authentication required to vote");
  }
  
  await connectDB();
  
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");
  
  const userObjectId = new Types.ObjectId(userId);
  
  // Check if user has already voted
  const hasUpvoted = review.voters?.upvoters.some((voter: Types.ObjectId) => voter.equals(userObjectId));
  const hasDownvoted = review.voters?.downvoters.some((voter: Types.ObjectId) => voter.equals(userObjectId));
  
  let updatedReview;
  
  // If already downvoted, remove the downvote (toggle behavior)
  if (hasDownvoted) {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { downvotes: -1 },
        $pull: { "voters.downvoters": userObjectId }
      },
      { new: true }
    );
  }
  // If previously upvoted, remove upvote and add downvote
  else if (hasUpvoted) {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { upvotes: -1, downvotes: 1 },
        $pull: { "voters.upvoters": userObjectId },
        $push: { "voters.downvoters": userObjectId }
      },
      { new: true }
    );
  }
  // Otherwise add a new downvote
  else {
    updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { downvotes: 1 },
        $push: { "voters.downvoters": userObjectId }
      },
      { new: true }
    );
  }
  
  // Convert Mongoose document to a plain object
  return updatedReview ? {
    _id: updatedReview._id.toString(),
    userId: typeof updatedReview.userId === 'object' ? updatedReview.userId.toString() : updatedReview.userId,
    bookId: updatedReview.bookId,
    rating: updatedReview.rating,
    content: updatedReview.content,
    date: updatedReview.date,
    upvotes: updatedReview.upvotes,
    downvotes: updatedReview.downvotes,
    voters: updatedReview.voters ? {
      upvoters: updatedReview.voters.upvoters?.map((id: Types.ObjectId) => id.toString()) || [],
      downvoters: updatedReview.voters.downvoters?.map((id: Types.ObjectId) => id.toString()) || []
    } : { upvoters: [], downvoters: [] }
  } : null;
}

export async function deleteReview(reviewId: string, userId: string) {
  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");
  if (!review.userId.equals(new Types.ObjectId(userId))) throw new Error("Unauthorized");
  
  await review.deleteOne();
  revalidatePath(`/book/${review.bookId}`);
  revalidatePath('/profile');
  
  return true;
}
