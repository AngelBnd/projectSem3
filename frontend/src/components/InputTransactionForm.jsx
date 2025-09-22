import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";


// New component for individual product item in the list
const ProductItem = ({ product, index, handleProductChange, handleDeleteProduct }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-nunito">
            <div className="flex-1">
                <p className="font-semibold text-gray-800 ">{product.name || "someProductName"}</p>
                <p className="text-sm text-gray-500">Rp {product.price ? product.price.toLocaleString('id-ID') : "200.000,-"}</p>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, e)}
                    className="w-12 p-2 text-center border focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md bg-white text-black"
                    placeholder="Qty"
                    min="1"
                />
                <input
                    type="number"
                    name="tax"
                    value={product.tax}
                    onChange={(e) => handleProductChange(index, e)}
                    className="w-12 p-2 text-center border focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md bg-white text-black"
                    placeholder="Tax"
                    min="0"
                />
                <button
                    type="button"
                    onClick={() => handleDeleteProduct(index)}
                    className="p-2 text-red-500 bg-transparent rounded-full hover:bg-red-100"
                >
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
            </div>
        </div>
    );
};

export default function InputTransactionForm({ mode, item, isEditMode, formData, setFormData, setProductDetails }) {
    
  const bottomRef = useRef(null);
  const navigate = useNavigate();
    const [products, setProducts] = useState([
        { id: 1, name: "", price: 200000, quantity: 3, tax: 20 },
        { id: 2, name: "", price: 200000, quantity: 3, tax: 20 },
        { id: 3, name: "", price: 200000, quantity: 3, tax: 20 }
    ]);
    const [useDiscount, setUseDiscount] = useState(false);
    const [discountValue, setDiscountValue] = useState(0);

    const handleAddProduct = () => {
        setProducts(prev => [...prev, { id: prev.length + 1, name: "", price: 200000, quantity: 1, tax: 0 }]);
    };

    useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    }, [products]); 

    const handleDeleteProduct = (index) => {
        setProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductChange = (index, e) => {
        const { name, value } = e.target;
        const newProducts = [...products];
        newProducts[index][name] = value;
        setProducts(newProducts);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would handle the form submission logic for the new structure.
        // This includes processing the products array, discount, and other form fields.
        console.log("Form Submitted:", {
            name: formData.name,
            subject: formData.subject,
            invoiceDate: formData.invoiceDate,
            paymentMethod: formData.paymentMethod,
            products,
            useDiscount,
            discountValue
        });
        // navigate back
        window.history.back();
    };

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
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="border p-2 rounded-xl w-full text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-black"
                            placeholder="Name"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-black font-nunito">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject || ""}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                                value={formData.invoiceDate || ""}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
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
                            value={formData.paymentMethod || ""}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                        <span className="col-span-2 font-nunito">Item</span>
                        <span className="ml-8">Qty</span>
                        <span className="">Tax</span>
                    </div>
                    {/* The new structure for products */}
                    {products.map((product, index) => (
                        <ProductItem
                            key={product.id}
                            product={product}
                            index={index}
                            handleProductChange={handleProductChange}
                            handleDeleteProduct={handleDeleteProduct}
                        />
                    ))}
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