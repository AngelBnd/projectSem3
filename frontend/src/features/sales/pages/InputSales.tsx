import { useState, useEffect } from "react";
import InputTransactionForm from "../components/InputTransactionForm";
import Button from "../../../components/globalComponents/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { handleDownloadPdf } from "../../../utils/files";
import Invoice from "../components/Invoice";
import type { InvoiceData } from "../../../types";
import type { TransactionProduct } from "../types";

interface LineItem {
  id?: number | string;
  productCode: string;
  quantitySold: number;
  product?: {
    productName?: string;
    sellingPrice?: number | string;
    initialStock?: number | string;
  };
}

export default function InputSales() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, item } = location.state || { mode: "add", item: null };
  const [useDiscount, setUseDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState<number | string>(0);
  const isEditMode = mode === "edit";
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    discount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    name: "",
    subject: "",
    paymentMethod: "Card", // Defaulted on card from selection
    invoiceId: "",
    // subtotal : 0
  });

  const [newProducts, setNewProducts] = useState<TransactionProduct[]>([]);
  const [productDetails] = useState<{
    productName?: string;
    sellingPrice?: number | string;
  } | null>(null);

  // Not updated to invoice yet
  const quantity = parseFloat(String(invoiceData.quantitySold || 0));
  const unitPrice = parseFloat(String(productDetails?.sellingPrice || 0));
  const discountRate = parseFloat(String(invoiceData.discount || 0));
  const subtotal = quantity * unitPrice;
  const totalAmount = subtotal - (subtotal * (discountRate / 100));

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (mode === 'edit' && item && item.lineItems && newProducts.length === 0) {
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

      if (item.discountPrice > 0){
        setUseDiscount(true);
        setDiscountValue(item.discountPrice);
      }

      const existingProducts = item.lineItems.map((line: LineItem, index: number) => {
          const productData = line.product || {};
          const newProductObject: TransactionProduct = {
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
    doc.text(`Invoice Date: ${new Date(invoiceData.invoiceDate ?? "").toLocaleDateString('en-GB')}`, 150, y);
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
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full"> 
        <h1 className="text-2xl font-semibold font-nunito">Create an Order</h1>
        <h3 className="text-[#777B7C] text-sm">Fill in the details to generate a new order</h3>
      </div>

      <div className="col-span-9 md:col-span-4 w-full h-[800px] flex gap-12 relative">
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
      </div>

      <div className="col-span-9 md:col-span-5 flex justify-center items-start h-[800px] overflow-y-auto">
        <div className="bg-[#E9EBF0] w-full p-9 rounded-md flex flex-col gap-2 rounded-md">
          <div className="font-nunito text-lg font-bold">
            Invoice Preview
          </div>
          <Invoice
            invoiceData={invoiceData}
            products={newProducts}
            useDiscount={useDiscount}
            discountValue={discountValue} 
          />
        </div>
      </div>

    </div>
  );
}