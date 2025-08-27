# Unit Testing Guide for Book Discovery Platform

## Overview

This project implements comprehensive unit testing using **Vitest** and **Testing Library** as specified in the requirements. The testing strategy covers all business logic with edge cases and clearly distinguishes between what should be mocked and what should be tested directly.

## Testing Stack

- **Vitest**: Modern, fast test runner with TypeScript support
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Additional DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **MSW (Mock Service Worker)**: API mocking for realistic tests
- **@vitest/coverage-v8**: Code coverage reporting

## Test Structure

### 1. Business Logic Tests (`src/test/`)

#### Database Operations (`database.test.ts`)
**What's tested directly:**
- Review creation and storage
- Vote counting logic
- Average rating calculations
- Data retrieval and filtering

**Why not mocked:** These are core business logic functions that need to be tested with real implementations to ensure data integrity.

**Edge cases covered:**
- Empty datasets
- Single vs. multiple reviews
- Boundary values (min/max ratings)
- Invalid inputs (non-existent books/reviews)
- Concurrent operations

#### API Actions (`actions.test.ts`)
**What's mocked:**
- `fetch` function - External API calls to Google Books
- Network responses (success, failure, malformed data)

**Why mocked:** External API calls are unreliable, slow, and cost money. We test our error handling and data transformation logic instead.

**What's tested directly:**
- Error handling logic
- Data transformation
- URL construction
- Response parsing

**Edge cases covered:**
- Network failures
- HTTP error codes (404, 500)
- Malformed JSON responses
- Special characters in queries
- Empty/invalid search terms

#### Review Utilities (`reviewUtils.test.ts`)
**What's tested directly:**
- Review scoring algorithms
- Sorting logic
- Validation functions
- Date formatting
- Statistical calculations

**Why not mocked:** These are pure functions with deterministic outputs that form the core business logic.

**Edge cases covered:**
- Empty inputs
- Boundary values
- Invalid data types
- Time zone handling
- Spam detection patterns

### 2. Component Tests (`src/test/components/`)

#### React Components (`StarRating.test.tsx`)
**What's mocked:**
- User interaction callbacks (`onRatingChange`)
- Time-sensitive operations (when needed)

**What's tested directly:**
- Rendering logic
- State management
- User interactions
- Accessibility features
- Visual states

**Edge cases covered:**
- Interactive vs. non-interactive modes
- Different sizes and configurations
- Invalid rating values
- Rapid user interactions
- Component lifecycle

### 3. Integration Tests (`integration.test.ts`)

**What's tested:**
- Complete user workflows
- Data flow between components
- API + Business Logic integration
- Error propagation
- Performance under load

**What's mocked:**
- External APIs only (Google Books)

**What's tested directly:**
- All internal business logic interactions
- Data consistency across operations
- Error handling chains

## Testing Guidelines

### What to Mock

1. **External Dependencies**
   - API calls (`fetch` to Google Books API)
   - File system operations
   - Date/time when testing time-sensitive logic
   - Browser APIs (localStorage, etc.)

2. **Expensive Operations**
   - Network requests
   - Database connections (if using real DB)
   - Large data processing

3. **Non-deterministic Behavior**
   - Random number generation
   - Current timestamp
   - User input timing

### What NOT to Mock

1. **Business Logic Functions**
   - Review calculations
   - Validation functions
   - Sorting algorithms
   - Data transformations

2. **Internal State Management**
   - Component state
   - Internal data structures
   - Pure functions

3. **Testing Utilities**
   - Testing Library functions
   - Vitest assertions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:dev

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Coverage Goals

- **Overall Coverage**: 90%+
- **Business Logic**: 100%
- **API Functions**: 95%+
- **Components**: 85%+

## Test Categories

### Unit Tests
- Test individual functions/components in isolation
- Fast execution (< 1ms per test)
- No external dependencies

### Integration Tests
- Test multiple components working together
- Moderate execution time (< 100ms per test)
- May use mocked external services

### Edge Case Tests
- Boundary conditions
- Error conditions
- Unusual but valid inputs
- Performance under load

## Best Practices

1. **Test Naming**: Use descriptive names that explain the scenario
   ```typescript
   it('should return empty array for book with no reviews')
   it('should handle network errors gracefully')
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should calculate correct average rating', () => {
     // Arrange
     const reviews = [/* test data */]
     
     // Act
     const average = calculateAverageRating(reviews)
     
     // Assert
     expect(average).toBe(expectedValue)
   })
   ```

3. **Test Data**: Use realistic but minimal test data
4. **Cleanup**: Reset state between tests when needed
5. **Async Testing**: Properly handle promises and async operations

## Mock Strategy

### API Mocking with MSW
```typescript
// Mock successful API response
export const handlers = [
  http.get('https://www.googleapis.com/books/v1/volumes', () => {
    return HttpResponse.json(mockBooksResponse)
  })
]
```

### Function Mocking with Vitest
```typescript
// Mock specific functions
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock return values
mockFetch.mockResolvedValue({ ok: true, json: () => mockData })
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Before deployment

## Debugging Tests

1. Use `test.only()` to run specific tests
2. Add `console.log()` for debugging (remove before commit)
3. Use VS Code debugger with breakpoints
4. Check coverage reports for missed cases

## Future Improvements

1. **Visual Regression Testing**: For UI components
2. **E2E Testing**: With Playwright for critical user journeys
3. **Performance Testing**: Automated performance benchmarks
4. **Mutation Testing**: To verify test quality

---

This testing strategy ensures comprehensive coverage of all business logic while maintaining fast, reliable tests that provide confidence in the application's correctness.
