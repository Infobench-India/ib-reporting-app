import React, { useState, useEffect } from 'react';
interface GlobalSearchProps {
    data: any[];
    setFilteredData:(arg:any)=>void;
}
const GlobalSearch: React.FC<GlobalSearchProps> = ({ data,setFilteredData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // // Perform filtering logic based on the search term
    // if(!searchTerm)
    // {
    //   setFilteredData(data);
    //   return
    // }
    // const filteredResults = data.filter((row) =>
    //   Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    // );

    setFilteredData(searchTerm);
  }, [searchTerm]);

  return (
    <div className="mb-3 me-3" style={{ width: '300px' }}>
  <div className="input-group input-group-lg">
    <span className="input-group-text" id="searchIcon">
      <i className="bi bi-search"></i>
    </span>
    <input
      type="text"
      className="form-control"
      style={{ border:'1px solid #A9A9A9' }}
      placeholder="Search..."
      aria-describedby="searchIcon"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</div>
  );
};

export default GlobalSearch;
