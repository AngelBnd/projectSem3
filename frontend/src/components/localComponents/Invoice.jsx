    import React from 'react';
    import { useState } from 'react';
    import Button from './Button'; // Assuming you have a Button component
    import { useEffect } from 'react';
    import handleDownloadPdf from '../../functions/handleDownloadPdf';

    

    export default function Invoice({ invoiceData, products, useDiscount, discountValue }) {
        // This is a placeholder function. You'll need to define it based on your data.
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount).replace('Rp', '');
        };

        // Calculate totals
        const subtotal = products.reduce((acc, product) => {
            const itemTotal = (product.quantitySold || 0) * (product.sellingPrice || 0);
            return acc + itemTotal;
        }, 0);

        useEffect(() => {
            console.log("Products in Invoice:", JSON.stringify(products, null, 2));
            console.log("Invoice Data :", JSON.stringify(invoiceData, null, 2));
        }, [products]);

        const discountAmount = useDiscount ? (subtotal * (discountValue / 100)) : 0;
        const total = subtotal - discountAmount;

        return (
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
                <div className="bg-white rounded-lg shadow-md text-black px-6 py-8 md:px-12 md:py-10">

                    {/* Header Section */}
                    <div className="flex flex-col pb-4 border-b-2">
                        <div className="text-2xl font-bold text-gray-800 mb">
                            #{invoiceData.invoiceId || "InvoiceId"}
                        </div>
                    </div>

            <div className="flex flex-col  py-4 border-b-2">
                        <div className="flex flex-col justify-start items-start mb-1">
                            <span className="text-black font-nunito font-bold">King-Motor</span>
                            <span className="font-medium text-gray-800">
                                Ruko Pd. Lestari, Jl. HOS Cokroaminoto No.19 blok a1, Karang Tengah, Kec. Ciledug, Tangerang Kota, Banten 15157
                            </span>
                        </div>
                        
                </div>

                    {/* Business Info and Invoice Details */}
                <div className="flex flex-col md:text-right py-4 border-b-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Invoice Date</span>
                            <span className="font-medium text-gray-800">
                                {invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "DD/MM/YYYY"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Billed to</span>
                            <span className="font-medium text-gray-800">{invoiceData.name || "Customer's Name"}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Subject</span>
                            <span className="font-medium text-gray-800">{invoiceData.subject || "Enter Subject"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-medium text-gray-800">{invoiceData.paymentMethod || "Enter PaymentMethod"}</span>
                        </div>
                    </div>

                    {/* Product Table */}
                    <div className="overflow-x-auto ">
                        <table className="w-full text-left table-auto border-collapse">
                            <thead>
                                <tr className="border-b  border-gray-300 text-gray-600 text-sm font-semibold bg-gray-100">
                                    <th className="py-3 px-2">Product</th>
                                    <th className="py-3 px-2 text-center">QTY</th>
                                    <th className="py-3 px-2 text-right">Unit Price</th>
                                    <th className="py-3 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (    
                                    products.map((product, index) => (
                                        <tr key={index} className="border-b border-gray-200 text-gray-800">
                                            <td className="py-4 px-2">{product.productName || "Product"}</td>
                                            <td className="py-4 px-2 text-center">{product.quantitySold || 0}</td>
                                            <td className="py-4 px-2 text-right">Rp {formatCurrency(product.sellingPrice || 0)}</td>
                                            <td className="py-4 px-2 text-right">Rp {formatCurrency((product.quantitySold || 0) * (product.sellingPrice || 0))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-b border-gray-200 text-gray-800">
                                        {/* <td className="py-4 px-2">the product name</td>
                                        <td className="py-4 px-2 text-center">2</td>
                                        <td className="py-4 px-2 text-right">Rp 2.000,00</td>
                                        <td className="py-4 px-2 text-right">Rp 4.000,00</td> */}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mt-8">
                        <div className="w-full md:w-1/2">
                            <div className="flex justify-between py-1 text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>Rp {formatCurrency(subtotal)}</span>
                            </div>
                            {useDiscount && (
                                <div className="flex justify-between py-1 text-sm text-gray-600">
                                    <span>Discount {discountValue > 0 ? `-${discountValue}%` : ""}</span>
                                    <span>Rp {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <hr className="my-3 border-t-2 border-gray-300" />
                            <div className="flex justify-between font-bold text-lg font-nunito">
                                <span>Total</span>
                                <span>Rp {formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex justify-center mt-12">
                        <div
                        className='flex items-center gap-2  text-blue-500 hover:text-blue-600 transition-colors underline bg-white cursor-pointer'
                        onClick={()=>{
                            
                            console.log("test")
                            handleDownloadPdf(invoiceData, products, useDiscount, discountValue, formatCurrency, subtotal, discountAmount, total); 

                            console.log("test")}}
                        >
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                            <span>Download Invoice</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }