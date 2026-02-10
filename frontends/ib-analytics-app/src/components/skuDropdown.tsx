

import { useState, useMemo, useEffect } from 'react';
import SKUService from '../redux/features/apis/SKUAPI';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { ConnectedProps, connect } from 'react-redux';
import SearchableDropdown from '../common/SearchableDropdown';

interface IskuDropdownProps {
  selectedOptionsProps: any[];
  onSelect: (selected: any[] | any | null) => void;
}

const SkuDropdown: React.FC<IskuDropdownProps> = ({selectedOptionsProps, onSelect }) => {
const allSKU = useAppSelector((state: RootState) => state.skudatasReducer.data?.docs);
const isLoading = useAppSelector((state: RootState) => state.skudatasReducer.loading);
const dispatch = useAppDispatch()
  const [search,setSearch] =useState('')
  useEffect(() => {
    console.log("search",search)
    if (search)
      dispatch(SKUService.search({q:search}))
      else
      dispatch(SKUService.getAll({ page : 1, limit :10, sort:"updatedAt" }))
  }, [search])

  function transformData(input: any) {
    // Map over the 'docs' array to create the new format
    const transformedDocs = input.map((doc:any) => {
      return {
        ...doc,
        label: doc.sku,
      };
    });
  
    // Return the transformed object with the necessary pagination info
    return transformedDocs;
  }
  
  return (
    <>
      <div className="form-control">
        {
          <SearchableDropdown status={isLoading} handleSearch={setSearch} selectedOptionsProps={selectedOptionsProps ? transformData(selectedOptionsProps) : []} options={allSKU ? transformData(allSKU) : []} multiple={false} onSelect={onSelect} />
        }
      </div></>
  );
};
// Connect the component to Redux
export default SkuDropdown;

