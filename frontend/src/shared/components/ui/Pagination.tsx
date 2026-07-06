import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

function buildPages(currentPage: number, totalPages: number, siblingCount: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number | "...">();
  pages.add(1);
  pages.add(totalPages);

  for (let page = currentPage - siblingCount; page <= currentPage + siblingCount; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  const ordered = Array.from(pages)
    .filter((page) => page !== "...")
    .sort((a, b) => Number(a) - Number(b));
  const result: Array<number | "..."> = [];

  for (let index = 0; index < ordered.length; index += 1) {
    const page = ordered[index]!;
    const next = ordered[index + 1];
    result.push(page);

    if (typeof page === "number" && typeof next === "number" && next - page > 1) {
      result.push("...");
    }
  }

  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const pages = buildPages(currentPage, totalPages, siblingCount);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Paginação">
      <p className="text-sm text-spanish-green-700">
        Página <span className="font-semibold text-spanish-green-950">{currentPage}</span> de{" "}
        <span className="font-semibold text-spanish-green-950">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-spanish-green-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={cn(
                  "min-w-10 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200",
                  page === currentPage
                    ? "bg-spanish-green-700 text-white"
                    : "bg-white text-spanish-green-700 hover:bg-spanish-green-100",
                )}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}
