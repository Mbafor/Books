import React from "react";

// Define the props expected by the SearchBar component
interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

// Functional React component for the search input field
const SearchBar: React.FC<Props> = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      className="search-bar" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
    />
  );
};

// Export the component so it can be reused elsewhere
export default SearchBar;
