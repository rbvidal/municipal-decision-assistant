import React, { useState } from "react";
import type { CheckboxProps } from "../../types";
import { cn, generateId } from "../../utils";
import styles from "./Checkbox.module.css";

export const Checkbox: React.FC<CheckboxProps> = React.memo(
  ({
    label,
    checked,
    onChange,
    disabled = false,
    required = false,
    indeterminate = false,
    error,
    id,
    name,
    className,
  }) => {
    const [autoId] = useState(() => id ?? generateId("checkbox"));
    const errorId = error ? `${autoId}-error` : undefined;

    return (
      <div className={cn(styles.field, className)}>
        <label htmlFor={autoId} className={cn("form-checkbox", disabled && "disabled")}>
          <input
            id={autoId}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            required={required}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            aria-invalid={!!error}
            aria-describedby={errorId}
          />
          {label}
        </label>
        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
