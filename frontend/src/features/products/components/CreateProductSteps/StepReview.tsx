import { Checkbox, FormControlLabel } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { ProductCategory, ProductBrand } from "../../types";

import {
  ProductInfo,
  ProductVariantRow,
  ProductStatus,
  SupplierLine,
} from "../../types"; // adjust paths
interface ReviewFieldType {
  label: string;
  value: string;
}

// Read-only label + value pair
const ReviewField = ({ label, value }: ReviewFieldType) => (
  <div className="mb-4">
    <div className="text-sm mb-1 font-nunito font-bold text-gray-500">
      {label}
    </div>
    <div className="text-sm font-nunito text-black">{value}</div>
  </div>
);

/* ---------- component ---------- */

interface StepReviewProductProps {
  formData: ProductInfo;
  setFormData: Dispatch<SetStateAction<ProductInfo>>;
}

export default function StepReview({
  formData,
  setFormData,
}: StepReviewProductProps) {
  const attributes = formData.attributes.filter(
    (a) => a.name && a.values.length,
  );
  return (
    <div className="overflow-hidden h-full overflow-y-auto">
      <div className="w-full bg-white p-6 rounded-md shadow-md">
        {/* Product name */}
        <ReviewField label="Product name" value={formData.productName || "-"} />

        {/* Category + Brand (enum values -> display labels) */}
        <div className="grid grid-cols-2 gap-3">
          <ReviewField
            label="Category"
            value={
              formData.productCategory
                ? ProductCategory[formData.productCategory]
                : "-"
            }
          />
          <ReviewField
            label="Brand"
            value={
              formData.productBrand ? ProductBrand[formData.productBrand] : "-"
            }
          />
        </div>

        {/* Have variants (locked) */}
        <div className="mb-4 px-2">
          <FormControlLabel
            control={<Checkbox checked={formData.hasVariants} disabled />}
            label={
              <span className="text-sm font-nunito text-black">
                Have variants
              </span>
            }
          />
        </div>

        {/* Attributes / Values (locked), only when the product has variants */}
        {formData.hasVariants && attributes.length > 0 && (
          <div className="border border-gray-200 rounded-md bg-white mb-4">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-500 font-nunito">
              <span className="col-span-3">Attributes</span>
              <span className="col-span-9">Values</span>
            </div>

            {attributes.map((attr) => (
              <div
                key={attr.tempId}
                className="grid grid-cols-12 gap-4 items-center px-4 py-2 border-t border-gray-200"
              >
                <span className="col-span-3 text-sm font-nunito font-bold">
                  {attr.name}
                </span>

                <div
                  className="col-span-9 flex flex-wrap items-center gap-2 min-h-[40px] px-2 py-1 border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed"
                  aria-readonly="true"
                >
                  {attr.values.map((value) => (
                    <span
                      key={value}
                      className="px-2 py-1 text-sm font-nunito bg-white rounded-md"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <ReviewField label="Description" value={formData.description || "-"} />
      </div>
    </div>
  );
}
