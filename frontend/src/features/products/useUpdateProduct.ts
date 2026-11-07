import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, getErrorMessage } from "../../lib/api";
import { updateProduct } from "./api";
import { validateProduct } from "./productValidation";
import type { ProductInfo } from "./types";

type SubmitOptions = {
  onSuccess?: (result: { productId: number; variantIds: number[] }) => void;
};

/**
 * Same shape as useCreateProduct, for editing a stored product.
 *
 *   const { submit, errors, serverErrors, isPending } = useUpdateProduct(productId);
 *   submit(formData, { onSuccess: () => navigate("/products") });
 */
export function useUpdateProduct(productId: number | undefined) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (form: ProductInfo) => updateProduct(productId!, form),
    onSuccess: async () => {
      await Promise.all([
        // product, products, productVariants, product-form...
        queryClient.invalidateQueries({
          predicate: (q) =>
            String(q.queryKey[0]).toLowerCase().startsWith("product"),
        }),
        queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
        queryClient.invalidateQueries({ queryKey: ["attributes"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });

  const submit = (form: ProductInfo, options: SubmitOptions = {}): boolean => {
    if (productId === undefined) return false;
    const found = validateProduct(form);
    setErrors(found);
    if (found.length) return false;

    mutation.mutate(form, { onSuccess: options.onSuccess });
    return true;
  };

  const details =
    mutation.error instanceof ApiError ? mutation.error.data.details : undefined;
  const serverErrors: string[] = mutation.error
    ? Array.isArray(details) && details.length
      ? details.map((d: { message: string }) => d.message)
      : [getErrorMessage(mutation.error)]
    : [];

  return {
    submit,
    errors,
    serverErrors,
    isPending: mutation.isPending,
    reset: () => {
      setErrors([]);
      mutation.reset();
    },
  };
}
