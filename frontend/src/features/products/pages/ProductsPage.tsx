import React, { useState } from "react";
import FilterTabs from "../../../components/globalComponents/FilterTabs"; // adjust path
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../../../components/globalComponents/SearchBar";
import Button from "../../../components/globalComponents/Button";
import { PlusIcon, ExportIcon } from "../../../assets/SvgIcons";
import ViewSwitch from "../../../components/globalComponents/ViewSwitch";
import FilterButtonV2 from "../../../components/globalComponents/FilterButtonV2";
import DataTable from "../../../components/globalComponents/DataTable";
import { IconButton, Tooltip } from "@mui/material";
import {
  LookFurtherMoreIntoWhatIsClickedIcon,
  ThreeDotsIcon,
} from "../../../assets/SvgIcons";
import Badge from "../../../components/globalComponents/BadgeStatus";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { fetchProductVariants, quickAddProducts } from "../api";
import { ApiError } from "../../../lib/api";
import type { ProductVariant } from "../../../types";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { FilterTab } from "../../../components/globalComponents/FilterTabs";
import {
  PopupOkay,
  PopupError,
  PopupOption,
} from "../../../components/globalComponents/PopupComp";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RowActions } from "../components/RowActions";

const productColumns: GridColDef[] = [
  {
    field: "productVariantId",
    headerName: "ID",
    width: 90,
  },
  {
    field: "productName",
    headerName: "Product",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "variantName",
    headerName: "Variant",
    flex: 1,
    minWidth: 250,
  },
  {
    field: "sku",
    headerName: "SKU",
    width: 140,
  },
  {
    field: "barcode",
    headerName: "Barcode",
    width: 160,
  },
  {
    field: "sellingPrice",
    headerName: "Selling Price",
    width: 150,
    type: "number",
    renderCell: (params: GridRenderCellParams) =>
      `Rp ${Number(params.value ?? 0).toFixed(2)}`,
  },
  {
    field: "thresholdStock",
    headerName: "Stock Threshold",
    width: 160,
    type: "number",
  },
  {
    field: "productStatus",
    headerName: "Status",
    width: 130,
    renderCell: (params: GridRenderCellParams) => (
      <Badge status={params.value} />
    ),
  },
  {
    field: "actions",
    headerName: "Action",
    width: 130,
    renderCell: (params: GridRenderCellParams) => (
      <RowActions
        row={params.row}
        onView={(row) => {}}
        onEdit={(row) => {}}
        onDelete={(row) => {}}
      />
    ),
  },
];

// PLACEHOLDER FILTER TABS
const tabs: FilterTab<ProductVariant>[] = [
  {
    label: "All",
    filterFn: (data) => data,
  },
  {
    label: "Items",
    filterFn: (data) => data.filter((p) => p.category === "Items"),
  },
  {
    label: "Services",
    filterFn: (data) => data.filter((p) => p.category === "Services"),
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const { openPopup, closePopup } = usePopup();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ProductVariant[]>({
    queryKey: ["productVariants"],
    queryFn: fetchProductVariants,
  });
  const quickAddMutation = useMutation({
    mutationFn: quickAddProducts,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["productVariants"] }),
  });

  const handleQuickAddProducts = async () => {
    try {
      await quickAddMutation.mutateAsync();

      alert("Products added successfully!");
    } catch (err) {
      if (err instanceof ApiError && err.message === "PRODUCT_EXISTS") {
        alert("Product already exists");
        return;
      }

      console.error("Quick add error:", err);
      alert(err instanceof ApiError ? err.message : "Failed to add products");
    }
  };

  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert("Opening add form")}>
      Add Product
    </Button>
  );

  if (isLoading) return <div>Loading product variants...</div>;
  if (error) return <div>Error fetching product variants: {error.message}</div>;
  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">Products</h1>
        <h3 className="text-[#777B7C] text-sm">
          Overview of your store's products
        </h3>
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        {/* <FilterTabs
          tabs={tabs}
          // data={products}
          // onChange={(newData) => setFilteredProducts(newData)}
        /> */}
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SearchBar setSearchInput={setSearchInput} value={searchInput} />
          <ViewSwitch />
        </div>

        <div className="flex gap-3 items-center">
          <Button
            onClick={() => {}}
            children={"Export All"}
            icon={ExportIcon}
            variant="white"
          />
          <Button
            onClick={() => {
              navigate(`/products/create-product`);
            }}
            children={"Add a Product"}
            icon={PlusIcon}
            variant="primary"
            disabled={quickAddMutation.isPending}
          />
        </div>
        {/* <div className="sm:ml-auto">
          <FilterButtonV2 children={"Filter"} />
        </div> */}
      </div>

      <div className="col-span-9">
        <DataTable
          title="Product Inventory"
          rows={data ?? []}
          columns={productColumns}
          loading={isLoading}
          CustomToolbar={addProductButton}
          gridProps={{
            checkboxSelection: true,
            getRowId: (row) => row.productVariantId,
          }}
        />
      </div>
    </div>
  );
}
