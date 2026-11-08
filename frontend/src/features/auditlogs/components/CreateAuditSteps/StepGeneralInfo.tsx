import type { ChangeEvent } from "react";
import { getCurrentUser } from "../../../../utils/auth";
import type { AuditStepProps } from "../../types";

const inputClass = "w-full p-2 border border-gray-300 rounded-md bg-white";

export default function StepGeneralInfo({
  formData,
  setFormData,
}: AuditStepProps) {
  const user = getCurrentUser();
  const auditor =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
  const year = (formData.auditDate || new Date().toISOString()).slice(0, 4);

  // Plain inputs and textarea: the `name` must match a key of AuditInfo
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-md shadow px-5 py-5">
      {/* Audit code: assigned by the server when the audit is saved */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Audit Code</div>
        <input
          type="text"
          disabled
          className={`${inputClass} !bg-gray-50 text-gray-400 cursor-not-allowed`}
          placeholder={`AUD-${year}-XXX`}
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Audit name</div>
        <input
          type="text"
          name="auditName"
          value={formData.auditName}
          onChange={handleChange}
          className={inputClass}
          placeholder="Name"
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Date</div>
        <input
          type="date"
          name="auditDate"
          value={formData.auditDate}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Auditor: whoever is signed in */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Auditor</div>
        <input
          type="text"
          value={auditor}
          readOnly
          className={`${inputClass} font-bold cursor-default`}
        />
      </div>

      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Notes</div>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Add a note..."
        />
      </div>
    </div>
  );
}
