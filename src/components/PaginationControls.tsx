import type { MouseEventHandler } from 'react';
import clsx from 'clsx';

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const PaginationControls = ({ page, pageCount, pageSize, totalItems, onPageChange }: PaginationControlsProps) => {
  const handlePageChange = (nextPage: number): MouseEventHandler<HTMLButtonElement> => (event) => {
    event.preventDefault();
    if (nextPage === page || nextPage < 1 || nextPage > pageCount) return;
    onPageChange(nextPage);
  };

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
      <div className="font-meta text-[0.7rem] tracking-[0.22em] text-[color:var(--mid)]">
        Page {page} / {pageCount}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePageChange(page - 1)}
          className={clsx(
            'rounded-full border border-[rgba(26,31,36,0.55)] bg-[rgba(13,20,26,0.75)] px-3 py-1 font-meta text-[0.68rem] tracking-[0.24em] text-[color:var(--mid)] transition-colors hover:text-[color:var(--white)]',
            page <= 1 && 'pointer-events-none opacity-40'
          )}
          aria-label="View previous dossiers"
        >
          Prev
        </button>
        <div className="rounded-full border border-[rgba(26,31,36,0.55)] bg-[rgba(10,15,20,0.7)] px-3 py-1 font-meta text-[0.68rem] tracking-[0.24em] text-[color:var(--passive)]">
          {start}-{end}
        </div>
        <button
          type="button"
          onClick={handlePageChange(page + 1)}
          className={clsx(
            'rounded-full border border-[rgba(26,31,36,0.55)] bg-[rgba(13,20,26,0.75)] px-3 py-1 font-meta text-[0.68rem] tracking-[0.24em] text-[color:var(--mid)] transition-colors hover:text-[color:var(--white)]',
            page >= pageCount && 'pointer-events-none opacity-40'
          )}
          aria-label="View next dossiers"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
