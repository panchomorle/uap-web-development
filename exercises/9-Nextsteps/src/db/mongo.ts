import mongoose, { Schema, Document } from 'mongoose';

if (process.env.MONGODB_URI === undefined) {
  throw new Error("No MongoDB secret found. Please set the MONGO_DB_SECRET environment variable.");
}

const uri = process.env.MONGODB_URI;

// User Interface
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Review Interface
interface IReview extends Document {
  bookId: string;
  rating: number;
  content: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  upvotes: number;
  downvotes: number;
  voters?: {
    upvoters: mongoose.Types.ObjectId[];
    downvoters: mongoose.Types.ObjectId[];
  };
}

// Favorite Book Interface
interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  addedAt: Date;
}

// User Schema
const userSchema: Schema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema: Schema = new Schema<IReview>({
  bookId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
});

// Review Schema with voter tracking
reviewSchema.add({
  voters: {
    upvoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvoters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }
});

// Favorite Schema
const favoriteSchema: Schema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: String, required: true },
  title: { type: String, required: true },
  authors: [{ type: String }],
  thumbnail: { type: String },
  addedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Models (prevent overwrite in Next.js hot reload)
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);

// MongoDB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: 'your_db_name',
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export { User, Review, Favorite, connectDB };