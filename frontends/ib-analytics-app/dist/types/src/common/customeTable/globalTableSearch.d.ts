import React from 'react';
interface GlobalSearchProps {
    data: any[];
    setFilteredData: (arg: any) => void;
}
declare const GlobalSearch: React.FC<GlobalSearchProps>;
export default GlobalSearch;
