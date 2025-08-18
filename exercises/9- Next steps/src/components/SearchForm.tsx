'use client';

import { useFormStatus } from 'react-dom';
import { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
    >
      {pending ? 'Searching...' : 'Search'}
    </button>
  );
}

export default function SearchForm({ onSearch, defaultValue = "" }: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (formData: FormData) => {
    const searchQuery = formData.get('query') as string;
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form action={handleSubmit} className="flex">
        <input
          type="text"
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books by title, author, or ISBN..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <SubmitButton />
      </form>
      <div className="mt-2 text-sm text-gray-600">
        <p>Try searching for: "Harry Potter", "Stephen King", or "ISBN:9780439708180"</p>
      </div>
    </div>
  );
}
