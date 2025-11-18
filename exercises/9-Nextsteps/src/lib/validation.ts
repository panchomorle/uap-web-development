import { User, Review } from '@/db/mongo';

/**
 * Validates user data for registration
 * @param userData User data to validate
 * @param checkDuplicates Whether to check for duplicate username/email
 * @returns Validation result with success flag and any errors
 */
export async function validateUserData(userData: any, checkDuplicates = false) {
  const errors = [];
  
  // Basic validation
  if (!userData.username || userData.username.trim() === '') {
    errors.push('Username is required');
  }
  
  if (!userData.email || userData.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Invalid email format');
  }
  
  if (!userData.password) {
    errors.push('Password is required');
  } else if (userData.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for duplicate username/email if requested
  if (checkDuplicates && errors.length === 0) {
    // Check if username exists
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      errors.push('Username already taken');
    }
    
    // Check if email exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      errors.push('Email already registered');
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Validates review data
 * @param reviewData Review data to validate
 * @param checkDuplicates Whether to check if the user has already reviewed this book
 * @returns Validation result with success flag and any errors
 */
export async function validateReviewData(reviewData: any, checkDuplicates = false) {
  const errors = [];
  
  // Basic validation
  if (!reviewData.bookId || reviewData.bookId.trim() === '') {
    errors.push('Book ID is required');
  }
  
  if (!reviewData.userId || reviewData.userId.trim() === '') {
    errors.push('User ID is required');
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (!reviewData.content || reviewData.content.trim() === '') {
    errors.push('Review content is required');
  }
  
  // Check for duplicate review if requested
  if (checkDuplicates && errors.length === 0) {
    const existingReview = await Review.findOne({
      bookId: reviewData.bookId,
      userId: reviewData.userId
    });
    
    if (existingReview) {
      errors.push('You have already reviewed this book');
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}
