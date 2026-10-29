import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Autocomplete, Chip, MenuItem, Switch, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { newSupplierLine } from "./CreateProductSteps/StepPricingStock";

import {
  ProductInfo,
  ProductVariantRow,
  ProductStatus,
  ImageItem,
  AttributeInput,
} from "../types"; // adjust paths

/* ---------- helpers ---------- */

export const newAttribute = (): AttributeInput => ({
  tempId: crypto.randomUUID(),
  name: "",
  values: [],
  useImages: false,
  images: {},
});

const newRow = (over: Partial<ProductVariantRow> = {}): ProductVariantRow => ({
  tempId: crypto.randomUUID(),
  attributes: {},
  sku: "",
  barcode: "",
  sellingPrice: "",
  thresholdStock: "",
  productStatus: ProductStatus.ACTIVE,
  isDefault: false,
  imageRef: null,
  images: [],
  suppliers: [newSupplierLine()], // blank line ready to be filled in
  ...over,
});

const cartesian = (lists: string[][]): string[][] =>
  lists.reduce<string[][]>(
    (acc, list) => acc.flatMap((a) => list.map((v) => [...a, v])),
    [[]],
  );

// A variant's image = the first image of its value, in the attribute that has "use images" on
const imageRefFor = (
  attrs: AttributeInput[],
  variantAttrs: Record<string, string>,
) => {
  const a = attrs.find((x) => x.useImages && x.name && variantAttrs[x.name]);
  return a?.images[variantAttrs[a.name]]?.[0]?.tempId ?? null;
};

// Rebuild the variant list from the attributes, keeping what was already typed
const regenerateVariants = (
  attributes: AttributeInput[],
  existing: ProductVariantRow[],
): ProductVariantRow[] => {
  const valid = attributes.filter((a) => a.name && a.values.length);

  // No usable attributes yet: keep a single default row (hidden in the UI)
  if (!valid.length) return [existing[0] ?? newRow({ isDefault: true })];

  const rows = cartesian(valid.map((a) => a.values)).map((combo, i) => {
    const attrs = Object.fromEntries(
      valid.map((a, idx) => [a.name, combo[idx]]),
    );
    const key = JSON.stringify(attrs);
    const match = existing.find((v) => JSON.stringify(v.attributes) === key);
    return match ?? newRow({ attributes: attrs, isDefault: i === 0 });
  });

  return rows.map((r) => ({
    ...r,
    imageRef: imageRefFor(attributes, r.attributes),
  }));
};

const syncVariants = (
  prev: ProductInfo,
  attributes: AttributeInput[],
): ProductInfo => ({
  ...prev,
  attributes,
  variants: regenerateVariants(attributes, prev.variants),
});

const formatSize = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(1)} mb`;

const fieldSx = {
  "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "8px" },
};
const lockedSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F3F4F6",
    borderRadius: "8px",
  },
};

/* ---------- component ---------- */

interface StepVariantsProps {
  formData: ProductInfo;
  setFormData: Dispatch<SetStateAction<ProductInfo>>;
  attributeOptions?: string[]; // store attributes, e.g. ["Color", "Size"]
  valueOptions?: Record<string, string[]>; // values per attribute name
}

export default function VariantsInput({
  formData,
  setFormData,
  attributeOptions = [],
  valueOptions = {},
}: StepVariantsProps) {
  const { attributes, variants } = formData;
  const validAttrs = attributes.filter((a) => a.name && a.values.length);

  const updateAttribute = (
    tempId: string,
    patch: (a: AttributeInput) => AttributeInput,
  ) =>
    setFormData((prev) =>
      syncVariants(
        prev,
        prev.attributes.map((a) => (a.tempId === tempId ? patch(a) : a)),
      ),
    );

  const addAttribute = () =>
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute()],
    }));

  const removeAttribute = (tempId: string) =>
    setFormData((prev) =>
      syncVariants(
        prev,
        prev.attributes.filter((a) => a.tempId !== tempId),
      ),
    );

  const setName = (tempId: string, name: string) =>
    // changing the name invalidates the old values and their images
    updateAttribute(tempId, (a) => ({ ...a, name, values: [], images: {} }));

  const setValues = (tempId: string, raw: string[]) =>
    updateAttribute(tempId, (a) => {
      const values = [...new Set(raw.map((v) => v.trim()).filter(Boolean))];
      // drop images of values that were removed
      const images = Object.fromEntries(
        Object.entries(a.images).filter(([v]) => values.includes(v)),
      );
      return { ...a, values, images };
    });

  const toggleImages = (tempId: string, on: boolean) =>
    updateAttribute(tempId, (a) => ({
      ...a,
      useImages: on,
      images: on ? a.images : {},
    }));

  const addImages = (
    tempId: string,
    value: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const items: ImageItem[] = Array.from(e.target.files ?? []).map((file) => ({
      tempId: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    e.target.value = "";
    if (!items.length) return;
    updateAttribute(tempId, (a) => ({
      ...a,
      images: { ...a.images, [value]: [...(a.images[value] ?? []), ...items] },
    }));
  };

  const removeImage = (tempId: string, value: string, imageTempId: string) =>
    updateAttribute(tempId, (a) => ({
      ...a,
      images: {
        ...a.images,
        [value]: (a.images[value] ?? []).filter(
          (i) => i.tempId !== imageTempId,
        ),
      },
    }));

  const setVariantField = <K extends keyof ProductVariantRow>(
    tempId: string,
    key: K,
    value: ProductVariantRow[K],
  ) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId === tempId ? { ...v, [key]: value } : v,
      ),
    }));

  // Table columns: one per attribute, then SKU, Barcode, Active
  const gridCols = `repeat(${validAttrs.length}, minmax(90px, 1fr)) 1.5fr 1.5fr 80px`;

  return (
    <div>
      {/* ---------- Attributes / Values ---------- */}
      <div className="border border-gray-300 rounded-md bg-white mb-2">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-500 font-nunito">
          <span className="col-span-3">Attributes</span>
          <span className="col-span-9">Values</span>
        </div>

        {attributes.map((attr) => (
          <div
            key={attr.tempId}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-gray-200"
          >
            {/* Attribute name */}
            <div className="col-span-3">
              <Autocomplete
                freeSolo
                autoSelect
                size="small"
                options={attributeOptions}
                value={attr.name}
                getOptionDisabled={(option) =>
                  attributes.some(
                    (a) =>
                      a.tempId !== attr.tempId &&
                      a.name.toLowerCase() === option.toLowerCase(),
                  )
                }
                onChange={(_, v) => {
                  const next = ((v as string | null) ?? "").trim();
                  if (next !== attr.name) setName(attr.tempId, next); // don't wipe values if unchanged
                }}
                sx={lockedSx}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Attribute" />
                )}
              />
            </div>

            {/* Values + images */}
            <div className="col-span-8">
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={valueOptions[attr.name] ?? []}
                value={attr.values}
                disabled={!attr.name}
                onChange={(_, v) => setValues(attr.tempId, v as string[])}
                sx={lockedSx}
                renderTags={(vals, getTagProps) =>
                  vals.map((v, i) => {
                    const { key, ...tagProps } = getTagProps({ index: i });
                    return (
                      <Chip
                        key={key}
                        label={v}
                        size="small"
                        {...tagProps}
                        sx={{
                          bgcolor: "#fff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px",
                        }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      attr.values.length ? "" : "Select or type a value"
                    }
                  />
                )}
              />

              {attr.values.length > 0 && (
                <div className="flex items-center mt-3">
                  <Switch
                    checked={attr.useImages}
                    onChange={(e) =>
                      toggleImages(attr.tempId, e.target.checked)
                    }
                  />
                  <span className="text-sm font-nunito">
                    Use images for this variant
                  </span>
                </div>
              )}

              {attr.useImages && (
                <>
                  {/* One upload box per value */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {attr.values.map((value) => (
                      <label
                        key={value}
                        className="flex flex-col items-center justify-center gap-1 w-[92px] h-[92px] border-2 border-dashed border-gray-300 rounded-md bg-gray-100 cursor-pointer"
                      >
                        <UploadFileOutlinedIcon className="text-blue-500" />
                        <span className="text-xs text-gray-500">{value}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => addImages(attr.tempId, value, e)}
                        />
                      </label>
                    ))}
                  </div>

                  {/* Uploaded files, labelled with the value they belong to */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {attr.values.flatMap((value) =>
                      (attr.images[value] ?? []).map((img) => (
                        <div key={img.tempId}>
                          <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-2 min-w-[200px]">
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
                              onClick={() =>
                                removeImage(attr.tempId, value, img.tempId)
                              }
                              className="bg-transparent text-gray-500 hover:text-gray-700 p-0"
                              aria-label="Remove image"
                            >
                              <CloseIcon fontSize="small" />
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {value}
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Delete attribute */}
            <div className="col-span-1 pt-1">
              <button
                type="button"
                onClick={() => removeAttribute(attr.tempId)}
                className="bg-transparent p-0 text-red-500 hover:text-red-600"
                aria-label="Remove attribute"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addAttribute}
        className="flex items-center gap-2 p-2 mb-6 text-blue-500 hover:text-blue-600 bg-transparent"
      >
        <AddIcon fontSize="small" />
        <span className="text-sm font-semibold">Add Attribute</span>
      </button>

      {/* ---------- Variant table ---------- */}
      {validAttrs.length > 0 && (
        <>
          <div className="text-sm mb-2 font-nunito font-bold">
            Variant table
          </div>

          <div className="border border-gray-300 rounded-md bg-white overflow-x-auto">
            <div
              className="grid gap-4 px-4 py-4 text-sm text-gray-500 font-nunito"
              style={{ gridTemplateColumns: gridCols }}
            >
              {validAttrs.map((a) => (
                <span key={a.tempId}>{a.name}</span>
              ))}
              <span>SKU</span>
              <span>Barcode</span>
              <span>Active</span>
            </div>

            {variants.map((v) => (
              <div
                key={v.tempId}
                className="grid gap-4 items-center px-4 py-3 border-t border-gray-200"
                style={{ gridTemplateColumns: gridCols }}
              >
                {validAttrs.map((a) => (
                  <span key={a.tempId} className="text-sm font-nunito">
                    {v.attributes[a.name]}
                  </span>
                ))}

                <TextField
                  size="small"
                  value={v.sku}
                  onChange={(e) =>
                    setVariantField(v.tempId, "sku", e.target.value)
                  }
                  placeholder="AUD-2025-001"
                  sx={fieldSx}
                />
                <TextField
                  size="small"
                  value={v.barcode}
                  onChange={(e) =>
                    setVariantField(v.tempId, "barcode", e.target.value)
                  }
                  placeholder="AUD-2025-001"
                  sx={fieldSx}
                />
                <Switch
                  checked={v.productStatus === ProductStatus.ACTIVE}
                  onChange={(e) =>
                    setVariantField(
                      v.tempId,
                      "productStatus",
                      e.target.checked
                        ? ProductStatus.ACTIVE
                        : ProductStatus.INACTIVE,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
