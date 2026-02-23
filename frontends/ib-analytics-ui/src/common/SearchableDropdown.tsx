import React, { useEffect, useState } from 'react';
import { Input, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Loader from '../components/Loader';

interface SearchableDropdownProps {
  status: 'idle' | 'loading' | 'failed';
  selectedOptionsProps: any[];
  options: any[];
  multiple?: boolean;
  onSelect: (selected: any[] | any | null) => void;
  handleSearch: (search: any | null) => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ status, handleSearch, options, multiple = false, selectedOptionsProps, onSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<any[]>(selectedOptionsProps.length ? selectedOptionsProps : []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSearchLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };
  useEffect(() => {
    handleSearch(searchValue)
  }, [searchValue])
  useEffect(() => {
    setSelectedOptions(selectedOptionsProps)
  }, [selectedOptionsProps])

  const handleSelect = (option: any) => {
    if (multiple) {
      const alreadySelected = selectedOptions.find((item) => item.id === option.id);
      const newSelected = alreadySelected
        ? selectedOptions.filter((item) => item.id !== option.id)
        : [...selectedOptions, option];
      setSelectedOptions(newSelected);
      onSelect(newSelected);
    } else {
      setSelectedOptions([option]);
      onSelect(option);
      setDropdownOpen(false); // Close dropdown after single selection
    }
  };

  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase().includes(searchValue)
  );

  const isSelected = (option: any) =>
    selectedOptions.some((selected) => selected.id === option.id);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="searchable-dropdown bg-white">
      <DropdownToggle caret className='dropdown-item'>
        {multiple
          ? selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : 'Select One'
          : selectedOptions[0]?.label || 'Select...'}
      </DropdownToggle>
      <DropdownMenu>
        <div className="px-2 ">
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchLocal}
          />
        </div>
        {
          status === "loading" ? (
            <Loader />
          ) :
            filteredOptions.map((option) => (
              <DropdownItem
                key={option.id}
                toggle={false}
                onClick={() => handleSelect(option)}
                active={isSelected(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
        {filteredOptions.length === 0 && <DropdownItem disabled>No results found</DropdownItem>}
      </DropdownMenu>
    </Dropdown>
  );
};

export default SearchableDropdown;
