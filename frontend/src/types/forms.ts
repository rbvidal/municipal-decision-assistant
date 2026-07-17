export interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  autoComplete?: string;
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  ariaDescribedby?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
  id?: string;
  name?: string;
  className?: string;
  ariaDescribedby?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  ariaDescribedby?: string;
}

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  error?: string;
  id?: string;
  name?: string;
  className?: string;
}

export interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}
