// Test file for SearchBar component
// This file demonstrates how to use the SearchBar component

import React from 'react';
import { api } from '@/lib/api';
import SearchBar from '@/components/dashboard/search-bar';

// Mock component to test the search bar
const SearchBarTestPage = () => {
  const handleTaskSelect = (task: any) => {
    console.log('Selected task:', task);
    // Handle task selection
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search Bar Test</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Search Tasks</h2>
        <SearchBar onSelect={handleTaskSelect} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Glassmorphism design</li>
            <li>Animated results dropdown</li>
            <li>Search as you type</li>
            <li>Keyboard navigation (↑↓ arrows)</li>
            <li>Framer Motion animations</li>
            <li>Responsive design</li>
            <li>Loading states</li>
            <li>Accessibility attributes</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Type in the search box to search tasks</li>
            <li>Use arrow keys to navigate results</li>
            <li>Press Enter to select highlighted task</li>
            <li>Click on any result to select it</li>
            <li>Press Escape to close dropdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchBarTestPage;