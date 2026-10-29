import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { ChangeEvent, Dispatch, SetStateAction, useEffect } from "react";
import {
  ProductInfo,
  ProductCategory,
  ProductStatus,
  ProductVariantRow,
  ImageItem,
  ProductBrand,
} from "../../types";
import VariantsInput from "../VariantsInput";

// Shared styling so every MUI field matches the plain <input> fields
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
};

interface StepGeneralInfoProps {
  formData: ProductInfo;
  setFormData: Dispatch<SetStateAction<ProductInfo>>;
}
const formatSize = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(1)} mb`;

export default function ({ formData, setFormData }: StepGeneralInfoProps) {
  // Without variants, the product is its own single variant (index 0)
  const singleVariant = formData.variants[0];

  // Plain inputs, textarea, and selects: the `name` must match a key of ProductInfo
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleVariants = (checked: boolean) =>
    setFormData((prev) => ({
      ...prev,
      hasVariants: checked,
      attributes: checked ? prev.attributes : [],
      // Turning off collapses back to the single default variant
      variants: checked ? prev.variants : prev.variants.slice(0, 1),
    }));

  const handleToggleActive = (checked: boolean) =>
    setFormData((prev) => ({
      ...prev,
      productStatus: (checked
        ? ProductStatus.ACTIVE
        : ProductStatus.INACTIVE) as ProductStatus,
    }));

  const setSingleVariantField = <K extends keyof ProductVariantRow>(
    key: K,
    value: ProductVariantRow[K],
  ) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === 0 ? { ...v, [key]: value } : v,
      ),
    }));

  const addFiles = (files: File[]) => {
    const items: ImageItem[] = files.map((file) => ({
      tempId: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file), // local preview
    }));
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...items] }));
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = ""; // allow re-selecting the same file
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    addFiles(
      Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      ),
    );
  };

  const removeImage = (tempId: string) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.tempId !== tempId),
      // clear any variant that was pointing at the removed image
      variants: prev.variants.map((v) =>
        v.imageRef === tempId ? { ...v, imageRef: null } : v,
      ),
    }));

  const brandNames = Object.keys(ProductBrand).filter((k) => isNaN(Number(k)));
  const categoryNames = Object.keys(ProductCategory).filter((k) =>
    isNaN(Number(k)),
  );

  useEffect(() => {
    console.log(formData);
  }, [formData]);
  return (
    <div className="overflow-hidden h-full overflow-y-auto">
      {/* Product name */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Product name</div>
        <input
          type="text"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="AUD-2025-001"
        />
      </div>
      {/* Category + Brand */}
      <div className="flex gap-3">
        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Category</div>
          <TextField
            select
            fullWidth
            size="small"
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            sx={fieldSx}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Category</MenuItem>
            {categoryNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Brand</div>
          <TextField
            select
            fullWidth
            size="small"
            name="productBrand"
            value={formData.productBrand}
            onChange={handleChange}
            sx={fieldSx}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Brand</MenuItem>
            {brandNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>
      {/* Description */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Description</div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md bg-white resize-none"
          placeholder="Product Description"
        />
      </div>
      {/* Have variants */}
      <div className="mb-4 px-2">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.hasVariants}
              onChange={(e) => handleToggleVariants(e.target.checked)}
            />
          }
          label={
            <span className="text-sm font-nunito font-bold">Have variants</span>
          }
        />
      </div>
      {/* SKU + Barcode: only here when the product is its own single variant */}
      {!formData.hasVariants ? (
        <>
          {/* Active toggle */}
          <div className="mb-4">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.productStatus === ProductStatus.ACTIVE}
                  onChange={(e) => handleToggleActive(e.target.checked)}
                />
              }
              label={<span className="text-sm font-nunito">Active</span>}
            />
          </div>

          {/* Images */}
          <div className="mb-2">
            <div className="text-sm mb-1 font-nunito font-bold">Images</div>

            <label
              htmlFor="product-images"
              className="flex flex-col items-center justify-center gap-1 w-full h-28 border border-gray-300 rounded-md bg-white cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <UploadFileOutlinedIcon className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-500 underline">
                Click to Upload
              </span>
              <span className="text-xs text-gray-400">or drag and drop</span>
              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFiles}
              />
            </label>

            {/* Uploaded files */}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((img) => (
                <div
                  key={img.tempId}
                  className="flex items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-2 min-w-[200px]"
                >
                  <InsertDriveFileOutlinedIcon
                    fontSize="small"
                    className="text-gray-500"
                  />
                  <div className="flex-1 leading-tight">
                    <div className="text-xs font-bold text-black">
                      {img.file?.name ?? "Image"}
                    </div>
                    {img.file && (
                      <div className="text-[10px] text-gray-400">
                        {formatSize(img.file.size)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.tempId)}
                    className="bg-transparent text-gray-500 hover:text-gray-700 p-0"
                    aria-label={`Remove ${img.file?.name ?? "image"}`}
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <VariantsInput formData={formData} setFormData={setFormData} />
      )}
    </div>
  );
}
