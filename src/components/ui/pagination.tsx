
import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLocalization } from "@/hooks/useLocalization";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function Pagination({ className, totalPages, currentPage, onPageChange, ...props }: PaginationProps) {
  const { t } = useLocalization();

  const generatePages = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Current page neighborhood
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) pages.push(totalPages);
    
    // Sort and add ellipses
    return pages.sort((a, b) => a - b).reduce((acc: (number | string)[], curr, idx, arr) => {
      if (idx > 0 && arr[idx - 1] !== curr - 1) {
        acc.push('ellipsis' + idx);
      }
      acc.push(curr);
      return acc;
    }, []);
  };

  const PaginationButton = ({ className, isActive, ...props }: PaginationButtonProps) => (
    <button
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
        isActive && "pointer-events-none",
        className
      )}
      {...props}
    />
  );

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
      <PaginationButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label={t("previousPage")}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">{t("previous")}</span>
      </PaginationButton>
      
      {generatePages().map((page, i) => {
        if (typeof page === 'string') {
          return (
            <span key={page} className="flex h-9 w-9 items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">...</span>
            </span>
          );
        }
        
        return (
          <PaginationButton
            key={page}
            onClick={() => onPageChange(page as number)}
            isActive={currentPage === page}
            aria-label={`${t("page")} ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </PaginationButton>
        );
      })}
      
      <PaginationButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label={t("nextPage")}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">{t("next")}</span>
      </PaginationButton>
    </div>
  );
}
