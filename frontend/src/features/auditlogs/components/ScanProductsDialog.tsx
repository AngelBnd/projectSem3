import { useRef, useState, type FormEvent } from "react";
import { Dialog } from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import Button from "../../../components/globalComponents/Button";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { PopupError, PopupOkay } from "../../../components/globalComponents/PopupComp";
import { CheckIcon, TrashIcon, XIcon } from "../../../assets/SvgIcons";
import { getErrorMessage } from "../../../lib/api";
import { lookupAuditProduct } from "../api";
import type { AuditProduct } from "../types";

export interface ScannedProduct {
  product: AuditProduct;
  count: number;
}

interface ScanProductsDialogProps {
  open: boolean;
  onClose: () => void;
  onFinish: (scanned: ScannedProduct[]) => void;
}

export default function ScanProductsDialog({ open, onClose, onFinish }: ScanProductsDialogProps) {
  const { openPopup } = usePopup();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState("");
  const [scanned, setScanned] = useState<ScannedProduct[]>([]);

  const handleCode = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;

    try {
      const product = await lookupAuditProduct(value);
      setScanned((prev) => {
        const existing = prev.find((s) => s.product.productVariantId === product.productVariantId);
        const rest = prev.filter((s) => s !== existing);
        // newest scan on top
        return [{ product, count: (existing?.count ?? 0) + 1 }, ...rest];
      });
      openPopup(<PopupOkay message={`Scanned ${product.productName}!`} />, null, 1500);
    } catch (err) {
      openPopup(<PopupError message={getErrorMessage(err)} />, null, 2000);
    }
  };

  // Typed codes and USB/Bluetooth scanners (they type the code and press Enter).
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    handleCode(code);
    setCode("");
    inputRef.current?.focus();
  };

  const close = () => {
    setScanned([]);
    setCode("");
    onClose();
  };

  const finish = () => {
    onFinish(scanned);
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "8px" } }}
    >
      <div className="p-6 text-black font-nunito">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Scan Products to Audit</h2>
          <button type="button" onClick={close} className="!bg-transparent p-1 text-black" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Camera placeholder + manual entry */}
          <div className="flex flex-col gap-3">
            <div className="h-[300px] rounded-md bg-gray-300 flex items-center justify-center">
              <div className="flex flex-col items-center text-gray-600 px-6 text-center">
                <PhotoCameraOutlinedIcon sx={{ fontSize: 48 }} />
                <span className="text-xs mt-1">Can't find your camera...</span>
              </div>
            </div>

            <form onSubmit={submitCode} className="flex gap-2">
              <input
                ref={inputRef}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Scan or type a barcode / SKU"
                className="flex-1 p-2 text-sm border border-gray-300 rounded-md bg-white"
                aria-label="Barcode or SKU"
              />
              <Button type="submit" variant="white" disabled={!code.trim()}>
                Add
              </Button>
            </form>
          </div>

          {/* Scanned list */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-base font-bold mb-3">Scanned Products</h3>
            <div className="border border-gray-200 rounded-md flex-1 min-h-0">
              <div className="grid grid-cols-[minmax(0,1fr)_60px_24px] gap-3 px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                <span>Product</span>
                <span>Count</span>
                <span />
              </div>
              <div className="h-[260px] overflow-y-auto custom-scrollbar">
                {scanned.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-gray-400">Nothing scanned yet.</p>
                )}
                {scanned.map(({ product, count }) => (
                  <div
                    key={product.productVariantId}
                    className="grid grid-cols-[minmax(0,1fr)_60px_24px] gap-3 items-center px-4 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="min-w-0 leading-tight">
                      <div className="text-sm font-bold truncate">{product.productName}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {product.variantLabel || product.sku}
                      </div>
                    </div>
                    <span className="text-sm">{count}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setScanned((prev) =>
                          prev.filter((s) => s.product.productVariantId !== product.productVariantId),
                        )
                      }
                      className="!bg-transparent p-0 text-gray-400 hover:text-red-500"
                      aria-label={`Remove ${product.productName}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={finish} icon={CheckIcon} variant="primary" disabled={!scanned.length}>
            Finish
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
