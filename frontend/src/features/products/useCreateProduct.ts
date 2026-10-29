import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, getErrorMessage } from "../../lib/api";
import { createProduct } from "./api";
import { validateProduct } from "./productValidation";
import type { ProductInfo } from "./types";

type SubmitOptions = {
  onSuccess?: (result: { productId: number; variants: number }) => void;
};

/**
 * Validates the form, sends it, and refreshes whatever the new product touches.
 *
 *   const { submit, errors, serverErrors, isPending } = useCreateProduct();
 *   submit(formData, { onSuccess: () => navigate("/products") });
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (form: ProductInfo) => createProduct(form),
    onSuccess: async () => {
      await Promise.all([
        // any list whose key starts with "product" (the exact key names are not known here)
        queryClient.invalidateQueries({
          predicate: (q) =>
            String(q.queryKey[0]).toLowerCase().startsWith("product"),
        }),
        queryClient.invalidateQueries({ queryKey: ["suppliers"] }), // a new supplier may have been created
        queryClient.invalidateQueries({ queryKey: ["attributes"] }), // so may a new attribute or value
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  /** Returns false (and fills `errors`) when the form is invalid; nothing is sent in that case. */
  const submit = (form: ProductInfo, options: SubmitOptions = {}): boolean => {
    const found = validateProduct(form);
    setErrors(found);
    if (found.length) return false;

    mutation.mutate(form, { onSuccess: options.onSuccess });
    return true;
  };

  // The server validates too; show every reason it gives, or the plain message.
  const details =
    mutation.error instanceof ApiError
      ? mutation.error.data.details
      : undefined;
  const serverErrors: string[] = mutation.error
    ? Array.isArray(details) && details.length
      ? details.map((d: { message: string }) => d.message)
      : [getErrorMessage(mutation.error)]
    : [];

  return {
    submit,
    errors, // from the form, before anything is sent
    serverErrors, // from the server, after sending
    isPending: mutation.isPending,
    reset: () => {
      setErrors([]);
      mutation.reset();
    },
  };
}
