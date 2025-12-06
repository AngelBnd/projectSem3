import { useEffect, useState } from "react";

export default function StepStoreInfoEmployee({ formData, setFormData, role }) {
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`nama ${e.nama}`)
     console.log(`value ${e.nama}`)

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