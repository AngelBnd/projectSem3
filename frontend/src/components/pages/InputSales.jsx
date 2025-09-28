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
  const isEditMode = mode === "edit";
  const [invoiceData, setInvoiceData] = useState({
    discount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    name: "",
    subject: "",
    paymentMethod: "",
  });

  const [newProducts, setNewProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");


  useEffect(() => {
    // Populate form data for edit mode
    if (isEditMode && item) {
      setInvoiceData({
        discount: item.discount || "",
        invoiceDate: item.invoiceDate || new Date().toISOString().split('T')[0],
      });
      // Set the invoice ID from the item
      setNewProducts(item.lineItems || []);
      setInvoiceId(item.invoiceId);
    } else {
      // 2. Generate and set ID for add mode on initial load
      const uniqueId = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setInvoiceId(uniqueId);
    }
  }, [isEditMode, item]);


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
    doc.text(`Invoice ID: #${invoiceId || "Generating ID..."}`, 10, y);
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
    doc.save(`invoice-${invoiceId}.pdf`);
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
            // 3. Pass the ID down
            invoiceId={invoiceId} 
            newProducts={newProducts}
            setNewProducts={setNewProducts}
          />
        </div>

        {/* INVOICE */}
      <Invoice
        invoiceData={{
            invoiceId: "12345", // A dynamic ID
            invoiceDate: "2025-09-22",
            name: "John Doe",
            subject: "Motorcycle repair",
            paymentMethod: "Cash"
        }}
        products={newProducts}
        useDiscount={true}
        discountValue={10} // As a percentage
    />
      </div>
    </div>
  );
}