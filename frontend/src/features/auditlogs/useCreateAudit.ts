import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, getErrorMessage } from "../../lib/api";
import { createStockAudit } from "./api";
import { validateAudit } from "./auditValidation";
import type { AuditInfo } from "./types";

type SubmitOptions = {
  onSuccess?: (result: { auditId: number; auditCode: string; adjusted: number }) => void;
};

/**
 * Validates the audit, sends it, and refreshes whatever its stock adjustments touch.
 *
 *   const { submit, errors, serverErrors, isPending } = useCreateAudit();
 *   submit(formData, { onSuccess: () => navigate("/inventory/auditLogs") });
 */
export function useCreateAudit() {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (form: AuditInfo) => createStockAudit(form),
    onSuccess: async () => {
      await Promise.all([
        // stock changed: product lists, product detail pages, audit pickers
        queryClient.invalidateQueries({
          predicate: (q) => {
            const key = String(q.queryKey[0]).toLowerCase();
            return key.startsWith("product") || key.startsWith("audit");
          },
        }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  /** Returns false (and fills `errors`) when the audit is invalid; nothing is sent in that case. */
  const submit = (form: AuditInfo, options: SubmitOptions = {}): boolean => {
    const found = validateAudit(form);
    setErrors(found);
    if (found.length) return false;

    mutation.mutate(form, { onSuccess: options.onSuccess });
    return true;
  };

  // The server validates too; show every reason it gives, or the plain message.
  const details =
    mutation.error instanceof ApiError ? mutation.error.data.details : undefined;
  const serverErrors: string[] = mutation.error
    ? Array.isArray(details) && details.length
      ? [...new Set(details.map((d: { message: string }) => d.message))]
      : [getErrorMessage(mutation.error)]
    : [];

  return {
    submit,
    errors, // from the form, before anything is sent
    serverErrors, // from the server, after sending
    isPending: mutation.isPending,
  };
}
