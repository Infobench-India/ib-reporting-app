import React from 'react';
interface SearchableDropdownProps {
    status: 'idle' | 'loading' | 'failed';
    selectedOptionsProps: any[];
    options: any[];
    multiple?: boolean;
    onSelect: (selected: any[] | any | null) => void;
    handleSearch: (search: any | null) => void;
}
declare const SearchableDropdown: React.FC<SearchableDropdownProps>;
export default SearchableDropdown;
