import { vi } from 'vitest';
import mongoose from 'mongoose';
import { Types } from 'mongoose';

// Mock users data
export const mockUsers = [
  {
    _id: new Types.ObjectId('000000000000000000000001'),
    username: 'testuser1',
    email: 'user1@test.com',
    password: '$2a$10$XH0t0rkTy7MBT2F2f3inXuM0.pPdZSvQwZTGVTLHJXHCXGvTJoIqi', // hashed 'password123'
    createdAt: new Date('2025-01-01')
  },
  {
    _id: new Types.ObjectId('000000000000000000000002'),
    username: 'testuser2',
    email: 'user2@test.com',
    password: '$2a$10$XH0t0rkTy7MBT2F2f3inXuM0.pPdZSvQwZTGVTLHJXHCXGvTJoIqi', // hashed 'password123'
    createdAt: new Date('2025-01-02')
  }
];

// Mock reviews data
export const mockReviews = [
  {
    _id: new Types.ObjectId('000000000000000000000011'),
    bookId: 'book1',
    rating: 4,
    content: 'Great book!',
    userId: new Types.ObjectId('000000000000000000000001'),
    date: new Date('2025-02-01'),
    upvotes: 2,
    downvotes: 0,
    voters: {
      upvoters: [
        new Types.ObjectId('000000000000000000000002')
      ],
      downvoters: []
    }
  },
  {
    _id: new Types.ObjectId('000000000000000000000012'),
    bookId: 'book1',
    rating: 3,
    content: 'Pretty good.',
    userId: new Types.ObjectId('000000000000000000000002'),
    date: new Date('2025-02-02'),
    upvotes: 1,
    downvotes: 1,
    voters: {
      upvoters: [
        new Types.ObjectId('000000000000000000000001')
      ],
      downvoters: [
        new Types.ObjectId('000000000000000000000003')
      ]
    }
  }
];

// Mock favorites data
export const mockFavorites = [
  {
    _id: new Types.ObjectId('000000000000000000000021'),
    userId: new Types.ObjectId('000000000000000000000001'),
    bookId: 'book1',
    title: 'Test Book 1',
    authors: ['Author 1'],
    thumbnail: 'https://example.com/thumb1.jpg',
    addedAt: new Date('2025-03-01')
  },
  {
    _id: new Types.ObjectId('000000000000000000000022'),
    userId: new Types.ObjectId('000000000000000000000002'),
    bookId: 'book2',
    title: 'Test Book 2',
    authors: ['Author 2'],
    thumbnail: 'https://example.com/thumb2.jpg',
    addedAt: new Date('2025-03-02')
  }
];

// Mock mongoose models
export const mockUserModel = {
  find: vi.fn(),
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findOneAndDelete: vi.fn()
};

export const mockReviewModel = {
  find: vi.fn(),
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findOneAndDelete: vi.fn(),
  populate: vi.fn().mockReturnThis(), // For chaining
  sort: vi.fn().mockReturnThis() // For chaining
};

export const mockFavoriteModel = {
  find: vi.fn(),
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findOneAndDelete: vi.fn(),
  sort: vi.fn().mockReturnThis() // For chaining
};

// Mock mongoose connection
export const mockConnect = vi.fn().mockResolvedValue({
  connection: {
    readyState: 1
  }
});

// Mock mongoose instance
export const mockMongoose = {
  connect: mockConnect,
  connection: {
    readyState: 1
  },
  model: vi.fn().mockImplementation((modelName) => {
    if (modelName === 'User') return mockUserModel;
    if (modelName === 'Review') return mockReviewModel;
    if (modelName === 'Favorite') return mockFavoriteModel;
    return {};
  }),
  models: {
    User: mockUserModel,
    Review: mockReviewModel,
    Favorite: mockFavoriteModel
  }
};

// Setup function to mock mongoose
export function setupMongooseMock() {
  vi.mock('mongoose', () => {
    return {
      default: mockMongoose,
      connect: mockConnect,
      Schema: mongoose.Schema,
      model: mockMongoose.model,
      models: mockMongoose.models,
      Types: mongoose.Types
    };
  });

  // Reset mocks
  mockUserModel.find.mockReset();
  mockUserModel.findOne.mockReset();
  mockUserModel.findById.mockReset();
  mockUserModel.create.mockReset();

  mockReviewModel.find.mockReset();
  mockReviewModel.findOne.mockReset();
  mockReviewModel.findById.mockReset();
  mockReviewModel.create.mockReset();

  mockFavoriteModel.find.mockReset();
  mockFavoriteModel.findOne.mockReset();
  mockFavoriteModel.findById.mockReset();
  mockFavoriteModel.create.mockReset();

  // Setup common mock returns
  mockUserModel.find.mockResolvedValue(mockUsers);
  mockUserModel.findOne.mockImplementation((query) => {
    const user = mockUsers.find(u => {
      if (query.username) return u.username === query.username;
      if (query.email) return u.email === query.email;
      if (query._id) return u._id.toString() === query._id.toString();
      return false;
    });
    return Promise.resolve(user);
  });

  mockReviewModel.find.mockImplementation((query) => {
    const reviews = mockReviews.filter(r => {
      if (query.bookId) return r.bookId === query.bookId;
      if (query.userId) return r.userId.toString() === query.userId.toString();
      return true;
    });
    return {
      populate: () => ({
        sort: () => Promise.resolve(reviews)
      }),
      sort: () => Promise.resolve(reviews)
    };
  });

  mockFavoriteModel.find.mockImplementation((query) => {
    const favorites = mockFavorites.filter(f => {
      if (query.userId) return f.userId.toString() === query.userId.toString();
      if (query.bookId) return f.bookId === query.bookId;
      return true;
    });
    return {
      sort: () => Promise.resolve(favorites)
    };
  });
}

// Reset mocks function
export function resetMongooseMocks() {
  vi.resetAllMocks();
  setupMongooseMock();
}
