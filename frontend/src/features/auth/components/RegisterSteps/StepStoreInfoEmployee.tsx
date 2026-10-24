import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { StepFormProps, StoreInfoForm } from "../../types";

export default function StepStoreInfoEmployee({ formData, setFormData }: StepFormProps<StoreInfoForm>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`name ${name}`)
     console.log(`value ${value}`)

    setFormData({ [name]: value });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(()=>{
    console.log(formData);
  },[formData])
  
  
  return (
    <div>
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Store Tag</div>
        <input
           type="text"
          name="storeTag"
          value={formData.storeTag}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="First Name"
        />
        <div className="text-xs text-gray-400">Input the unique code provided by your store owner.</div>
      </div>
    
    </div>
  );
}