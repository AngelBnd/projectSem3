import StepGeneralInfo from "../components/CreateOrderSaleSteps/StepGeneralInfo";
import StepReview from "../components/CreateOrderSaleSteps/StepReview";
import {
  AlertCircleIcon,
  ArrowNarrowLeft,
  ArrowNarrowRight,
  CheckIcon,
} from "../../../assets/SvgIcons";
import Button from "../../../components/globalComponents/Button";
import { useState, useEffect } from "react";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import {
  PopupOption,
  PopupOkay,
  PopupError,
} from "../../../components/globalComponents/PopupComp";
import { useNavigate, useParams } from "react-router-dom";
import { saveSalesOrder } from "../api";
import useSalesOrder from "../hooks/useSalesOrder";

export default function CreateOrderSale() {
  const { id } = useParams();

  const navigate = useNavigate();
  const { openPopup, closePopup } = usePopup();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [role, setRole] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newServices, setNewServices] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  const AUTO_CLOSE_MS = 2500;

  const [formData, setFormData] = useState({
    generalInfo: {
      customerName: "",
      orderDate: "",
      paymentTerm: "",
      channelId: null,
      subChannelId: null,
      applyDiscount: false,
      discountAmount: "",
    },
    totals: {
      subtotal: 0,
      discount: 0,
      totalAmount: 0,
    },
  });

  const order = useSalesOrder(id);

  useEffect(() => {
    if (!order) return;

    const loadSalesOrder = () => {
      try {
        const data = order;

        setFormData({
          generalInfo: {
            customerName: data.customerName,
            orderDate: data.orderDate,
            paymentTerm: data.paymentTerms,
            channelId: data.channelId,
            subChannelId: data.subChannelId,
            applyDiscount: data.discount > 0,
            discountAmount: data.discount,
          },
          totals: {
            discount: data.discount,
            totalAmount: data.totalAmount,
          },
        });

        const products = [];
        const services = [];

        (data.items || []).forEach((item, index) => {
          const uniqueId = `item-${index}-${Date.now()}`;
          if (item.productVariantId) {
            products.push({
              tempId: uniqueId,
              productVariantId: item.productVariantId,
              sku: item.sku,
              productName: item.productName,
              variantName: item.variantName,
              quantitySold: item.quantityOrdered || 1,
              unitPrice: Number(item.unitPrice || 0),
            });
          } else {
            services.push({
              tempId: uniqueId,
              serviceName: item.serviceDesc || "",
              quantity: item.quantityOrdered || 1,
              unitPrice: Number(item.unitPrice || 0),
            });
          }
        });
        setNewProducts(products);
        setNewServices(services);

        console.log(products);
        console.log(services);
      } catch (err) {
        console.error(err);
      }
    };

    loadSalesOrder();
  }, [order]);

  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

  const handleContinue = () => {
    if (!canProceed()) {
      setAlert({
        show: true,
        message: "Please fill in all required fields.",
      });
      return;
    }
    setStep(step + 1);
    setAlert({ show: false, message: "" });
  };

  const steps = [
    { id: 0, label: "General Information", component: StepGeneralInfo },
    { id: 1, label: "Review", component: StepReview },
  ];

  const StepComponent = steps[step]?.component || (() => <div></div>);

  const canProceed = () => {
    if (!formData.generalInfo.customerName?.trim()) return false;
    if (!formData.generalInfo.orderDate) return false;
    if (!formData.generalInfo.paymentTerm) return false;
    if (!formData.generalInfo.channelId) return false;
    if (!formData.generalInfo.subChannelId) return false;
    if (newProducts.length === 0 && newServices.length === 0) return false;

    for (let p of newProducts) {
      if (!p.productVariantId) return false;
      if (!p.quantitySold || p.quantitySold <= 0) return false;
    }

    for (let s of newServices) {
      if (!s.serviceName?.trim()) return false;
      if (!s.unitPrice || s.unitPrice <= 0) return false;
    }

    return true;
  };

  const handleSubmitWithSuccess = async () => {
    setLoading(true);
    setAlert({ show: false, message: "" });

    try {
      const payload = {
        formData,
        products: newProducts,
        services: newServices,
      };

      await saveSalesOrder(id, payload);

      openPopup(
        <PopupOkay
          message={`Sales order ${id ? "updated" : "created"} successfully!`}
        />
      );

      setTimeout(() => {
        closePopup();
        navigate(-1);
      }, AUTO_CLOSE_MS);
    } catch (error) {
      setAlert({
        show: true,
        message:
          error.message ||
          `Sales order ${id ? "update" : "creation"} failed.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishClick = () => {
    if (!canProceed()) {
      setAlert({ show: true, message: "Please fill in all required fields." });
      return;
    }

    const customerName =
      formData.generalInfo.customerName || "Unknown Customer";

    openPopup(
      <PopupOption
        message={
          id
            ? `Are you sure you want to edit sales order for ${customerName}?`
            : `Are you sure you want to make sales order for ${customerName}?`
        }
        type={id ? "update" : "create"}
      />,
      async () => {
        closePopup();

        setTimeout(async () => {
          await handleSubmitWithSuccess();
        }, 300);
      }
    );
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-2 flex items-center mb-4 md:mb-0 md:justify-start md:col-span-2 flex flex-col space-y-4 mt-24 font-nunito">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center space-x-4 w-full">
            <div className="w-20 h-3 flex justify-end items-center ">
              <div
                className={`h-1 rounded-sm transition-all duration-300 ${
                  step === s.id
                    ? "bg-blue-500 w-[80px]"
                    : "bg-gray-500 w-[27px]"
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

      <div className="col-span-4 md:col-span-5 md:col-start-3 bg-red h-[800px] overflow-y-auto custom-scrollbar rounded-md flex flex-col">
        <div className="flex flex-col flex-none  items-center justify-center w-full mb-3">
          <div className="text-sm text-gray-500">
            {id ? `Edit Sales Order ${id}` : "Create a Sales Order"}
          </div>
          <div className="text-xl font-nunito text-black font-bold">
            {steps[step].label}
          </div>
        </div>

        <div className="mb-16">
          <div className="bg-white rounded-sm px-7 py-8 mb-1 shadow">
            <StepComponent
              formData={formData}
              setFormData={setFormData}
              newProducts={newProducts}
              newServices={newServices}
              setNewServices={setNewServices}
              setNewProducts={setNewProducts}
            />
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
                onClick={step === 0 ? handleContinue : handleContinue}
                children={"Continue"}
                icon={ArrowNarrowRight}
                variant="primaryAlt"
                iconPosition="right"
                disabled={loading}
              />
            ) : (
              <Button
                onClick={handleFinishClick}
                children={loading ? "Processing..." : "Finish"}
                icon={CheckIcon}
                variant="primary"
                iconPosition="right"
                disabled={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
