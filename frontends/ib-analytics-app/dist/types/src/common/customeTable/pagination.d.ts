import React from 'react';
interface PaginationProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageSize: number;
    totalPages: number;
}
declare const PaginationComponent: React.FC<PaginationProps>;
export default PaginationComponent;
