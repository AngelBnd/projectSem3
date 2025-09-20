import { useState, useEffect } from "react";
import InputTransactionForm from "../InputTransactionForm";
import Button from "..//Button";
import { useLocation, useNavigate } from "react-router-dom";

export default function InputSales() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, item } = location.state || { mode: "add", item: null };
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    productCode: "",
    quantitySold: "",
    discount: "",
    tax: "",
    invoiceDate: new Date().toISOString().split('T')[0],
  });

  const [productDetails, setProductDetails] = useState(null);
  // 1. New state for the generated ID
  const [invoiceId, setInvoiceId] = useState("");

  useEffect(() => {
    // Populate form data for edit mode
    if (isEditMode && item) {
      setFormData({
        productCode: item.productCode || "",
        quantitySold: item.quantitySold || "",
        discount: item.discount || "",
        tax: item.tax || "",
        invoiceDate: item.invoiceDate || new Date().toISOString().split('T')[0],
      });
      // Set the invoice ID from the item
      setInvoiceId(item.invoiceId);
      fetchProductDetails(item.productCode);
    } else {
      // 2. Generate and set ID for add mode on initial load
      const uniqueId = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setInvoiceId(uniqueId);
    }
  }, [isEditMode, item]);

  useEffect(() => {
    if (formData.productCode) {
      fetchProductDetails(formData.productCode);
    }
  }, [formData.productCode]);

  const fetchProductDetails = async (productCode) => {
    try {
      const response = await fetch(`http://localhost:3000/api/inventory/${productCode}`);
      const data = await response.json();
      if (response.ok) {
        setProductDetails(data);
      } else {
        setProductDetails(null);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDetails(null);
    }
  };

  const quantity = parseFloat(formData.quantitySold || 0);
  const unitPrice = parseFloat(productDetails?.sellingPrice || 0);
  const discountRate = parseFloat(formData.discount || 0);
  const taxRate = parseFloat(formData.tax || 0);
  const subtotal = quantity * unitPrice;
  const discountedAmount = subtotal - (subtotal * (discountRate / 100));
  const totalAmount = discountedAmount + (discountedAmount * (taxRate / 100));

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(()=>{
    console.log(productDetails);
  },[productDetails])

  return (
    <div>
      <div className="text-nunito font-bold text-4xl mb-[16px] text-black pb-10 font-nunito">
        {isEditMode ? "Edit Transaction" : "Add a Transaction"}
      </div>

      <div className=" w-full h-[560px] flex gap-12">
        <div className="w-full h-full ">
          <InputTransactionForm 
            formData={formData} 
            setFormData={setFormData}
            mode={mode} 
            item={item} 
            isEditMode={isEditMode}
            // 3. Pass the ID down
            invoiceId={invoiceId} 
            setProductDetails={setProductDetails}
          />
        </div>

        {/* INVOICE */}
        <div className="w-full h-full "> 
          <div className="bg-white rounded-lg shadow text-black px-6 py-6 w-full">
            <div className="font-bold text-xl mb-1">Invoice</div>
            <div className="text-gray-500 text-sm mb-3">
              {/* 4. Display the ID from state */}
              #{invoiceId || "Generating ID..."}
            </div>
            <hr className="my-3" />
            <div className="font-bold">King-Motor</div>
            <div className="text-sm mb-3">
              Ruko Pd. Lestari, Jl. HOS Cokroaminoto No.19 blok a1,<br />
              Karang Tengah, Kec. Ciledug, Tangerang Kota, Banten 15157
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Invoice Date</span>
              <span>
                {new Date(formData.invoiceDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
            <hr className="my-3" />
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Product Code</span>
                <span>{formData.productCode || "XXXXX"}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Name</span>
                <span>{productDetails?.productName || "Product not found"}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity Sold</span>
                <span>{formData.quantitySold || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price</span>
                <span>Rp {formatCurrency(unitPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{formData.discount || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formData.tax || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>SubTotal</span>
                <span>Rp {formatCurrency(subtotal)}</span>
              </div>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span className="text-black">Rp {formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-center">
              <Button className="px-6">Download invoice</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}