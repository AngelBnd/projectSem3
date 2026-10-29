import { useState, useRef, useEffect } from "react";
import StepGeneralInfo from "../components/CreateProductSteps/StepGeneralInfo";
import Button from "../../../components/globalComponents/Button";
import {
  ArrowNarrowLeft,
  ArrowNarrowRight,
  CheckIcon,
} from "../../../assets/SvgIcons";
import { ProductOrderStepProps } from "../../products/types";
import { ComponentType } from "react";
import StepReview from "../components/CreateProductSteps/StepReview";
import StepPricingStock from "../components/CreateProductSteps/StepPricingStock";
import { ProductInfo, ProductVariantRow, ProductStatus } from "../types";
import { useCreateProduct } from "../useCreateProduct";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const { submit, errors, serverErrors, isPending } = useCreateProduct();
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSubmit = () =>
    submit(formData, { onSuccess: () => navigate("/products") });

  // Creating the Product & Product variant form
  const createEmptyVariant = (): ProductVariantRow => ({
    tempId: crypto.randomUUID(),
    attributes: {},
    sku: "",
    barcode: "",
    sellingPrice: "",
    thresholdStock: "",
    productStatus: ProductStatus.ACTIVE,
    isDefault: true,
    imageRef: null,
    images: [],
    suppliers: [],
  });

  const createEmptyProduct = (): ProductInfo => ({
    productName: "",
    productCategory: "",
    productBrand: "",
    description: "",
    productStatus: ProductStatus.ACTIVE,
    hasVariants: false,
    attributes: [],
    variants: [createEmptyVariant()], // a product with no variants is its own single variant
    images: [],
    sameCost: false,
  });

  const [newProduct] = useState<ProductInfo>(createEmptyProduct);
  const [formData, setFormData] = useState<ProductInfo>(createEmptyProduct);

  // Step Component
  const steps: Array<{
    id: number;
    label: string;
    component: ComponentType<ProductOrderStepProps>;
  }> = [
    { id: 1, label: "General Information", component: StepGeneralInfo },
    { id: 2, label: "Pricing & Stock", component: StepPricingStock },
    { id: 3, label: "Review", component: StepReview },
  ];

  const StepComponent = steps[step - 1]?.component || (() => <div></div>);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden ">
      <div className="col-span-2 flex flex-col space-y-4 mt-24 font-nunito">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center space-x-4">
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

      <div className="col-span-5 bg-red h-[800px] overflow-y-auto custom-scrollbar rounded-md shadow flex flex-col">
        <div className="flex flex-col flex-none  items-center justify-center w-full mb-3">
          <div className="text-sm text-gray-500">Create a Product</div>
          <div className="text-xl font-nunito text-black font-bold">
            {steps[step - 1].label}
          </div>
        </div>

        <div className="bg-white h-[800px] rounded-sm px-7 py-8 mb-16">
          <StepComponent formData={formData} setFormData={setFormData} />
        </div>

        <div className="flex justify-between">
          <div>
            <Button
              onClick={() => setStep(1)}
              children={"Cancel"}
              variant="tertiary"
              iconPosition="left"
            />
          </div>

          <div className="flex gap-2">
            {/* Back: only show if step > 1 */}
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                children={"Back"}
                icon={ArrowNarrowLeft}
                variant="secondary"
                iconPosition="left"
              />
            )}

            {/* Continue / Next */}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                children={"Continue"}
                icon={ArrowNarrowRight}
                variant="primaryAlt"
                iconPosition="right"
              />
            ) : (
              <Button
                onClick={handleSubmit}
                children={"Submit"}
                icon={CheckIcon}
                variant="primary"
                iconPosition="right"
                disabled={isPending}
              />
            )}
          </div>
          {[...errors, ...serverErrors].map((m) => (
            <div key={m} className="text-red-500 text-xs">
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
