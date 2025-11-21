import React, { useMemo, useEffect } from "react";

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "Rp 0,-";

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount).replace(/^Rp/, "Rp ").trim() + ",-";
};

export default function StepReview({newProducts = [], newServices = [], formData = {}, setFormData}) {
  const products = newProducts;
  const services = newServices;
  const data = formData;

  useEffect(()=>{
    console.log(formData)
  },[formData])


  const discountRate = Number(data.generalInfo?.discountAmount || 0) / 100;

  const { subtotal, totalAmount } = useMemo(() => {
    const productsSubtotal = newProducts.reduce(
      (sum, p) => sum + (Number(p.sellingPrice) || 0),
      0
    );
    const servicesSubtotal = newServices.reduce(
      (sum, s) => sum + (Number(s.sellingPrice)|| 0),
      0
    );

    const calculatedSubtotal = productsSubtotal + servicesSubtotal;
    const calculatedTotal = calculatedSubtotal * (1 - discountRate);


    setFormData(prev => ({
      ...prev,  
      totals : {
        discount : Number(data.generalInfo?.discountAmount),
        subtotal : calculatedSubtotal,
        totalAmount : calculatedTotal
      }
    }))
    return {
      subtotal: calculatedSubtotal,
      totalAmount: calculatedTotal,
    };

  }, [newProducts, newServices, discountRate]);

  return (
    <div className="mx-auto my-6 font-sans">
      {/* Customer Info */}
      <div className="space-y-6 pb-6 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-1 font-nunito">
            Customer Name
          </h3>
          <p className="font-lato text-gray-800 text-sm">
            {data.generalInfo?.customerName || "N/A"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className=" font-semibold uppercase text-gray-500 mb-1 font-nunito">
              Order Date
            </h3>
            <p className="font-lato text-gray-800">
              {data.generalInfo?.orderDate
                ? new Date(data.generalInfo.orderDate).toLocaleDateString("en-GB")
                : "N/A"}
            </p>
          </div>
          <div>
            <h3 className=" font-semibold uppercase text-gray-500 mb-1 font-nunito">
              Payment Terms
            </h3>
            <p className="font-lato text-gray-800">
              {data.generalInfo?.paymentTerm || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
    <div className="mt-6">
      <h2 className="text-sm font-nunito font-semibold text-gray-500 mb-2">PRODUCTS</h2>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 border-b border-gray-300 text-black text-sm font-nunito">
          <div>Item</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Unit Price</div>
          <div className="text-right">Amount</div>
        </div>

        {newProducts.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-4 py-3 border-b border-gray-200 last:border-b-0 text-gray-800 text-sm font-lato"
          >
            <div>{p.variantName}</div>
            <div className="text-center">{p.quantitySold}</div>
            <div className="text-right">{formatCurrency(Number(p.sellingPrice))}</div>
            <div className="text-right">{formatCurrency(Number(p.sellingPrice) * p.quantitySold)}</div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500 font-lato">
            No products added.
          </div>
        )}
      </div>
    </div>
      
    <div className="mt-6">
      <h2 className="text-sm font-nunito font-semibold text-gray-500 mb-2">SERVICES</h2>

      <div className="border border-gray-300 rounded-lg overflow-hidden">

        <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 border-b border-gray-300 text-black text-sm font-nunito">
          <div>Service Description</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Unit Price</div>
          <div className="text-right">Amount</div>
        </div>

        {services.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-4 py-3 border-b border-gray-200 last:border-b-0 text-gray-800 text-sm font-lato"
          >
            <div>{s.serviceName}</div>
            <div className="text-center">{s.quantity}</div>
            <div className="text-right">{formatCurrency(s.price)}</div>
            <div className="text-right">{formatCurrency(Number(s.price) * Number(s.quantity))}</div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500 font-lato">
            No services added.
          </div>
        )}
      </div>
    </div>

      {/* Totals */}
      <div className="flex justify-end pt-6 border-t border-gray-200 mt-4 text-sm">
        <div className="w-full max-w-sm font-lato text-gray-800">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Discount</span>
            <span className="">
              {data.generalInfo?.discountAmount
                ? `${data.generalInfo.discountAmount}%`
                : "0%"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
            <span className="text-gray-700">Total</span>
            <span className="">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
