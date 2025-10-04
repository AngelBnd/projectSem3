import { useState, useEffect } from "react";
import InputTransactionForm from "../InputTransactionForm";
import Button from "..//Button";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { handleDownloadPdf } from "../../functions/savepdf";
import Invoice from "../Invoice";

export default function InputSales() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, item } = location.state || { mode: "add", item: null };
  const [useDiscount, setUseDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const isEditMode = mode === "edit";
  const [invoiceData, setInvoiceData] = useState({
    discount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    name: "",
    subject: "",
    paymentMethod: "Card", // Defaulted on card from selection
    invoiceId: "",
    // subtotal : 0
  });

  const [newProducts, setNewProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);


  useEffect(() => {
    if (isEditMode && item) {
      setInvoiceData({
        name: item.name || "",
        subject: item.subject || "",
        invoiceId: item.invoiceId,
        discount: item.discountPrice || 0,
        invoiceDate: item.invoiceDate
          ? new Date(item.invoiceDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMethod: item.paymentMethod || "Card",
        // subtotal : item.subtotal || 0
      });

    } else {
      setInvoiceData((prevData) => ({
        ...prevData,
        invoiceId: crypto.randomUUID(),
      }));
    }
  }, [isEditMode, item]);

  // Second effect: run fetch AFTER invoiceData updates
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  //   if (!isEditMode || !invoiceData.invoiceId) return;

  //   console.log("iininini")
  //   console.log(invoiceData.invoiceId)

  //   const fetchLineItems = async () => {
  //     try {
  //       const res = await fetch(
  //         `http://localhost:3000/api/lineitems/${encodeURIComponent(
  //           invoiceData.invoiceId
  //         )}`,{headers}
  //       );
  //       if (!res.ok) throw new Error("Failed to fetch line items");

  //       const data = await res.json();
  //       setNewProducts(data);
  //     } catch (err) {
  //       console.error("Fetch failed:", err);
  //       alert("Failed to get item. Check console/server logs.");
  //     }
  //   };

  //   fetchLineItems();
  // }, [isEditMode, invoiceData.invoiceId]);

  // Not updated to invoice yet
  const quantity = parseFloat(invoiceData.quantitySold || 0);
  const unitPrice = parseFloat(productDetails?.sellingPrice || 0);
  const discountRate = parseFloat(invoiceData.discount || 0);
  const subtotal = quantity * unitPrice;
  const totalAmount = subtotal - (subtotal * (discountRate / 100));

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (mode === 'edit' && item && item.lineItems && newProducts.length === 0) {
        const existingProducts = item.lineItems.map((line, index) => {
            const productData = line.product || {};
            const newProductObject = {
                productCode: line.productCode,
                productName: productData.productName || "",
                quantitySold: line.quantitySold,
                sellingPrice: productData.sellingPrice || 0,
                initialStock: productData.initialStock || line.quantitySold,
                tempId: line.id || line.productCode || `initial-${index}`,
            };
            return newProductObject;
        });
        setNewProducts(existingProducts);
    }
    }, [mode, item]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let y = 10; // Starting Y position

    // Add title
    doc.setFontSize(22);
    doc.text("Invoice", 10, y);
    y += 10;

    // Add company details
    doc.setFontSize(14);
    doc.text("King-Motor", 10, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("Ruko Pd. Lestari, Jl. HOS Cokroaminoto No.19 blok a1,", 10, y);
    y += 5;
    doc.text("Karang Tengah, Kec. Ciledug, Tangerang Kota, Banten 15157", 10, y);
    y += 10;

    // Add invoice number and date
    doc.setFontSize(10);
    doc.text(`Invoice ID: #${invoiceData.invoiceId || "Generating ID..."}`, 10, y);
    doc.text(`Invoice Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}`, 150, y);
    y += 10;

    // Add product details in a structured way
    doc.line(10, y, 200, y); // Draw a line
    y += 5;

    doc.setFontSize(12);
    doc.text("Product Details:", 10, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Product Code: ${invoiceData.productCode || "N/A"}`, 15, y);
    doc.text(`Product Name: ${productDetails?.productName || "N/A"}`, 100, y);
    y += 7;
    doc.text(`Quantity Sold: ${invoiceData.quantitySold || 0}`, 15, y);
    doc.text(`Unit Price: Rp ${formatCurrency(unitPrice)}`, 100, y);
    y += 7;
    doc.text(`Discount: ${invoiceData.discount || 0}%`, 15, y);
    y += 10;
    doc.line(10, y, 200, y);
    y += 5;

    // Add totals
    doc.setFontSize(12);
    doc.text(`Subtotal: Rp ${formatCurrency(subtotal)}`, 150, y);
    y += 7;
    doc.setFontSize(14);
    doc.text(`Total: Rp ${formatCurrency(totalAmount)}`, 150, y);
    y += 10;

    // Save the PDF with a unique filename
    doc.save(`invoice-${invoiceData.invoiceId}.pdf`);
  };

  return (
    <div>
      <div className="text-nunito font-bold text-4xl mb-[16px] text-black pb-10 font-nunito">
        {isEditMode ? "Edit Transaction" : "Add a Transaction"}
      </div>

      <div className=" w-full h-[540px] flex gap-12 relative">
        <div className="w-[50em] h-full ">
          <InputTransactionForm 
            invoiceData={invoiceData} 
            setInvoiceData={setInvoiceData}
            mode={mode} 
            item={item} 
            isEditMode={isEditMode}
            newProducts={newProducts}
            setNewProducts={setNewProducts}
            useDiscount={useDiscount}
            setUseDiscount={setUseDiscount}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
          />
        </div>

        {/* INVOICE */}
      <Invoice
        invoiceData={invoiceData}
        products={newProducts}
        useDiscount={useDiscount}
        discountValue={discountValue} // As a percentage
    />
      </div>
    </div>
  );
}