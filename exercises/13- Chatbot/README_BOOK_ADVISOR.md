# AI Book Advisor - Implementation Guide 📚

This project has been successfully transformed from a basic chatbot into an **AI Book Advisor** with tool calling capabilities.

## What's New

### 6 Tool Calling Functions

The chatbot now has access to 6 specialized tools for book discovery and management:

1. **searchBooks** - Search Google Books API by title, author, subject, ISBN
2. **getBookDetails** - Get detailed information about a specific book
3. **addToReadingList** - Add books to user's "Want to Read" list
4. **getReadingList** - View books in the reading list
5. **markAsRead** - Mark books as read with optional rating/review
6. **getReadingStats** - View reading statistics and analytics

### In-Memory Database

A simple in-memory database (`lib/db.ts`) stores:
- Reading list items (books user wants to read)
- Books read (with ratings and reviews)
- User statistics and analytics

### Google Books API Integration

The app uses the free Google Books API (no API key required) to:
- Search for books
- Get book metadata (title, author, pages, ratings, cover images)
- Access 10+ million books in the catalog

## How to Use

### Example Conversations

**Search for books:**
```
User: "Recommend me science fiction books"
User: "Find novels by Gabriel García Márquez"
User: "I want to read about Roman history"
```

**Get book details:**
```
User: "Tell me more about Dune"
User: "Give me information about the first book"
```

**Manage reading list:**
```
User: "Add that book to my list"
User: "Show me my reading list"
User: "What books do I have with high priority?"
```

**Mark as read:**
```
User: "I finished reading 1984, I loved it, 5 stars"
User: "Mark Asimov's book as read"
```

**View statistics:**
```
User: "Show me my statistics"
User: "How many books have I read this month?"
User: "What's my favorite genre?"
```

## Technical Implementation

### Tool Calling with Vercel AI SDK

The chatbot uses the Vercel AI SDK's `streamText()` function with tool calling:

```typescript
const result = streamText({
  model: openrouter(model),
  messages: sanitizedMessages,
  tools,  // The 6 tools defined in lib/tools.ts
  system: `You are an AI Book Advisor...`,
});
```

### Frontend Integration

The frontend uses the `useChat` hook from `ai/react`:

```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  maxToolRoundtrips: 5,
});
```

This automatically handles:
- Message state management
- Streaming responses
- Tool invocations
- Loading states

### Google Books API Examples

The API supports various search queries:

- By title: `?q=harry+potter`
- By author: `?q=inauthor:rowling`
- By ISBN: `?q=isbn:9780439708180`
- By subject: `?q=subject:fiction`
- Combined: `?q=harry+potter+inauthor:rowling`

## File Structure

```
exercises/13- Chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # Updated with tool calling
│   ├── components/
│   │   └── ChatBot.tsx          # Updated with useChat hook
│   └── page.tsx                 # Updated title
├── lib/
│   ├── db.ts                    # NEW: In-memory database
│   └── tools.ts                 # NEW: 6 tool definitions
├── .env.local                   # Updated with Google Books URL
└── README_BOOK_ADVISOR.md       # This file
```

## Environment Variables

Updated `.env.local`:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your-key-here

# OpenRouter Configuration
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3-haiku

# Google Books API (free, no key required)
GOOGLE_BOOKS_API_KEY=https://www.googleapis.com/books/v1/volumes
```

## Testing the Implementation

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test book search:**
   - "Recommend me books about artificial intelligence"
   - Should trigger `searchBooks` tool

3. **Test book details:**
   - "Tell me more about the first book"
   - Should trigger `getBookDetails` tool

4. **Test reading list:**
   - "Add that book to my list"
   - Should trigger `addToReadingList` tool
   - "Show me my reading list"
   - Should trigger `getReadingList` tool

5. **Test marking as read:**
   - "I finished reading that book, 5 stars"
   - Should trigger `markAsRead` tool

6. **Test statistics:**
   - "Show me my reading statistics"
   - Should trigger `getReadingStats` tool

## Key Features

✅ **Conversational Interface** - Natural language book discovery  
✅ **Tool Calling** - LLM automatically executes appropriate tools  
✅ **Google Books Integration** - Access to millions of books  
✅ **Reading List Management** - Track books to read  
✅ **Reading Statistics** - Analytics on reading habits  
✅ **In-Memory Persistence** - Data persists during server session  
✅ **Security** - API keys never exposed to frontend  

## Future Enhancements

For production use, consider:

- [ ] Replace in-memory DB with PostgreSQL/MongoDB
- [ ] Add user authentication
- [ ] Implement data persistence across sessions
- [ ] Add book cover images display
- [ ] Create reading goals and challenges
- [ ] Export lists to Goodreads
- [ ] Add social features (share lists, recommendations)
- [ ] Implement caching for Google Books API calls

## Troubleshooting

### Tools not executing

Ensure:
1. Model supports tool calling (Claude 3 Haiku ✅)
2. Tools are properly imported in `route.ts`
3. Check console for tool execution logs

### Google Books API errors

- Check that `GOOGLE_BOOKS_API_KEY` is set to the full URL
- Verify internet connection
- Google Books API has rate limits (1000 req/day without key)

### TypeScript errors

If you see errors about the `ai` package:
```bash
npm install ai @ai-sdk/openai
```

## Resources

- [Vercel AI SDK - Tool Calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Google Books API Documentation](https://developers.google.com/books/docs/v1/using)
- [OpenRouter Documentation](https://openrouter.ai/docs)

---

**Built with**: Next.js 16, Vercel AI SDK, OpenRouter, Google Books API, TypeScript, Tailwind CSS
