import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";

// Shared styling so every MUI field matches the plain <input> fields
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
};

export default function StepGeneralInfo() {
  return (
    <div>
      {/* Product name */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Product name</div>
        <input
          type="text"
          value=""
          name=""
          onChange={() => {}}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          placeholder="AUD-2025-001"
        />
      </div>

      {/* Category + Brand */}
      <div className="flex gap-3">
        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Category</div>
          <TextField
            select
            fullWidth
            size="small"
            value=""
            name=""
            onChange={() => {}}
            sx={fieldSx}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Category</MenuItem>
          </TextField>
        </div>

        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Brand</div>
          <TextField
            select
            fullWidth
            size="small"
            value=""
            name=""
            onChange={() => {}}
            sx={fieldSx}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Brand</MenuItem>
          </TextField>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <div className="text-sm mb-1 font-nunito font-bold">Description</div>
        <textarea
          value=""
          name=""
          onChange={() => {}}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md bg-white resize-none"
          placeholder="Product Description"
        />
      </div>

      {/* Have variants */}
      <div className="mb-4 px-2">
        <FormControlLabel
          control={<Checkbox checked={false} onChange={() => {}} />}
          label={
            <span className="text-sm font-nunito font-bold">Have variants</span>
          }
        />
      </div>

      {/* SKU + Barcode */}
      <div className="flex gap-3">
        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">SKU</div>
          <input
            type="text"
            value=""
            name=""
            onChange={() => {}}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            placeholder="XXXX-XXXX"
          />
        </div>

        <div className="mb-4 w-full">
          <div className="text-sm mb-1 font-nunito font-bold">Barcode</div>
          <input
            type="text"
            value=""
            name=""
            onChange={() => {}}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            placeholder="XXX-XXXX-XXXX"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="mb-4">
        <FormControlLabel
          control={<Switch checked={false} onChange={() => {}} />}
          label={<span className="text-sm font-nunito">Active</span>}
        />
      </div>

      {/* Images */}
      <div className="mb-2">
        <div className="text-sm mb-1 font-nunito font-bold">Images</div>

        <label
          htmlFor="product-images"
          className="flex flex-col items-center justify-center gap-1 w-full h-28 border border-gray-300 rounded-md bg-white cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {}}
        >
          <UploadFileOutlinedIcon className="text-blue-500" />
          <span className="text-xs font-semibold text-blue-500 underline">
            Click to Upload
          </span>
          <span className="text-xs text-gray-400">or drag and drop</span>
          <input
            id="product-images"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={() => {}}
          />
        </label>

        {/* Uploaded file chips (static placeholders; map over your files later) */}
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { name: "filename.png", size: "1.2 mb" },
            { name: "filename2.png", size: "1.2 mb" },
          ].map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-2 min-w-[200px]"
            >
              <InsertDriveFileOutlinedIcon
                fontSize="small"
                className="text-gray-500"
              />
              <div className="flex-1 leading-tight">
                <div className="text-xs font-bold text-black">{file.name}</div>
                <div className="text-[10px] text-gray-400">{file.size}</div>
              </div>
              <button
                type="button"
                onClick={() => {}}
                className="bg-transparent text-gray-500 hover:text-gray-700 p-0"
                aria-label={`Remove ${file.name}`}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
