import { Checkbox, FormControlLabel } from "@mui/material";

interface ReviewFieldType {
  label: string;
  value: string;
}

// Placeholder data so the table structure renders. Replace with your own data.
const attributes = [
  { id: 1, name: "Attribute1", values: ["Value1"] },
  { id: 2, name: "Attribute2", values: ["Value1", "Value2"] },
];

// Read-only label + value pair
const ReviewField = ({ label, value }: ReviewFieldType) => (
  <div className="mb-4">
    <div className="text-sm mb-1 font-nunito font-bold text-gray-500">
      {label}
    </div>
    <div className="text-sm font-nunito text-black">{value}</div>
  </div>
);

export default function StepReview() {
  return (
    <div>
      <div className="w-full bg-white p-6 rounded-md shadow-md">
        {/* Product name */}
        <ReviewField label="Product name" value="" />

        {/* Category + Brand */}
        <div className="grid grid-cols-2 gap-3">
          <ReviewField label="Category" value="" />
          <ReviewField label="Brand" value="" />
        </div>

        {/* Have variants (locked) */}
        <div className="mb-4 px-2">
          <FormControlLabel
            control={<Checkbox checked disabled />}
            label={
              <span className="text-sm font-nunito text-black">
                Have variants
              </span>
            }
          />
        </div>

        {/* Attributes / Values (locked) */}
        <div className="border border-gray-200 rounded-md bg-white mb-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-500 font-nunito">
            <span className="col-span-3">Attributes</span>
            <span className="col-span-9">Values</span>
          </div>

          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="grid grid-cols-12 gap-4 items-center px-4 py-2 border-t border-gray-200"
            >
              <span className="col-span-3 text-sm font-nunito font-bold">
                {attr.name}
              </span>

              <div
                className="col-span-9 flex flex-wrap items-center gap-2 min-h-[40px] px-2 py-1 border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed"
                aria-readonly="true"
              >
                {attr.values.map((value) => (
                  <span
                    key={value}
                    className="px-2 py-1 text-sm font-nunito bg-white rounded-md"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <ReviewField label="Description" value="" />
      </div>
    </div>
  );
}
