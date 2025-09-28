import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useDebounce } from "./Debounce";


// New component for individual product item in the list
const ProductItem = ({ product, index, onProductChange, onDeleteProduct, onProductFocus, onProductBlur }) => {
    return (
        <div className="grid grid-cols-5 items-center gap-4 p-2 bg-transparent rounded-lg">
        {/* Product Code Input */}
        <div className="col-span-2 relative">
            <input
            type="text"
            name="productCode"
            value={product.productCode}
            onChange={(e) => onProductChange(index, e)}
            onFocus={(e) => onProductFocus(index, e)}
            onBlur={onProductBlur}
            placeholder="Search by code or name"
            autoComplete="off"
            className="w-full p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
        </div>

        <div className="col-span-1">
            <p className="text-sm text-gray-600 px-2">{product.productName || "..."}</p>
        </div>

        <div className="col-span-1">
            <input
            type="number"
            name="quantitySold"
            value={product.quantitySold}
            onChange={(e) => onProductChange(index, e)}
            className="w-20 p-2 text-center border rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
            min="1"
            />
        </div>

        <div className="col-span-1 flex justify-end">
            <button
            type="button"
            onClick={() => onDeleteProduct(index)}
            className="p-2 text-red-500 rounded-10 hover:bg-red-100 bg-transparent"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
            </button>
        </div>
        </div>
    );
};

export default function InputTransactionForm({ mode, item, isEditMode, invoiceData, setInvoiceData, newProducts, setNewProducts }) {
    const [hasAddedProduct, setHasAddedProduct] = useState(false);
    const bottomRef = useRef(null);
    const navigate = useNavigate();
    const [useDiscount, setUseDiscount] = useState(false);
    const [discountValue, setDiscountValue] = useState(0);

    const [autofill, setAutofill] = useState([]);
    const [activeProductIndex, setActiveProductIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [isAutofillShown, setIsAutofillShown] = useState(false);
    
    const activeProductCode = newProducts[activeProductIndex]?.productCode;
    const debounceProduct = useDebounce(activeProductCode, 300);

    useEffect(() => {
        const fetchAutofill = async () => {
            console.log("Debounced:", debounceProduct);
            console.log("Active Item:", newProducts[activeProductIndex]);
            if(debounceProduct && debounceProduct !== newProducts[activeProductIndex]?.productName) {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:3000/api/inventory/search?q=${debounceProduct}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setAutofill(data);
                }
            } else {
                setAutofill([]);
            }
        };
        fetchAutofill();
    }, [debounceProduct]);

    const handleProductFocus = (index, event) => {
        // Get the input's position on the screen
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        });
        setActiveProductIndex(index);
    };

    const handleProductBlur = () => {
        // Hide dropdown on blur, with a delay to allow clicks on suggestions
        setTimeout(() => {
        setActiveProductIndex(null);
        }, 200);
    };

    const handleAutofillClick = (suggest) => {
        const updatedProductData = {
            productCode: suggest.productCode,
            productName: suggest.productName,
            quantitySold: 1, // Default to 1
            sellingPrice: suggest.sellingPrice,
            initialStock: suggest.initialStock, // Store stock for later validation
            tempId: newProducts[activeProductIndex].tempId, // Keep the original tempId
        };
        handleProductChange(activeProductIndex, { target: { name: 'product', value: updatedProductData } });
        setAutofill([]); // Clear suggestions
        setActiveProductIndex(null);
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
    const updatedProducts = [...newProducts];
    if (name === 'product') {
        updatedProducts[index] = value;
    } else {
        updatedProducts[index] = { ...updatedProducts[index], [name]: value };
    }
    setNewProducts(updatedProducts);
  };

    const handleSubmit = async (event) => {
    event.preventDefault();
    if (newProducts.length === 0) {
      return alert("Please add at least one product.");
    }
    try {
      // Validation now happens on the client-side using the data
      // you already gathered from the autocomplete search.
      const validatedProducts = newProducts.map(product => {
        if (!product.productCode || !product.productName) {
          throw new Error("One or more products are invalid. Please select from the dropdown.");
        }
        if (product.initialStock < product.quantitySold) {
          throw new Error(`Not enough stock for "${product.productName}". Only ${product.initialStock} available.`);
        }
        return {
          productCode: product.productCode,
          quantitySold: parseInt(product.quantitySold, 10),
        };
      });

      const finalInvoice = {
        ...invoiceData,
        discount: useDiscount ? discountValue : 0,
        products: validatedProducts, // This key name must match the backend
      };
      
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:3000/api/sales', { 
         method: 'POST', 
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
      
      alert("Transaction saved successfully!");
      navigate(-1); // Go back to the previous page

    } catch (error) {
      alert(`Failed to save: ${error.message}`);
    }
  };

    useEffect(() => {
    if (isEditMode && item) {
      if (item.discount > 0) {
        setUseDiscount(true);
        setDiscountValue(item.discount || 0);
      }
      const existingProducts = item.lineItems.map(line => ({
        ...line.product, // Contains quantitySold, etc.
        ...line, // Contains productCode, productName, etc.
        tempId: line.id || line.productCode,
      }));
      setNewProducts(existingProducts);
    }
    }, [isEditMode, item, setNewProducts]);

    const handleCancel = () => {
        navigate(-1);
    };

    const handleDiscountChange = (e) => {
        setDiscountValue(e.target.value);
    };

    // The form's overall layout and styling based on the screenshot
    return (
        <div className="flex flex-col h-full">
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-4 p-4 overflow-y-auto custom-scrollbar">
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
                           
                            <option value="card">Card</option>
                            <option value="cash">Cash</option>
                        </select>
                    </div>
                </div>

                {/* Product Section */}
                <div className="flex flex-col gap-2 mt-4 border-t-2 pt-5">
                    <h2 className="text-xl font-semibold text-black mb-2  font-nunito">Product</h2>
                    <div className="grid grid-cols-4 px-4 text-sm font-semibold text-gray-500 font-nunito">
                        <span className="col-span-3 font-nunito">Item</span>
                        <span className="col-span-1 mx-auto">Qty</span>
                    </div>
                    {/* The new structure for products */}
                    {newProducts.map((product, index) => (
                        <ProductItem
                            key={product.tempId || product.productCode}
                            product={product}
                            index={index}
                            onProductChange={handleProductChange}
                            onDeleteProduct={handleDeleteProduct}
                            onProductFocus={handleProductFocus}
                            onProductBlur={handleProductBlur}
                        />
                    ))}
                    {activeProductIndex !== null && autofill.length > 0 && (
                        <div
                        className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-20"
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
                            onMouseDown={() => handleSuggestionClick(suggestion)}
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
                </div>
                <div ref={bottomRef} />
            </form>

            {/* Fixed bottom section for Discount and Buttons */}
            <div className="p-4 mt-4  border-t-2 ">
                <div className="flex items-center gap-2 mb-4">
                  <input
                      type="checkbox"
                      checked={useDiscount}
                      onChange={(e) => setUseDiscount(e.target.checked)}
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