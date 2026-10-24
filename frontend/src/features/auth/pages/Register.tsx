import { useState, useEffect } from "react";

import Button from "../../../components/globalComponents/Button"
import StepUserInfo from "../components/RegisterSteps/StepUserInfo";
import StepStoreInfoEmployee from "../components/RegisterSteps/StepStoreInfoEmployee";
import StepStoreInfoOwner from "../components/RegisterSteps/StepStoreInfoOwner";
import StepRole from "../components/RegisterSteps/StepRole";
import { register } from "../api";
import { ApiError } from "../../../lib/api";
import type { Role, StoreInfoForm, UserInfoForm } from "../types";
import { ArrowNarrowLeft, ArrowNarrowRight, CheckIcon, AlertCircleIcon  } from "../../../assets/SvgIcons";

export default function Register(){
    const [step, setStep] = useState(0);
    const [role, setRole] = useState<Role | null>(null);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<{
        userInfo: UserInfoForm;
        storeInfo: StoreInfoForm;
    }>({
        userInfo: {},
        storeInfo: {}
    });

    const steps = [
    { id: 0, label: "Choose Role" },
    { id: 1, label: "User Info" },
    ...(role === "owner" ? [{ id: 2, label: "Store Info" }] : []),
    ...(role === "employee" ? [{ id: 2, label: "Store Info" }] : []),
    ];

    const renderStep = () => {
        const updateUserInfo = (data: Partial<UserInfoForm>) =>
            setFormData(prev => ({ ...prev, userInfo: { ...prev.userInfo, ...data } }));
        const updateStoreInfo = (data: Partial<StoreInfoForm>) =>
            setFormData(prev => ({ ...prev, storeInfo: { ...prev.storeInfo, ...data } }));

        if (step === 0) return <StepRole onSelectRole={setRole} selectedRole={role} />;
        if (step === 1) return <StepUserInfo formData={formData.userInfo} setFormData={updateUserInfo} />;
        if (step === 2 && role === "owner") return <StepStoreInfoOwner formData={formData.storeInfo} setFormData={updateStoreInfo} />;
        if (step === 2 && role === "employee") return <StepStoreInfoEmployee formData={formData.storeInfo} setFormData={updateStoreInfo} />;
        return <div></div>;
    };

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); 
    }, [step]);

    useEffect(() => {
        setAlert({ show: false, message: '' });
    }, [step, formData, role]);

    const handleContinue = () => {
        if (!canProceed()) {
            setAlert({ 
                show: true, 
                message: 'Please fill in all required fields.' 
            });
            return;
        }
        setStep(step + 1);
        setAlert({ show: false, message: '' });
    };

    const handleStepZeroContinue = () => {
        if (!role) {
            setAlert({ 
                show: true, 
                message: 'Please choose a role before continuing.' 
            });
            return;
        }
        setStep(step + 1);
        setAlert({ show: false, message: '' });
    };

    const canProceed = () => {
        if (step === 0) return !!role;
        if (step === 1) {
            const { email, firstName, lastName, password, rePassword } = formData.userInfo;
            return !!(email && firstName && lastName && password && password === rePassword);
        }
        if (step === 2 && role === 'owner') {
            return !!(formData.storeInfo.storeName && formData.storeInfo.storeTag);
        }
        if (step === 2 && role === 'employee') {
            return !!formData.storeInfo.storeTag;
        }
        return true;
    };
    
   const handleRegister = async () => {
        if (!canProceed()) {
            setAlert({ 
                show: true, 
                message: 'Please fill in all required fields.' 
            });
            return;
        }   

        setLoading(true);
        setAlert({ show: false, message: '' });

        try {
            const payload = {
                role: role,
                email: formData.userInfo.email,
                firstName: formData.userInfo.firstName,
                lastName: formData.userInfo.lastName,
                phoneNumber: formData.userInfo.phoneNumber,
                password: formData.userInfo.password,
                ...(role === 'owner' && {
                    storeName: formData.storeInfo.storeName,
                    storeTag: formData.storeInfo.storeTag
                }),
                ...(role === 'employee' && {
                    storeTag: formData.storeInfo.storeTag
                })
            };

            await register(payload);

            window.location.href = '/login';
        } catch (error) {
            console.error('Registration error test:', error);
            setAlert({
                show: true,
                message: error instanceof ApiError
                    ? error.message || 'Registration failed. Please try again.'
                    : 'An error occurred during registration.'
            });
        } finally {
            setLoading(false);
        }
    }; 
    

    useEffect(()=>{
        console.log("dari index.js register")
        console.log(formData.userInfo)
        console.log("dari index.js storeindo")
         console.log(formData.storeInfo)
    },[formData])

    return(
    <div className="grid grid-cols-4 md:grid-cols-12 gap-3 w-full text-black mb-10 !overflow-x-hidden mt-20 ">
        <div className="col-span-4 flex items-center mb-4 md:mb-0 md:justify-start md:col-span-2 flex flex-col space-y-4 mt-24 font-nunito">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center space-x-4">
            <div className="w-20 h-3 flex justify-end items-center ">
              <div
                className={`h-1 rounded-sm transition-all duration-300 ${
                step === s.id ? "bg-blue-500 w-[80px]" : "bg-gray-500 w-[27px]"
              }`}
            />
            </div>
            <span
              className={`text-sm font-medium ${
                step === s.id ? "text-black" : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

    <div  className="col-span-4 md:col-span-6 md:col-start-4 bg-red h-[800px] overflow-y-auto custom-scrollbar rounded-md shadow flex flex-col">
      <div className="flex flex-col flex-none  items-center justify-center w-full mb-3">
        <div className="text-sm text-gray-500">
          Register
        </div>
        <div className="text-xl font-nunito text-black font-bold">
          {steps[step].label}
        </div>
      </div>
      
    <div className="mb-16">
            <div className="bg-white rounded-sm px-7 py-8 mb-1">
                {renderStep()}
            </div>

        <div className="h-4">
            {alert.show && (  
                <div className="text-xs text-red-500 flex gap-1 items-center">
                    <AlertCircleIcon className="w-4 h-4" />
                    {alert.message}
                </div>
            )}
        </div>
    </div>


    <div className="flex justify-between">
        <div>
          {/* <Button
            onClick={() => setStep(1)}  
            children={"Cancel"} 
            variant="tertiary"
            iconPosition="left" 
          /> */}
        </div>
        
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              onClick={() => setStep(step - 1)}
              children={"Back"} 
              icon={ArrowNarrowLeft}
              variant="secondary"
              iconPosition="left"
              disabled={loading}
            />
          )}

        {step < steps.length - 1 ? (
        <Button
            onClick={step === 0 ? handleStepZeroContinue : handleContinue}
            children={"Continue"}
            icon={ArrowNarrowRight}
            variant="primaryAlt"
            iconPosition="right"
            disabled={loading}
        />
        ) : (
        <Button
            onClick={handleRegister}
            children={loading ? "Registering..." : "Register"}
            icon={CheckIcon}
            variant="primary"
            iconPosition="right"
            disabled={loading || !canProceed()}
        />
        )}
        </div>
      </div>
    </div>

    </div>
    )
}