import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { validateField } from '../../api';
import { getErrorMessage } from '../../../../lib/api';
import type { StepFormProps, UserInfoForm } from '../../types';

export default function StepUserInfo({ formData, setFormData }: StepFormProps<UserInfoForm>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState({ email: false });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateEmail = async (email: string) => {
    if (!email) return;

    setValidating(prev => ({ ...prev, email: true }));

    try {
        await validateField('email', email);

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
        });
    } catch (error) {
        console.error('Validation error:', error);
        setErrors(prev => ({ ...prev, email: getErrorMessage(error) }));
    } finally {
        setValidating(prev => ({ ...prev, email: false }));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (name === 'email') {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
        validateEmail(value);

        }, 500);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email' && value.includes('@')) {
      validateEmail(value);
    }
  };

  const getValidationStatus = (field: 'email') => {
    if (validating[field]) return 'validating';
    if (errors[field]) return 'error';
    if (formData[field] && !errors[field]) return 'success';
    return 'idle';
  };

  const ValidationIcon = ({ status }: { status: string }) => {
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
    console.log(formData)
  },[formData])

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Email</div>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border rounded-md bg-white pr-10 ${
              getValidationStatus('email') === 'error' 
                ? 'border-red-500' 
                : getValidationStatus('email') === 'success'
                ? 'border-green-500'
                : 'border-gray-300'
            }`}
            placeholder="@gmail.com"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ValidationIcon status={getValidationStatus('email')} />
          </div>
        </div>
        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
        {getValidationStatus('email') === 'success' && (
          <div className="text-green-500 text-xs mt-1">Email is available</div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">First Name</div>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="First Name"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Last Name</div>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="Last Name"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Phone Number</div>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="Phone Number"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Password</div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="***********"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Re-Password</div>
        <input
          type="password"
          name="rePassword"
          value={formData.rePassword}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="***********"
        />
        {formData.password && formData.rePassword && formData.password !== formData.rePassword && (
          <div className="text-red-500 text-xs mt-1">Passwords do not match</div>
        )}
      </div>
    </div>
  );
}