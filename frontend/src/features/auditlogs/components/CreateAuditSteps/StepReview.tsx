import { itemDiff, type AuditStepProps } from "../../types";
import AuditItemsTable from "../AuditItemsTable";

export default function StepReview({ formData }: AuditStepProps) {
  const diffs = formData.items.map((i) => itemDiff(i) ?? 0);

  const stats = [
    { label: "Items Checked", value: formData.items.length },
    { label: "Differences", value: diffs.filter((d) => d !== 0).length },
    { label: "Qty +", value: diffs.filter((d) => d > 0).reduce((a, b) => a + b, 0) },
    { label: "Qty −", value: -diffs.filter((d) => d < 0).reduce((a, b) => a + b, 0) },
  ];

  return (
    <div className="bg-white rounded-md shadow px-5 py-5">
      <div className="grid grid-cols-4 gap-3 mb-5 font-nunito">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-sm text-gray-500 font-bold">{s.label}</div>
            <div className="text-2xl text-black">{s.value}</div>
          </div>
        ))}
      </div>

      <AuditItemsTable items={formData.items} />
    </div>
  );
}
