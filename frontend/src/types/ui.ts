import type { Size, Variant, Status, Priority, Risk, Position, Alignment, Orientation } from './common';

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
  tabIndex?: number;
}

export interface IconButtonProps {
  icon: React.ReactNode;
  ariaLabel: string;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  tabIndex?: number;
}

export interface BadgeProps {
  status?: Status;
  priority?: Priority;
  risk?: Risk;
  variant?: 'dot' | 'pill';
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export interface StatusDotProps {
  status: Status;
  size?: 'sm' | 'md';
  ariaLabel?: string;
  className?: string;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row' | 'circle';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export interface DividerProps {
  orientation?: Orientation;
  label?: string;
  className?: string;
}

export interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md';
  status?: Status;
  className?: string;
  ariaLabel?: string;
}

export interface ConfidenceBarProps {
  value: number;
  max?: number;
  ariaLabel?: string;
  className?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface ToastProps {
  id: string;
  type: Status;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onDismiss: (id: string) => void;
}

export interface PasswordRulesProps {
  password: string;
  minLength?: number;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
  className?: string;
}
