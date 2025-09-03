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

// Models (prevent overwrite in Next.js hot reload)
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

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

export { User, Review, connectDB };