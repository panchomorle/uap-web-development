"use server"

import { connectDB, Favorite } from "../db/mongo";
import { revalidatePath } from "next/cache";
import { Types } from 'mongoose';

// Get all favorites for a user
export async function getUserFavorites(userId: string) {
  await connectDB();
  
  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.error("[getUserFavorites] Invalid userId:", userId);
      return [];
    }
    
    const favorites = await Favorite.find({ 
      userId: new Types.ObjectId(userId) 
    }).sort({ addedAt: -1 });
    
    // Convert Mongoose documents to plain objects
    return favorites.map(favorite => ({
      _id: favorite._id.toString(),
      userId: favorite.userId.toString(),
      bookId: favorite.bookId,
      title: favorite.title,
      authors: favorite.authors || [],
      thumbnail: favorite.thumbnail || "",
      addedAt: favorite.addedAt
    }));
  } catch (error) {
    console.error("[getUserFavorites] Error:", error);
    return [];
  }
}

// Add a book to favorites
export async function addFavorite({
  userId,
  bookId,
  title,
  authors,
  thumbnail
}: {
  userId: string;
  bookId: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}) {
  await connectDB();
  
  try {
    // Ensure userId is a string that can be converted to ObjectId
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.error("Invalid userId format:", userId);
      return { success: false, message: "Invalid user ID format" };
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({ 
      userId: new Types.ObjectId(userId),
      bookId 
    });
    
    if (existingFavorite) {
      return { success: true, message: "Book already in favorites", favorite: { 
        _id: existingFavorite._id.toString(),
        userId: existingFavorite.userId.toString(),
        bookId: existingFavorite.bookId,
        title: existingFavorite.title,
        authors: existingFavorite.authors,
        thumbnail: existingFavorite.thumbnail,
        addedAt: existingFavorite.addedAt
      }};
    }
    
    // Ensure thumbnail URL uses HTTPS if it exists
    let secureThumbail = thumbnail;
    if (thumbnail && thumbnail.startsWith('http:')) {
      secureThumbail = thumbnail.replace('http:', 'https:');
      console.log("[addFavorite] Converting thumbnail URL to HTTPS:", secureThumbail);
    }
    
    // Add to favorites
    const favorite = await Favorite.create({
      userId: new Types.ObjectId(userId),
      bookId,
      title,
      authors,
      thumbnail: secureThumbail,
      addedAt: new Date()
    });
    
    revalidatePath('/profile');
    revalidatePath(`/book/${bookId}`);
    
    // Return a serializable object rather than the Mongoose document
    return { 
      success: true, 
      message: "Book added to favorites", 
      favorite: {
        _id: favorite._id.toString(),
        userId: favorite.userId.toString(),
        bookId: favorite.bookId,
        title: favorite.title,
        authors: favorite.authors,
        thumbnail: favorite.thumbnail,
        addedAt: favorite.addedAt
      }
    };
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    return { success: false, message: error.message };
  }
}

// Remove a book from favorites
export async function removeFavorite(userId: string, bookId: string) {
  await connectDB();
  
  try {
    const result = await Favorite.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      bookId
    });
    
    if (!result) {
      return { success: false, message: "Favorite not found" };
    }
    
    revalidatePath('/profile');
    revalidatePath(`/book/${bookId}`);
    
    return { success: true, message: "Book removed from favorites" };
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return { success: false, message: error.message };
  }
}

// Check if a book is in user's favorites
export async function checkIsFavorite(userId: string, bookId: string) {
  if (!userId) {
    console.log("[checkIsFavorite] No userId provided");
    return false;
  }
  
  // Validate userId format
  if (typeof userId !== 'string' || userId.length !== 24) {
    console.error("[checkIsFavorite] Invalid userId format:", userId);
    return false;
  }
  
  await connectDB();
  
  try {
    console.log(`[checkIsFavorite] Checking if bookId ${bookId} is favorite for user ${userId}`);
    const favorite = await Favorite.findOne({
      userId: new Types.ObjectId(userId),
      bookId
    });
    
    console.log(`[checkIsFavorite] Result for ${bookId}: ${!!favorite}`);
    return !!favorite;
  } catch (error) {
    console.error("[checkIsFavorite] Error checking favorite status:", error);
    return false;
  }
}
