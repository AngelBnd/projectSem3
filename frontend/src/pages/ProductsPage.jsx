import React, { useState, useEffect } from "react";
import FilterTabs from "../components/globalComponents/FilterTabs"; // adjust path
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../components/globalComponents/SearchBar";
import Button from "../components/globalComponents/Button";
import { PlusIcon, ExportIcon } from "../../src/assets/SvgIcons";
import ViewSwitch from "../components/globalComponents/ViewSwitch";
import FilterButtonV2 from "../components/globalComponents/FilterButtonV2";
import DataTable from "../components/globalComponents/DataTable";
import { IconButton, Tooltip } from "@mui/material";
import {
  LookFurtherMoreIntoWhatIsClickedIcon,
  ThreeDotsIcon,
} from "../../src/assets/SvgIcons";
import Badge from "../components/globalComponents/BadgeStatus";
import { usePopup } from "../components/globalComponents/PopupContext";
import {
  PopupOkay,
  PopupError,
  PopupOption,
} from "../components/globalComponents/PopupComp";

const productColumns = [
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
    renderCell: (params) => `Rp ${Number(params.value ?? 0).toFixed(2)}`,
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
    renderCell: (params) => <Badge status={params.value} />,
  },
];

// PLACEHOLDER FILTER TABS
const tabs = [
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openPopup, closePopup } = usePopup();

  const quickAddProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/product-variants/quick-add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error === "PRODUCT_EXISTS") {
          alert("Product already exists");
          return;
        }

        alert(result.error || "Failed to add products");
        return;
      }

      alert("Products added successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Quick add error:", err);
      alert("Failed to add products");
    }
  };
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/product-variants", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch products");

        const result = await res.json();

        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert("Opening add form")}>
      Add Product
    </Button>
  );
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
          <SearchBar />
          <ViewSwitch />
        </div>

        <div className="flex gap-3 items-center">
          {/* <Button
            onClick={() => {}}
            children={"Export All"}
            icon={ExportIcon}
            variant="white"
          /> */}
          <Button
            onClick={quickAddProducts}
            children={"(Instant) Add a Product"}
            icon={PlusIcon}
            variant="primary"
          />
        </div>
        {/* <div className="sm:ml-auto">
          <FilterButtonV2 children={"Filter"} />
        </div> */}
      </div>

      <div className="col-span-9">
        <DataTable
          title="Product Inventory"
          rows={data}
          columns={productColumns}
          loading={loading}
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
