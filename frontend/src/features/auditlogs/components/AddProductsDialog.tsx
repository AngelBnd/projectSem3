import { useState } from "react";
import { Checkbox, Dialog, TablePagination } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import SearchBar from "../../../components/globalComponents/SearchBar";
import FilterDropdown from "../../../components/globalComponents/FilterButton";
import Button from "../../../components/globalComponents/Button";
import { useDebounce } from "../../../components/globalComponents/Debounce";
import { XIcon } from "../../../assets/SvgIcons";
import { ProductCategory } from "../../products/types";
import { titleCase } from "../../products/productDetail";
import { fetchAuditProducts } from "../api";
import type { AuditProduct } from "../types";

const ALL = "All categories";
const CATEGORIES = Object.keys(ProductCategory).filter((k) => isNaN(Number(k)));
const CATEGORY_BY_LABEL = new Map(CATEGORIES.map((c) => [titleCase(c), c]));

interface AddProductsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Variants already in the audit; shown checked and locked. */
  addedIds: Set<number>;
  onAdd: (products: AuditProduct[]) => void;
}

export default function AddProductsDialog({
  open,
  onClose,
  addedIds,
  onAdd,
}: AddProductsDialogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // keeps rows from other pages, so a selection survives paging and searching
  const [selected, setSelected] = useState<Map<number, AuditProduct>>(new Map());
  const [filterKey, setFilterKey] = useState(0); // remounts the category dropdown on reset

  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["auditProducts", debouncedSearch, category, page, pageSize],
    queryFn: () =>
      fetchAuditProducts({ search: debouncedSearch, category, page, pageSize }),
    enabled: open,
    placeholderData: keepPreviousData,
  });
  const rows = data?.items ?? [];

  const toggle = (p: AuditProduct) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(p.productVariantId)) next.delete(p.productVariantId);
      else next.set(p.productVariantId, p);
      return next;
    });

  const selectable = rows.filter((r) => !addedIds.has(r.productVariantId));
  const allOnPage =
    selectable.length > 0 && selectable.every((r) => selected.has(r.productVariantId));

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      selectable.forEach((r) =>
        allOnPage ? next.delete(r.productVariantId) : next.set(r.productVariantId, r),
      );
      return next;
    });

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setPage(0);
    setFilterKey((k) => k + 1);
    refetch();
  };

  const close = () => {
    setSelected(new Map());
    onClose();
  };

  const handleAdd = () => {
    onAdd([...selected.values()]);
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "8px" } }}
    >
      <div className="p-6 text-black font-nunito">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Add Products to Audit</h2>
          <button
            type="button"
            onClick={close}
            className="!bg-transparent p-1 text-black"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <SearchBar
          value={search}
          setSearchInput={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder="Search by name, SKU, or barcode..."
        />

        <div className="flex items-center justify-between mt-3 mb-4">
          <FilterDropdown
            key={filterKey}
            label="Category"
            options={[ALL, ...CATEGORY_BY_LABEL.keys()]}
            onSelect={(label) => {
              setCategory(CATEGORY_BY_LABEL.get(label) ?? "");
              setPage(0);
            }}
          />
          <button
            type="button"
            onClick={resetFilters}
            className="!bg-transparent p-1 text-blue-500"
            aria-label="Reset filters and refresh"
            title="Reset filters and refresh"
          >
            <RefreshIcon fontSize="small" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-md">
          <div className="grid grid-cols-[40px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_60px] gap-3 items-center px-3 py-2 text-sm text-gray-500 border-b border-gray-200">
            <Checkbox
              size="small"
              checked={allOnPage}
              indeterminate={
                !allOnPage && selectable.some((r) => selected.has(r.productVariantId))
              }
              onChange={togglePage}
              disabled={!selectable.length}
              inputProps={{ "aria-label": "Select all on this page" }}
            />
            <span>Product</span>
            <span>SKU</span>
            <span>Category</span>
            <span>Qty</span>
          </div>

          <div
            className={`h-[340px] overflow-y-auto custom-scrollbar transition-opacity ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {isError && (
              <p className="px-4 py-8 text-center text-sm text-red-500">
                Could not load products.
              </p>
            )}
            {!isError && data && rows.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                No products match your search.
              </p>
            )}

            {rows.map((p) => {
              const added = addedIds.has(p.productVariantId);
              return (
                <label
                  key={p.productVariantId}
                  className={`grid grid-cols-[40px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_60px] gap-3 items-center px-3 py-1 text-sm border-b border-gray-100 last:border-b-0 ${
                    added ? "text-gray-400" : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    size="small"
                    checked={added || selected.has(p.productVariantId)}
                    disabled={added}
                    onChange={() => toggle(p)}
                  />
                  <span className="truncate">
                    {p.productName}
                    {p.variantLabel && (
                      <span className="text-gray-400"> · {p.variantLabel}</span>
                    )}
                  </span>
                  <span className="truncate">{p.sku}</span>
                  <span className="truncate">{titleCase(p.category)}</span>
                  <span>{p.stock}</span>
                </label>
              );
            })}
          </div>
        </div>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
        />

        <div className="flex items-center justify-end gap-4 mt-2">
          <Button onClick={close} variant="tertiary">
            Cancel
          </Button>
          <Button onClick={handleAdd} variant="primary" disabled={!selected.size}>
            {selected.size
              ? `Add Selected Products (${selected.size})`
              : "Add Selected Products"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
