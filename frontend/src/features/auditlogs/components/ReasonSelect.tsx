import { MenuItem, Select } from "@mui/material";
import ColorTag from "../../../components/globalComponents/ColorTag";
import { ADJUSTMENT_REASONS, type AdjustmentReason } from "../types";

export const ReasonTag = ({ reason }: { reason: AdjustmentReason | "" }) => {
  const found = ADJUSTMENT_REASONS.find((r) => r.value === reason);
  return found ? (
    <ColorTag label={found.label} tone={found.tone} />
  ) : (
    <ColorTag label="Select Reason" tone="gray" />
  );
};

interface ReasonSelectProps {
  value: AdjustmentReason | "";
  onChange: (reason: AdjustmentReason | "") => void;
  /** Highlights the pill when a reason is required but missing. */
  error?: boolean;
}

/** Reason dropdown that shows the chosen reason as a colored tag. */
export default function ReasonSelect({ value, onChange, error }: ReasonSelectProps) {
  return (
    <Select
      variant="standard"
      disableUnderline
      displayEmpty
      value={value}
      onChange={(e) => onChange(e.target.value as AdjustmentReason | "")}
      renderValue={(v) => <ReasonTag reason={v as AdjustmentReason | ""} />}
      sx={{
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          py: 0.25,
          pr: "24px !important",
          borderRadius: "999px",
          outline: error ? "1px solid #ef4444" : "none",
        },
        "& .MuiSelect-select:focus": { backgroundColor: "transparent" },
      }}
    >
      <MenuItem value="">
        <span className="text-sm text-gray-400 font-lato">No reason</span>
      </MenuItem>
      {ADJUSTMENT_REASONS.map((r) => (
        <MenuItem key={r.value} value={r.value}>
          <ReasonTag reason={r.value} />
        </MenuItem>
      ))}
    </Select>
  );
}
