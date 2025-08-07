import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // Sample product data for suggestions (you can move this to a separate file)
  const allProducts = [
    'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 14', 'iPad Pro', 'iPad Air',
    'Samsung Galaxy S24', 'Samsung Galaxy Note', 'Samsung Galaxy Watch',
    'Google Pixel 8', 'Google Pixel 7', 'Google Pixel Buds',
    'OnePlus 12', 'OnePlus 11', 'OnePlus Watch',
    'MacBook Pro 16"', 'MacBook Air', 'MacBook Pro 14"',
    'Dell XPS 13', 'Dell XPS 15', 'Dell Inspiron',
    'HP Spectre x360', 'HP Pavilion', 'HP EliteBook',
    'Lenovo ThinkPad X1', 'Lenovo ThinkPad T14', 'Lenovo IdeaPad',
    'Apple Watch Series 9', 'Apple Watch Ultra', 'Apple Watch SE',
    'Samsung Galaxy Watch 6', 'Samsung Galaxy Watch 5',
    'Garmin Forerunner 965', 'Garmin Fenix 7', 'Garmin Venu',
    'Fitbit Sense 2', 'Fitbit Charge 5', 'Fitbit Versa',
    'AirPods Pro 2', 'AirPods Max', 'AirPods 3rd Gen',
    'Sony WH-1000XM5', 'Sony WH-1000XM4', 'Sony WF-1000XM4',
    'Bose QuietComfort', 'Bose SoundLink', 'Bose Sport Earbuds',
    'Sennheiser HD 660S2', 'Sennheiser Momentum', 'Sennheiser PXC 550'
  ];

  const updateSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    
    // Update suggestions
    if (query.length > 0) {
      const filteredSuggestions = allProducts
        .filter(product => 
          product.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const setCategory = (category) => {
    setActiveCategory(category);
    setIsSearching(false);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const hideSuggestions = () => {
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setIsSearching(true);
    setShowSuggestions(false);
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      isSearching,
      suggestions,
      showSuggestions,
      activeCategory,
      updateSearch,
      clearSearch,
      setCategory,
      hideSuggestions,
      selectSuggestion
    }}>
      {children}
    </SearchContext.Provider>
  );
};
