import React, { useState } from "react";
import type { SelectInputProps } from "../../types";
import { cn, generateId } from "../../utils";
import styles from "./SelectInput.module.css";

export const SelectInput: React.FC<SelectInputProps> = React.memo(
  ({
    label,
    value,
    onChange,
    options,
    placeholder,
    error,
    helpText,
    required = false,
    disabled = false,
    id,
    name,
    className,
    ariaDescribedby,
  }) => {
    const [autoId] = useState(() => id ?? generateId("select"));
    const helpId = helpText ? `${autoId}-help` : undefined;
    const errorId = error ? `${autoId}-error` : undefined;
    const describedBy =
      ariaDescribedby ?? ([helpId, errorId].filter(Boolean).join(" ") || undefined);

    return (
      <div className={cn(styles.field, className)}>
        {label && (
          <label htmlFor={autoId} className={cn("form-label", required && "required")}>
            {label}
          </label>
        )}
        <select
          id={autoId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn("form-input", "form-select", error && "error")}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {helpText && !error && (
          <p id={helpId} className="form-help">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

SelectInput.displayName = "SelectInput";
