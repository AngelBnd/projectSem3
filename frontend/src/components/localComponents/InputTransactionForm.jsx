import { useState, useEffect } from "react";
import Button from '../globalComponents/Button'; 
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useDebounce } from "../globalComponents/Debounce";
import { usePopup } from "../globalComponents/PopupContext";
import { PopupOkay, PopupError } from "../globalComponents/PopupComp";

// New component for individual product item in the list
const ProductItem = ({ product, index, onProductChange, onDeleteProduct, onProductFocus, onProductBlur, activeProductIndex, mode}) => {
   
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
             
                {/* Product Code Input */}
                <input
                type="text"
                name="productCode"
                value={product.productCode}
                onChange={(e) => onProductChange(index, e)}
                onFocus={(e) => onProductFocus(index, e)}
                onBlur={onProductBlur}
                placeholder="Search by code or name"
                autoComplete="off"
                className={`w-full p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
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

export default function InputTransactionForm({ mode, item, isEditMode, invoiceData, setInvoiceData, newProducts, setNewProducts, useDiscount, setUseDiscount, discountValue, setDiscountValue }) {
    const [hasAddedProduct, setHasAddedProduct] = useState(false);
    const formRef = useRef(null);
    const bottomRef = useRef(null);
    const navigate = useNavigate();

    // const { openPopup } = usePopup();

    const [autofill, setAutofill] = useState([]);
    const [activeProductIndex, setActiveProductIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({});
    
    const activeProductCode = newProducts[activeProductIndex]?.productCode;
    const debounceProduct = useDebounce(activeProductCode, 300);

    useEffect(() => {
        const fetchAutofill = async () => {
            if (debounceProduct !== newProducts[activeProductIndex]?.productCode) {
                return; 
            }

            console.log("Debounced:", debounceProduct);
            console.log("Active Item:", newProducts[activeProductIndex]);

            if(!debounceProduct || debounceProduct.trim().length === 0) {
                setAutofill([]);
                return;
            }

            const token = localStorage.getItem("token");
            const url = `http://localhost:3000/api/inventory/search?q=${encodeURIComponent(debounceProduct)}`;

            try {
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    const exactMatch = data.find(p => p.productCode.toLowerCase() === debounceProduct.toLowerCase());
                    const isInputFilled = !!newProducts[activeProductIndex]?.productName;

                    if(exactMatch && !isInputFilled) {
                        handleAutofillClick(exactMatch);
                    } else {
                        setAutofill(data);
                    }
                } else {
                    // Log errors for debugging the backend connection
                    console.error("API Search Failed:", response.status, await response.text());
                    setAutofill([]);
                }
            } catch(error) {
                console.error("Network or Fetch Error:", error);
                setAutofill([]);
            }
        };
        
        if(activeProductIndex !== null) {
            fetchAutofill();
        }

    }, [debounceProduct, activeProductIndex]);

    const handleProductFocus = (index, event) => {
        // Get the input's position on the screen
        const rect = event.target.getBoundingClientRect();
        const formRect = formRef.current?.getBoundingClientRect();
        if (formRect && rect) {
            setDropdownPosition({
                top: rect.bottom - formRect.top + formRef.current.scrollTop,
                left: rect.left - formRect.left, 
                width: rect.width,
            });
        }
        
        setActiveProductIndex(index);
    };

    useEffect(() => {
        if (activeProductIndex !== null && newProducts[activeProductIndex]) {
            console.log("%cState has been updated. New Active Item:", "color: green; font-weight: bold;", newProducts[activeProductIndex]);
        }
    }, [newProducts, activeProductIndex]);

    const handleProductBlur = () => {
        setTimeout(() => {
        setActiveProductIndex(null);
        }, 200);
    };

    const handleAutofillClick = (suggest) => {
        const updatedProductData = {
            productCode: suggest.productCode,
            productName: suggest.productName,
            quantitySold: newProducts[activeProductIndex]?.quantitySold || 1, // Default to 1
            sellingPrice: suggest.sellingPrice,
            initialStock: suggest.initialStock, // Store stock for later validation
            tempId: newProducts[activeProductIndex].tempId, // Keep the original tempId
        };
        handleProductChange(activeProductIndex, { target: { name: 'product', value: updatedProductData } });
        setAutofill([]); // Clear suggestions
    };

    const handleAddProduct = () => {
        const newBlankProduct = {
        productCode: "",
        quantitySold: 1,
        productName: "", // Will be filled in after validation
        sellingPrice: 0,
        // Use a temporary key for React until a real ID is available
        tempId: Date.now(), 
        };
        setNewProducts([...newProducts, newBlankProduct]);
        setHasAddedProduct(true);
    };

    useEffect(() => {
    // Only run the scroll effect if a product has been added
    if (hasAddedProduct) {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
            setHasAddedProduct(false); // Reset the state after scrolling
        }
    }, [newProducts, hasAddedProduct]); // Add both dependencies

    const handleDeleteProduct = (indexToRemove) => {
        setNewProducts(newProducts.filter((_, index) => index !== indexToRemove));
    };

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        console.log("right hereasdasasdasd")
        console.log(name)
        console.log(value)
        const updatedProducts = [...newProducts];
        if (name === 'product') {
            updatedProducts[index] = value;
        } else {
            const currentProduct = updatedProducts[index];
            let newProductState = { ...currentProduct, [name]: value };
            if (name === 'productCode' && value !== currentProduct.productCode) {
                newProductState = {
                    ...currentProduct,      // Keep tempId and quantitySold
                    productCode: value,     // Update with the user's new input
                    productName: "",        // Reset product name
                    sellingPrice: 0,        // Reset selling price
                    initialStock: 0,// Reset initial stock
                };
            }
            updatedProducts[index] = newProductState;
        }
        setNewProducts(updatedProducts);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newProducts.length === 0) {
            return openPopup(<PopupError message="Please add at least one product." />, null, 2500);;
        };

        try {
            // --- 1. NORMALIZE and VALIDATE PRODUCTS ---
            const normalizedProducts = newProducts.reduce((acc, product) => {
                const code = product.productCode;
                const quantity = parseInt(product.quantitySold, 10);
                const price = parseFloat(product.sellingPrice) || 0;

                // Basic validation checks (stop processing if an item is invalid)
                if (!code || code.trim().length === 0 || isNaN(quantity) || quantity <= 0) {
                    throw new Error("One or more products are incomplete or invalid.");
                }
                if (product.initialStock < quantity) {
                    return openPopup(<PopupError message={`Not enough stock for "${product.productName}". Only ${product.initialStock} available.`}/>, null, 2000);
                }
                
                // If the product code is already in the accumulator, merge the quantities
                if (acc[code]) {
                    acc[code].quantitySold += quantity;
                } else {
                    // Otherwise, add the new unique product entry
                    acc[code] = {
                        productCode: code,
                        quantitySold: quantity,
                        sellingPrice: price, // ADDED: Required for backend validation/calculation
                    };
                }
                return acc;
            }, {});

            // Convert the normalized object back into an array for the backend payload
            const validatedProducts = Object.values(normalizedProducts);
            
            // If the normalized array is empty after validation (should be caught by the length check, but for safety)
            if (validatedProducts.length === 0) {
                 throw new Error("No valid products were submitted.");
            }

            // --- 2. Build the final invoice payload ---
            const finalInvoice = {
                ...invoiceData,
                discount: useDiscount ? discountValue : 0,
                // The 'products' array now has unique productCode entries
                products: validatedProducts, 
            };

            
            const url =
            mode === "edit"
                ? `http://localhost:3000/api/sales/${item.invoiceId}`
                : "http://localhost:3000/api/sales";

            const method = mode === "edit" ? "PUT" : "POST";

            const token = localStorage.getItem("token");
            const response = await fetch(url, { 
                method: `${method}`, 
                headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(finalInvoice),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to save the transaction.");
            }
            
            const AUTO_CLOSE_MS = 2500; 

            const navigateBack = () => {
                setTimeout(() => {
                    navigate(-1);
                }, 1000); 
            };

            if(response.ok) {
                openPopup(
                    <PopupOkay message="Transaction saved successfully! Returning to list..." />, 
                    navigateBack(),
                    AUTO_CLOSE_MS // Duration
                );
            }
            

        } catch (error) {
            alert(`Failed to save: ${error.message}`);
        }
    };

    useEffect(() => {
        if (!isEditMode) {
        setInvoiceData(prevData => ({
            ...prevData,
            invoiceId: crypto.randomUUID()
        }));
    }
    }, [isEditMode, setInvoiceData]);

    const handleCancel = () => {
        navigate(-1);
    };

    const handleDiscountChange = (e) => {
        const value = event.target.value;
        const numericValue = Number(value);

        if (numericValue > 100) {
            setDiscountValue('100');
        } 
        else if (numericValue < 0) {
            setDiscountValue('0');
        } 
        else {
            setDiscountValue(value);
        }
    };

    useEffect(()=>{
        console.log(item)
    },[item])

    // The form's overall layout and styling based on the screenshot
    return (
        <div className="flex flex-col h-full">
            <form ref={formRef} onSubmit={handleSubmit} className="relative flex flex-col flex-grow gap-4 overflow-y-auto custom-scrollbar">
                <div className="bg-white p-4 py-6 rounded-md shadow-md">  
                    <div className="font-nunito text-lg font-bold mb-4">
                        Order Details
                    </div>
                    {/* General Information Section */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-black font-nunito">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={invoiceData.name || ""}
                                onChange={(e) => setInvoiceData({ ...invoiceData, name: e.target.value })}
                                className="border p-2 rounded-xl w-full text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-black"
                                placeholder="Name"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-black font-nunito">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={invoiceData.subject || ""}
                                onChange={(e) => setInvoiceData({ ...invoiceData, subject: e.target.value })}
                                className="border p-2 rounded-xl w-full text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
                                placeholder="Subject"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-black font-nunito">Invoice Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="invoiceDate"
                                    value={invoiceData.invoiceDate || ""}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                                    className="border p-2 rounded-xl w-full text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
                                />
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
                                    00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                                </svg>
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-black font-nunito">Payment Method</label>
                            <select
                                name="paymentMethod"
                                value={invoiceData.paymentMethod || ""}
                                onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
                                className="border p-2 rounded-xl w-full text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
                            >
                            
                                <option value="Card">Card</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Section */}
                <div className="bg-white p-4 py-6 rounded-md shadow-md">  

                        <h2 className="text-xl font-semibold text-black mb-2  font-nunito">Product</h2>
                        <div className="grid grid-cols-6 px-0 gap-4 text-sm font-semibold text-gray-500 font-nunito">
                            <span className="col-span-4 font-nunito">Item</span>
                            <span className="col-span-1">Qty</span>
                        </div>
                        
                        {/* The new structure for products */}
                        {newProducts.map((product, index) => (
                            <ProductItem
                                key={product.tempId}
                                product={product}
                                index={index}
                                onProductChange={handleProductChange}
                                onDeleteProduct={handleDeleteProduct}
                                onProductFocus={handleProductFocus}
                                onProductBlur={handleProductBlur}
                                activeProductIndex={activeProductIndex}
                                mode = {mode}
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
                            className="flex items-center gap-2 p-2 mt-2 text-blue-500 hover:text-blue-600 bg-transparent focus:outline-none"
                        >
                            <span className="text-xl">+</span>
                            <span className="text-sm font-semibold">Add Product</span>
                        </button>
                <div ref={bottomRef} />
                </div>
            </form>

            {/* Fixed bottom section for Discount and Buttons */}
            <div className="p-4 mt-4  border-t-2 ">
                <div className="flex items-center gap-2 mb-4">
                  <input
                      type="checkbox"
                      checked={useDiscount}
                      onChange={(e) => setUseDiscount(e.target.value)}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 checked:bg-blue-600 checked:border-transparent"
                  />
                    <label className="text-sm font-semibold text-black p-2">Add Discount</label>
                    {useDiscount && (
                        <input
                            type="number"
                            name="discount"
                            value={discountValue}
                            onChange={handleDiscountChange}
                            placeholder="Discount(%)"
                            className=" border p-1 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white placeholder:px-1 ml-auto text-black"
                        />
                    )}
                </div>

                {/* Buttons are now inside the fixed bottom container */}
                <div className="flex justify-between w-full">
                    <Button
                        type="submit"
                        className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-2xl hover:bg-blue-600 transition-colors"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                    <div
                        onClick={handleCancel}
                        className="flex items-center justify-center flex-1 px-3 text-sm text-black underline cursor-pointer hover:text-gray-600"
                    >
                        Cancel
                    </div>
                </div>
            </div>
        </div>
    );
}