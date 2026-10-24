export type Role = "owner" | "employee";

export interface UserInfoForm {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string;
  rePassword?: string;
}

export interface StoreInfoForm {
  storeName?: string;
  storeTag?: string;
}

export interface StepFormProps<T> {
  formData: T;
  setFormData: (data: Partial<T>) => void;
  role?: Role | null;
}
