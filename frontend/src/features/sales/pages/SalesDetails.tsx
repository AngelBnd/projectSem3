import { useState, useEffect } from "react";
import InputTransactionForm from "../components/InputTransactionForm";
import Button from "../../../components/globalComponents/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import Invoice from "../components/Invoice";
import InvoiceTimeline from "../components/InvoiceTimeline";
import type { InvoiceData } from "../../../types";
import type { TransactionProduct } from "../types";

export default function SalesDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState<TransactionProduct[]>([]);
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
  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full"> 
        <h1 className="text-2xl font-semibold font-nunito">INV-123123 Details</h1>
        <h3 className="text-[#777B7C] text-sm">Create an Invoice</h3>
      </div>

      <div className="col-span-9 md:col-span-4 w-full h-[800px] flex gap-12 relative">
        <div className="w-[50em] h-full ">
            <InvoiceTimeline/>
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