import { useState, useRef, useEffect } from "react";

import Button from "../../components/globalComponents/Button"
import StepUserInfo from "../../components/StepsComponents/RegisterSteps/StepUserInfo";
import StepStoreInfoEmployee from "../../components/StepsComponents/RegisterSteps/StepStoreInfoEmployee";
import StepStoreInfoOwner from "../../components/StepsComponents/RegisterSteps/StepStoreInfoOwner";
import StepRole from "../../components/StepsComponents/RegisterSteps/StepRole";
import { ArrowNarrowLeft, ArrowNarrowRight, CheckIcon, AlertCircleIcon  } from "../../assets/SvgIcons";

export default function Register(){
    const [step, setStep] = useState(0);
    const [selectedRole, setSelectedRole] = useState(null);
    const [role, setRole] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        userInfo: {},
        storeInfo: {}
    });

    const steps = [
    { id: 0, label: "Choose Role", component: StepRole },
    { id: 1, label: "User Info", component: StepUserInfo },
    ...(role === "owner" ? [{ id: 2, label: "Store Info", component: StepStoreInfoOwner }] : []),
    ...(role === "employee" ? [{ id: 2, label: "Store Info", component: StepStoreInfoEmployee }] : []),
    ];

   const StepComponent = steps[step]?.component || (() => <div></div>);
   const stepProps = step === 1
    ? { formData: formData.userInfo, setFormData: (data) => setFormData(prev => ({ ...prev, userInfo: { ...prev.userInfo, ...data } })) }
    : step === 2
    ? { formData: formData.storeInfo, setFormData: (data) => setFormData(prev => ({ ...prev, storeInfo: {...prev.storeInfo, ...data} })) }
    : { onSelectRole: setRole, selectedRole: role };

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
            return email && firstName && lastName && password && password === rePassword;
        }
        if (step === 2 && role === 'owner') {
            return formData.storeInfo.storeName && formData.storeInfo.storeTag;
        }
        if (step === 2 && role === 'employee') {
            return formData.storeInfo.storeTag;
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

            const response = await fetch('https://stockapi.jessfortress.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error('Error parsing response:', err);
                setAlert({ 
                    show: true, 
                    message: 'Registration succeeded but failed to read response.'
                });
                return;
            }

            if (response.ok) {
                window.location.href = '/login';
            } else {
                setAlert({ 
                    show: true, 
                    message: data.error || 'Registration failed. Please try again.' 
                });
            }
        } catch (error) {
            console.error('Registration error test:', error);
            setAlert({ 
                show: true, 
                message: 'An error occurred during registration.' 
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
                <StepComponent {...stepProps} />
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