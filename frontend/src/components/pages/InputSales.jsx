import { useState, useEffect } from "react";
import InputTransactionForm from "../InputTransactionForm";
import Button from "..//Button"; // adjust import path if needed
import { useLocation, useNavigate } from "react-router-dom";

export default function InputSales() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, item } = location.state || { mode: "add", item: null };
  const isEditMode = mode === "edit";  


  return (
    <div>
      <div className="text-nunito font-bold text-4xl mb-[16px] text-black pb-10 font-nunito">
        {isEditMode ? "Edit Transaction" : "Add a Transaction"}
      </div>

      <div className=" w-full h-[560px] flex gap-12">
        <div className="w-full h-full ">
          <InputTransactionForm 
            mode={mode} 
            item={item} 
            isEditMode={isEditMode} 
          />
        </div>

        <div className="w-full h-full ">
          <div className="bg-white rounded-lg shadow text-black px-6 py-6 w-full">
            <div className="font-bold text-xl mb-1">Invoice</div>
            <div className="text-gray-500 text-sm mb-3">#TransactionID</div>
            <hr className="my-3" />

            <div className="font-bold">King-Motor</div>
            <div className="text-sm mb-3">
              Ruko Pd. Lestari, Jl. HOS Cokroaminoto No.19 blok a1,<br />
              Karang Tengah, Kec. Ciledug, Tangerang Kota, Banten 15157
            </div>
            <hr className="my-3" />

            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Invoice Date</span>
              <span>DD/MM/YYYY</span>
            </div>
            <hr className="my-3" />

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Product Code</span>
                <span>XXXXX</span>
              </div>
              <div className="flex justify-between">
                <span>Product Name</span>
                <span>Lorem Ipsum</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity Sold</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price</span>
                <span>Rp 20.000,-</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>0%</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>10%</span>
              </div>
              <div className="flex justify-between">
                <span>SubTotal</span>
                <span>Rp 40.000,-</span>
              </div>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span className="text-black">Rp 44.000,-</span>
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
