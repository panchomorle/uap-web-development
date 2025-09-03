"use server"

import { connectDB, Review } from "../db/mongo";
import type { Types } from "mongoose";

export async function getReviews(bookId: string) {
  await connectDB();
  return await Review.find({ bookId }).populate("userId", "username").sort({ date: -1 });
}

export async function addReview({ bookId, rating, content, userId }: { bookId: string; rating: number; content: string; userId: Types.ObjectId }) {
  await connectDB();
  const review = await Review.create({ bookId, rating, content, userId });
  return review;
}

export async function upvoteReview(reviewId: string) {
  await connectDB();
  return await Review.findByIdAndUpdate(reviewId, { $inc: { upvotes: 1 } }, { new: true });
}

export async function downvoteReview(reviewId: string) {
  await connectDB();
  return await Review.findByIdAndUpdate(reviewId, { $inc: { downvotes: 1 } }, { new: true });
}

export async function deleteReview(reviewId: string, userId: Types.ObjectId) {
  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");
  if (!review.userId.equals(userId)) throw new Error("Unauthorized");
  await review.deleteOne();
  return true;
}
