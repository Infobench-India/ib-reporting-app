import React, { useState, useEffect } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages,
}) => {
  const pageNeighbours = 2;

  const [pagesToRender, setPagesToRender] = useState<(number | string)[]>([]);

  const createPageRange = () => {
    const pages: (number | string)[] = [];

    pages.push(1);

    const startPage = Math.max(2, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

    if (startPage > 2) {
      pages.push('left-ellipsis');
    }

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (endPage < totalPages - 1) {
      pages.push('right-ellipsis');
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return Array.from(new Set(pages));
  };

  useEffect(() => {
    const pages = createPageRange();
    setPagesToRender(pages);
  }, [currentPage, totalPages]);

  return (
    <Pagination aria-label="Page navigation">
      {/* First Page */}
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          first
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(1);
          }}
        />
      </PaginationItem>

      {/* Previous Page */}
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          previous
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) setCurrentPage(currentPage - 1);
          }}
        />
      </PaginationItem>

      {/* Page Numbers */}
      {pagesToRender.map((page, index) => {
        if (page === 'left-ellipsis' || page === 'right-ellipsis') {
          return (
            <PaginationItem key={page + index} disabled>
              <PaginationLink href="#" tabIndex={-1}>
                &hellip;
              </PaginationLink>
            </PaginationItem>
          );
        }

        return (
          <PaginationItem key={page} active={page === currentPage}>
            <PaginationLink
              href="#"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(Number(page));
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        );
      })}

      {/* Next Page */}
      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          next
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
          }}
        />
      </PaginationItem>

      {/* Last Page */}
      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink
          last
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(totalPages);
          }}
        />
      </PaginationItem>
    </Pagination>
  );
};

export default PaginationComponent;
