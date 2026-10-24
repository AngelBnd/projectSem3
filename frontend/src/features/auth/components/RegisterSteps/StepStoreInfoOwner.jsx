import { useEffect, useState, useRef } from "react";
import { validateField } from "../../api";

export default function StepStoreInfoOwner({ formData, setFormData, role }) {
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({ storeTag: false });
  const debounceRef = useRef(null);

  const validateStoreTag = async (tag) => {
    if (!tag) return;

    setValidating(prev => ({ ...prev, storeTag: true }));

    try {
      await validateField('storeTag', tag);

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.storeTag;
        return newErrors;
      });
    } catch (error) {
      console.error('Validation error:', error);
      setErrors(prev => ({ ...prev, storeTag: error.message }));
    } finally {
      setValidating(prev => ({ ...prev, storeTag: false }));
    }
  };

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

    if (name === 'storeTag') {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.trim().length > 0) {
          validateStoreTag(value.trim());
        }
      }, 500);
    }
  };

  const getValidationStatus = (field) => {
    if (validating[field]) return 'validating';
    if (errors[field]) return 'error';
    if (formData[field] && !errors[field]) return 'success';
    return 'idle';
  };

  const ValidationIcon = ({ status }) => {
    switch (status) {
      case 'validating':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</div>;
      default:
        return null;
    }
  };

  useEffect(()=>{
    console.log(formData);
  },[formData])
  
  
  return (
    <div>
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Store Name</div>
        <input
          type="text"
          name="storeName"
          value={formData.storeName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="Store Name"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Store Tag</div>
        <div className="relative">
          <input
            type="text"
            name="storeTag"
            value={formData.storeTag}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md bg-white pr-10 ${
              getValidationStatus('storeTag') === 'error'
                ? 'border-red-500'
                : getValidationStatus('storeTag') === 'success'
                ? 'border-green-500'
                : 'border-gray-300'
            }`}
            placeholder="Store Tag"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ValidationIcon status={getValidationStatus('storeTag')} />
          </div>
        </div>
        {errors.storeTag && <div className="text-red-500 text-xs mt-1">{errors.storeTag}</div>}
        {getValidationStatus('storeTag') === 'success' && (
          <div className="text-green-500 text-xs mt-1">Store tag is available</div>
        )}
        <div className="text-xs text-gray-400 mt-1">Store tags are used to invite employees.</div>
      </div>
    </div>
  );
}