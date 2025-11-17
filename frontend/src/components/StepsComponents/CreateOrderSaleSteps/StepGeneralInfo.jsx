import { useState, useRef, useEffect } from "react";
import FilterTabs from "../../globalComponents/FilterTabs";
import { PopupOkay, PopupError } from "../../globalComponents/PopupComp";
import Button from "../../globalComponents/Button";
import { Autocomplete, TextField } from "@mui/material";

const ProductItem = ({ product, index, onProductChange, onDeleteProduct, onProductFocus, onProductBlur, activeProductIndex, mode, autofill, newProducts, handleProductCodeChange}) => {
   
    const isFocused = activeProductIndex === index;
    const isEditMode = mode === 'edit';
    const isProductSet = !!product.productName && product.productName.trim().length > 0;
    const isNewlyAddedAndBlank = !isProductSet && product.tempId && product.productCode === ""; 
    const showFinalDisplay = (isEditMode || isProductSet) && !isFocused;
    const showInput = isFocused || !isProductSet;

    return (
        <div className="grid grid-cols-6 items-end gap-4 py-[4px] bg-transparent rounded-lg">

            <div className="col-span-4 relative flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                    {product.productName || "Product Name"}
                </p>
                <Autocomplete
                    options={autofill}
                    getOptionLabel={(option) => option.productName || ""}
        
                    value={newProducts[index].product || null} 
                    onChange={(event, newValue) => handleAutofillClick(index, newValue)}
    
                    inputValue={newProducts[index].productCode || ""} 
                    
                    blurOnSelect

                    onInputChange={(event, newInputValue) => handleProductCodeChange(index, newInputValue)}
                    
                    isOptionEqualToValue={(option, value) => option.productId === value?.productId}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Search by code or name" variant="outlined" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
            </div>
        </div>
    );
};

const ServiceItem = ({ service, index, onServiceChange, onDeleteService }) => {
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
      
      <div className="col-span-2">
        <input
          type="number"
          name="price"
          value={service.price}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
        </button>
      </div>
    </div>
  );
};


export default function StepGeneralInfo({ formData, setFormData, errors = {}, getValidationStatus = () => {}}) {
    console.log("formData:", formData);
    const token = localStorage.getItem('token'); 

    const [activeTab, setActiveTab] = useState(0);
    const [newServices, setNewServices] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const bottomRef = useRef(null);

    const [autofill, setAutofill] = useState([]);
    const [activeProductIndex, setActiveProductIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({});

    const [channels, setChannels] = useState([]);
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('/api/products',{
            headers : {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setAutofill(data)
        })
    }, [])

    useEffect(() => {
        async function fetchChannels() {
            try {
                const res = await fetch("/api/sales/channels", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                console.log("Status:", res.status);

                const data = await res.json();
                console.log("DATA:", data);

                setChannels(data);
            } catch (error) {
                console.error("Error loading channels:", error);
            } finally {
                setLoadingChannels(false);
            }
        }

        fetchChannels();
    }, []);

    const tabs = [
        { label: "Products" },
        { label: "Services" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        const nameParts = name.split("."); 

        setFormData(prev => {
            let updated = { ...prev };
            let current = updated;

            for (let i = 0; i < nameParts.length - 1; i++) {
            const part = nameParts[i];
            current[part] = { ...current[part] }; 
            current = current[part];
            }

            current[nameParts[nameParts.length - 1]] = value;

            return updated;
        });

        // if (errors[name]) {
        //     setErrors(prev => {
        //     const newErrors = { ...prev };
        //     delete newErrors[name];
        //     return newErrors;
        //     });
        // }

    };

    const handleAddProduct = () => {
        const newBlankProduct = {
        productCode: "",
        quantitySold: 1,
        productName: "", 
        sellingPrice: 0,
        tempId: Date.now(), 
        };
        setNewProducts([...newProducts, newBlankProduct]);
        setHasAddedProduct(true);
    };

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProducts = [...newProducts];
        const currentProduct = updatedProducts[index];
        
        if (name === 'product') {
            updatedProducts[index] = value;
        } else {
            const currentProduct = updatedProducts[index];
            let newProductState = { ...currentProduct, [name]: value };
            if (name === 'productCode' && value !== currentProduct.productCode) {
                newProductState = {
                    ...currentProduct,      
                    productCode: value,     
                    productName: "",        
                    sellingPrice: 0,        
                    initialStock: 0,
                };
            }
            updatedProducts[index] = newProductState;
        }
        setNewProducts(updatedProducts);
    };

    const handleProductCodeChange = (index, newInputValue) => {
        setNewProducts(prev => {
            const updated = [...prev];
            updated[index].productCode = newInputValue;
            return updated;
        });
    };

    const handleDeleteProduct = (indexToRemove) => {
        setNewProducts(newProducts.filter((_, index) => index !== indexToRemove));
    };

    const handleAddService = () => {
        if (activeTab !== 1) return;
        const newBlankService = {
            serviceName: "",
            price: 0,
            tempId: Date.now(), 
        };
        setNewServices([...newServices, newBlankService]);
        setHasAddedProduct(true); 
    };

    const handleServiceChange = (index, e) => {
        const { name, value } = e.target;
        const updatedServices = [...newServices];
        
        updatedServices[index] = { 
        ...updatedServices[index], 
        [name]: name === 'price' ? parseFloat(value) || 0 : value
        };
        setNewServices(updatedServices);
    };


    const handleDeleteService = (indexToRemove) => {
        setNewServices(newServices.filter((_, index) => index !== indexToRemove));
    };

    const handleProductFocus = (index) => {
        setActiveProductIndex(index);
    };

    const handleProductBlur = () => {
        setActiveProductIndex(null);
    };


    const handleAutofillClick = (index, selectedProduct) => {
        if (!selectedProduct) return;

        setNewProducts(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                product: selectedProduct,
                productName: selectedProduct.productName,
                productCode: selectedProduct.productCode,
                sellingPrice: selectedProduct.sellingPrice,
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
          name="customerName"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="Enter customer name"
        />
      </div>

      

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Order Date</div>
        <input
          type="date"
          name="orderDate"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Payment Term</div>
        <select
          name="paymentTerm"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">Select Payment Term</option>
          <option value="immediate">Immediate</option>
          <option value="net7">Net 7</option>
          <option value="net14">Net 14</option>
          <option value="net30">Net 30</option>
        </select>
      </div>

    <div className="flex gap-3">
        <div className="mb-4 w-full">
            <div className="text-sm mb-1 font-nunito font-bold">Channel</div>

            <select
                value={formData.generalInfo.channelId?.toString() ?? ""}
                onChange={(e) =>
                setFormData((prev) => ({
                    ...prev,
                    generalInfo: {
                    ...prev.generalInfo,
                    channelId: e.target.value === "" ? null : parseInt(e.target.value),
                    subChannelId: null,
                    },
                }))
                }
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                disabled={loadingChannels}
            >
                <option value="">Select Channel</option>

                {channels.map((ch) => (
                <option key={ch.channelId} value={ch.channelId}>
                    {ch.name}
                </option>
                ))}
            </select>
        </div>

        <div className="mb-4 w-full">
            <div className="text-sm mb-1 font-nunito font-bold">Sub Channel</div>

            <select
                name="subChannelId"
                value={formData.generalInfo.subChannelId || ""}
                onChange={(e) =>
                    setFormData((prev) => ({
                        ...prev,
                        generalInfo: {
                            ...prev.generalInfo,
                            subChannelId: e.target.value, 
                        }
                    }))
                }
                disabled={!formData.generalInfo.channelId}  
                className={`w-full p-2 border border-gray-300 rounded-md bg-white ${
                    !formData.generalInfo.channelId ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            >
                <option value="">
                    {formData.generalInfo.channelId ? "Select Sub Channel" : "Select Channel First"}
                </option>
                {(() => {
                    const selected = channels?.find(
                        (c) => c.channelId == formData.generalInfo.channelId
                    );
                    return selected?.subChannels?.map((sub) => (
                        <option key={sub.subChannelId} value={sub.subChannelId}>
                            {sub.subChannelName}
                        </option>
                    ));
                })()}
            </select>
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
                autofill ={autofill}
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
                  width: `${dropdownPosition.width}px`
                }}
              >
                {autofill.map((suggestion) => (
                  <div
                    key={suggestion.productCode}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleAutofillClick(suggestion)}
                  >
                    <p className="font-semibold text-black">{suggestion.productName}</p>
                    <p className="text-sm text-gray-500">{suggestion.productCode}</p>
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
              <span className="col-span-2 text-right">Price</span>
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
    </div>
  );
}
