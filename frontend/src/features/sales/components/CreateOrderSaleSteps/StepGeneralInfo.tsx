import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import type { ProductVariant } from "../../../../types";
import type { SalesChannel } from "../../api";
import type { OrderProduct, OrderService, OrderStepProps } from "../../types";
import FilterTabs from "../../../../components/globalComponents/FilterTabs";
import { PopupOkay, PopupError } from "../../../../components/globalComponents/PopupComp";
import Button from "../../../../components/globalComponents/Button";
import {
  Autocomplete,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CalendarIcon } from "../../../../assets/SvgIcons";
import { fetchSalesChannels } from "../../api";
import { fetchProductVariants } from "../../../products/api";

type ProductAction =
  | { type: "SELECT_VARIANT"; data: ProductVariant | null }
  | { target: { name: string; value: string } };

interface ProductItemProps {
  product: OrderProduct;
  index: number;
  onProductChange: (index: number, action: ProductAction) => void;
  onDeleteProduct: (index: number) => void;
  onProductFocus?: (index: number) => void;
  onProductBlur?: () => void;
  activeProductIndex: number | null;
  mode?: string;
  autofill: ProductVariant[];
  newProducts: OrderProduct[];
  handleProductCodeChange: (index: number, value: string) => void;
}

const ProductItem = ({
  product,
  index,
  onProductChange,
  onDeleteProduct,
  onProductFocus,
  onProductBlur,
  activeProductIndex,
  mode,
  autofill,
  newProducts,
  handleProductCodeChange,
}: ProductItemProps) => {
  const isFocused = activeProductIndex === index;
  const isEditMode = mode === "edit";
  const isProductSet =
    !!product.productName && product.productName.trim().length > 0;
  const isNewlyAddedAndBlank =
    !isProductSet && product.tempId && product.productCode === "";
  const showFinalDisplay = (isEditMode || isProductSet) && !isFocused;
  const showInput = isFocused || !isProductSet;

  return (
    <div className="grid grid-cols-6 items-end gap-4 py-[4px] bg-transparent rounded-lg">
      <div className="col-span-4 relative flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
          {product.variantName || "Product Name"}
        </p>
        <Autocomplete
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#e5e7eb",
              },
              "&:hover fieldset": {
                borderColor: "#d1d5db",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#9ca3af",
              },
            },
          }}
          options={autofill}
          getOptionLabel={(option) => option.variantName || ""}
          value={
            autofill.find(
              (v) => v.productVariantId === product.productVariantId
            ) || null
          }
          onChange={(event, newValue) => {
            onProductChange(index, {
              type: "SELECT_VARIANT",
              data: newValue,
            });
          }}
          inputValue={product.variantName ?? ""}
          onInputChange={(e, newInputValue) =>
            handleProductCodeChange(index, newInputValue)
          }
          isOptionEqualToValue={(option, value) =>
            option.productVariantId === value?.productVariantId
          }
          renderInput={(params) => (
            <TextField
              {...params}
              name={`product-${index}`}
              placeholder="Search by code or name"
              variant="outlined"
            />
          )}
        />
      </div>

      <div className="col-span-1">
        <input
          type="number"
          name="quantitySold"
          value={product.quantitySold}
          onChange={(e) => onProductChange(index, e)}
          className="w-full p-2 text-center border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
          min="1"
        />
      </div>

      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={() => onDeleteProduct(index)}
          className="p-2 text-red-500 rounded-md hover:bg-red-100 bg-transparent mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ServiceItemProps {
  service: OrderService;
  index: number;
  onServiceChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteService: (index: number) => void;
}

const ServiceItem = ({ service, index, onServiceChange, onDeleteService }: ServiceItemProps) => {
  return (
    <div className="grid grid-cols-6 items-end gap-4 py-[4px] bg-transparent rounded-lg">
      <div className="col-span-3">
        <input
          type="text"
          name="serviceName"
          value={service.serviceName}
          onChange={(e) => onServiceChange(index, e)}
          placeholder="Service Description"
          className="w-full p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="col-span-1">
        <input
          type="number"
          name="quantity"
          min="1"
          value={service.quantity}
          onChange={(e) => onServiceChange(index, e)}
          className="w-full p-2 text-center border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="col-span-1">
        <input
          type="number"
          name="unitPrice"
          value={service.unitPrice}
          onChange={(e) => onServiceChange(index, e)}
          placeholder="Price"
          className="w-full p-2 text-right border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
          min="0"
        />
      </div>

      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={() => onDeleteService(index)}
          className="p-2 text-red-500 rounded-md hover:bg-red-100 bg-transparent mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function StepGeneralInfo({
  setNewProducts,
  setNewServices,
  newServices,
  newProducts,
  formData,
  setFormData,
}: OrderStepProps) {
  console.log("formData:", formData);

  const [activeTab, setActiveTab] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);
  const [dropdownPosition] = useState<{ top?: number; left?: number; width?: number }>({});

  const { data: autofill = [], error: productVariantsError } = useQuery({
    queryKey: ["productVariants"],
    queryFn: fetchProductVariants,
  });
  const {
    data: channels = [],
    isLoading: loadingChannels,
    error: channelsError,
  } = useQuery({
    queryKey: ["salesChannels"],
    queryFn: fetchSalesChannels,
  });

  const [, setHasAddedProduct] = useState(false);
  const orderDateRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   console.log(newProducts);
  //   console.log(newServices);
  // }, [newProducts, newServices]);

  const tabs = [{ label: "Products" }, { label: "Services" }];

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = structuredClone(prev) as unknown as Record<string, unknown>;

      const keys = name.split(".");
      let pointer = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        pointer[k] = { ...(pointer[k] as object) };
        pointer = pointer[k] as Record<string, unknown>;
      }

      pointer[keys[keys.length - 1]] = value;

      return updated as unknown as typeof prev;
    });
  };

  const handleAddProduct = () => {
    const newBlankProduct: OrderProduct = {
      productVariantId: null,
      productId: null,

      sku: "",
      barcode: "",
      variantName: "",

      thresholdStock: 0,

      quantitySold: 1,
      unitPrice: 0,
      tempId: Date.now(),
    };
    setNewProducts([...newProducts, newBlankProduct]);
    setHasAddedProduct(true);
  };

  const handleProductChange = (index: number, action: ProductAction) => {
    const updated = [...newProducts];

    if ("type" in action) {
      const v = action.data;
      if (!v) return;

      updated[index] = {
        ...updated[index],
        productVariantId: v.productVariantId,
        productId: v.productId ?? null,
        variantName: v.variantName ?? "",
        sku: v.sku ?? "",
        unitPrice: Number(v.sellingPrice),
        quantitySold: updated[index].quantitySold || 1,
      };

      setNewProducts(updated);
      return;
    }

    {
      const { name, value } = action.target;

      updated[index] = {
        ...updated[index],
        [name]:
          name === "quantitySold"
            ? Math.max(1, parseInt(value, 10) || 1)
            : value,
      };

      setNewProducts(updated);
      return;
    }
  };

  const handleProductCodeChange = (index: number, newInputValue: string) => {
    setNewProducts((prev) => {
      if (!prev[index]) return prev;

      const updated = [...prev];
      updated[index].variantName = newInputValue;
      return updated;
    });
  };

  const handleDeleteProduct = (indexToRemove: number) => {
    setNewProducts(newProducts.filter((_, index) => index !== indexToRemove));
  };

  const handleAddService = () => {
    if (activeTab !== 1) return;
    const newBlankService: OrderService = {
      serviceName: "",
      unitPrice: 0,
      quantity: 1,
      tempId: Date.now(),
    };
    setNewServices([...newServices, newBlankService]);
    setHasAddedProduct(true);
  };

  const handleServiceChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedServices = [...newServices];

    let formattedValue: string | number = value;

    if (name === "unitPrice") {
      formattedValue = parseFloat(value) || 0;
    } else if (name === "quantity") {
      formattedValue = Math.max(1, parseInt(value, 10) || 1);
    }

    updatedServices[index] = {
      ...updatedServices[index],
      [name]: formattedValue,
    };

    setNewServices(updatedServices);
  };

  const handleDeleteService = (indexToRemove: number) => {
    setNewServices(newServices.filter((_, index) => index !== indexToRemove));
  };

  const handleProductFocus = (index: number) => {
    setActiveProductIndex(index);
  };

  const handleProductBlur = () => {
    setActiveProductIndex(null);
  };

  const handleAutofillClick = (index: number, selectedProduct?: ProductVariant) => {
    if (!selectedProduct) return;

    setNewProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product: selectedProduct,
        productName: selectedProduct.productName,
        productCode: selectedProduct.productCode,
        unitPrice: Number(selectedProduct.sellingPrice),
      };
      return updated;
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Customer Name</div>
        <input
          type="text"
          value={formData.generalInfo.customerName}
          name="generalInfo.customerName"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="Enter customer name"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Order Date</div>

        <div className="flex items-center justify-between border border-gray-300 rounded-md bg-white px-2 relative">
          <input
            ref={orderDateRef}
            type="date"
            value={formData.generalInfo.orderDate}
            name="generalInfo.orderDate"
            onChange={handleChange}
            className="w-full p-2 bg-transparent outline-none"
          />

          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => orderDateRef.current?.showPicker()}
            style={{ pointerEvents: "auto" }}
          >
            <CalendarIcon className="text-gray-500" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Payment Term</div>
        <TextField
          select
          fullWidth
          size="small"
          error={!formData.generalInfo.paymentTerm}
          helperText={!formData.generalInfo.paymentTerm ? "Required" : ""}
          value={formData.generalInfo.paymentTerm}
          name="generalInfo.paymentTerm"
          onChange={(e) =>
            handleChange({
              target: {
                name: "generalInfo.paymentTerm",
                value: e.target.value,
              },
            })
          }
          SelectProps={{
            displayEmpty: true, // <-- THIS enables placeholder
          }}
        >
          <MenuItem value="">Select Payment Term</MenuItem>
          <MenuItem value="Immediate">Immediate</MenuItem>
          <MenuItem value="et7">Net 7</MenuItem>
          <MenuItem value="net14">Net 14</MenuItem>
          <MenuItem value="net30">Net 30</MenuItem>
        </TextField>
        {channelsError && (
          <div className="text-red-500 text-xs mt-1">
            Failed to load channels: {channelsError.message}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Channel</div>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.generalInfo.channelId?.toString() || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                generalInfo: {
                  ...prev.generalInfo,
                  channelId:
                    e.target.value === "" ? null : parseInt(e.target.value),
                  subChannelId: null,
                },
              }))
            }
            error={!formData.generalInfo.channelId}
            helperText={!formData.generalInfo.channelId ? "Required" : ""}
            disabled={loadingChannels}
            SelectProps={{
              displayEmpty: true, // <-- THIS enables placeholder
            }}
          >
            <MenuItem value="">Select Channel</MenuItem>

            {channels.map((ch) => (
              <MenuItem key={ch.channelId} value={ch.channelId}>
                {ch.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Sub Channel</div>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.generalInfo.subChannelId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                generalInfo: {
                  ...prev.generalInfo,
                  subChannelId: e.target.value,
                },
              }))
            }
            helperText={!formData.generalInfo.channelId ? "Required" : ""}
            disabled={!formData.generalInfo.channelId}
            SelectProps={{
              displayEmpty: true,
            }}
          >
            <MenuItem value="">
              {formData.generalInfo.channelId
                ? "Select Sub Channel"
                : "Select Channel First"}
            </MenuItem>

            {channels
              ?.find((c) => c.channelId == formData.generalInfo.channelId)
              ?.subChannels?.map((sub) => (
                <MenuItem key={sub.subChannelId} value={sub.subChannelId}>
                  {sub.subChannelName}
                </MenuItem>
              ))}
          </TextField>
        </div>
      </div>

      <div className="mt-6">
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(index) => setActiveTab(index)}
        />
      </div>

      <div className="bg-white p-4 py-6 rounded-md shadow-md mt-4">
        {productVariantsError && activeTab === 0 && (
          <div className="text-red-500 text-xs mb-2">
            Failed to load products: {productVariantsError.message}
          </div>
        )}
        {activeTab === 0 && (
          <>
            <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-500 font-nunito mb-2">
              <span className="col-span-4">Item / Code</span>
              <span className="col-span-1">Qty</span>
            </div>

            {newProducts.map((product, index) => (
              <ProductItem
                key={product.tempId}
                product={product}
                index={index}
                onProductChange={handleProductChange}
                onDeleteProduct={handleDeleteProduct}
                handleProductCodeChange={handleProductCodeChange}
                autofill={autofill}
                newProducts={newProducts}
                onProductFocus={handleProductFocus}
                onProductBlur={handleProductBlur}
                activeProductIndex={activeProductIndex}
                // mode={mode}
              />
            ))}

            {activeProductIndex !== null && autofill.length > 0 && (
              <div
                className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-[100px] overflow-y-auto no-scrollbar-arrows"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
              >
                {autofill.map((suggestion) => (
                  <div
                    key={suggestion.productVariantId}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleAutofillClick(activeProductIndex, suggestion)}
                  >
                    <p className="font-semibold text-black">
                      {suggestion.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {suggestion.productCode}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddProduct}
              className="flex items-center gap-2 p-2 mt-2 text-blue-500 hover:text-blue-600 bg-transparent"
            >
              <span className="text-xl">+</span>
              <span className="text-sm font-semibold">Add Product</span>
            </button>
          </>
        )}

        {activeTab === 1 && (
          <>
            <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-500 font-nunito mb-2">
              <span className="col-span-3">Service Description</span>
              <span className="col-span-1 text-center">Qty</span>
              <span className="col-span-1 text-right">Price</span>
            </div>

            {newServices.map((service, index) => (
              <ServiceItem
                key={service.tempId}
                service={service}
                index={index}
                onServiceChange={handleServiceChange}
                onDeleteService={handleDeleteService}
              />
            ))}

            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center gap-2 p-2 mt-2 text-blue-500 hover:text-blue-600 bg-transparent"
            >
              <span className="text-xl">+</span>
              <span className="text-sm font-semibold">Add Service</span>
            </button>
          </>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="my-4 w-full flex justify-between">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.generalInfo.applyDiscount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  generalInfo: {
                    ...prev.generalInfo,
                    applyDiscount: e.target.checked,
                    discountAmount: e.target.checked
                      ? prev.generalInfo.discountAmount
                      : "",
                  },
                }))
              }
            />
          }
          label="Apply Discount"
        />
        {formData.generalInfo.applyDiscount && (
          <div className="mb-4 w-20">
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="%"
              value={formData.generalInfo.discountAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  generalInfo: {
                    ...prev.generalInfo,
                    discountAmount: Number(e.target.value),
                  },
                }))
              }
              InputProps={{ inputProps: { min: 0 } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
