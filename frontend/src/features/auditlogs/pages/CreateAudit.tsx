import { useEffect, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/globalComponents/Button";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { PopupOkay } from "../../../components/globalComponents/PopupComp";
import { ArrowNarrowLeft, ArrowNarrowRight, CheckIcon } from "../../../assets/SvgIcons";
import StepGeneralInfo from "../components/CreateAuditSteps/StepGeneralInfo";
import StepProducts from "../components/CreateAuditSteps/StepProducts";
import StepReview from "../components/CreateAuditSteps/StepReview";
import { useCreateAudit } from "../useCreateAudit";
import type { AuditInfo, AuditStepProps } from "../types";

const AUDIT_LOGS = "/inventory/auditLogs";

const createEmptyAudit = (): AuditInfo => ({
  auditName: "",
  auditDate: new Date().toLocaleDateString("en-CA"), // today, yyyy-mm-dd in local time
  notes: "",
  method: "manual",
  items: [],
});

const steps: Array<{
  id: number;
  label: string;
  caption: string;
  component: ComponentType<AuditStepProps>;
}> = [
  { id: 1, label: "General Information", caption: "Create a stock audit", component: StepGeneralInfo },
  { id: 2, label: "Products", caption: "Add products to audit", component: StepProducts },
  { id: 3, label: "Review", caption: "Review your audit", component: StepReview },
];

export default function CreateAudit() {
  const navigate = useNavigate();
  const { openPopup } = usePopup();
  const { submit, errors, serverErrors, isPending } = useCreateAudit();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AuditInfo>(createEmptyAudit);

  const current = steps[step - 1];
  const StepComponent = current.component;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSubmit = () =>
    submit(formData, {
      onSuccess: ({ auditCode }) => {
        openPopup(<PopupOkay message={`Audit ${auditCode} saved!`} />, null, 2000);
        navigate(AUDIT_LOGS);
      },
    });

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden ">
      <div className="col-span-2 flex flex-col space-y-4 mt-24 font-nunito">
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

      <div className="col-span-5 flex flex-col">
        <div className="flex flex-col flex-none items-center justify-center w-full mb-3">
          <div className="text-sm text-gray-500">{current.caption}</div>
          <div className="text-xl font-nunito text-black font-bold">{current.label}</div>
        </div>

        <div className="mb-10">
          <StepComponent formData={formData} setFormData={setFormData} />
        </div>

        <div className="flex justify-between">
          <div>
            <Button
              onClick={() => navigate(AUDIT_LOGS)}
              children={"Cancel"}
              variant="tertiary"
              iconPosition="left"
            />
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                children={"Back"}
                icon={ArrowNarrowLeft}
                variant="secondary"
                iconPosition="left"
              />
            )}

            {step < steps.length ? (
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
                children={isPending ? "Saving..." : "Finish Audit"}
                icon={CheckIcon}
                variant="primary"
                iconPosition="right"
                disabled={isPending}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {[...errors, ...serverErrors].map((m) => (
            <span key={m} className="text-red-500 text-xs">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
