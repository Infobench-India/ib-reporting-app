

import { useState, useMemo, useEffect } from 'react';
import ShiftService from '../redux/features/apis/shiftAPI';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { ConnectedProps, connect } from 'react-redux';
import SearchableDropdown from '../common/SearchableDropdown';

interface IshiftDropdownProps {
  selectedOptionsProps: any[];
  onSelect: (selected: any[] | any | null) => void;
}

const ShiftDropdown: React.FC<IshiftDropdownProps> = ({selectedOptionsProps, onSelect }) => {
const allShift = useAppSelector((state: RootState) => state.shiftReducer.data?.docs);
const isLoading = useAppSelector((state: RootState) => state.shiftReducer.loading);
const dispatch = useAppDispatch()
  const [search,setSearch] =useState('')
  useEffect(() => {
    console.log("search",search)
    // if (search)
    //   dispatch(ShiftService.search({q:search}))
    //   else
      dispatch(ShiftService.getAll({ page : 1, limit :10, sort:"updatedAt" }))
  }, [])

  function transformData(input: any) {
    if (!Array.isArray(input)) {
      input = [input]
    }
    // Map over the 'docs' array to create the new format
    const transformedDocs = input.map((doc:any) => {
      return {
        ...doc,
        label: doc.name,
      };
    });
    // Return the transformed object with the necessary pagination info
    return transformedDocs;
  }
  
  return (
    <>
      <div className="form-control">
        {
          <SearchableDropdown status={isLoading} handleSearch={setSearch} selectedOptionsProps={selectedOptionsProps ? transformData(selectedOptionsProps) : []} options={allShift ? transformData(allShift) : []} multiple={false} onSelect={onSelect} />
        }
      </div></>
  );
};
// Connect the component to Redux
export default ShiftDropdown;

