import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--color-gray-900)",
                marginBottom: "8px",
              }}
            >
              Etwas ist schiefgelaufen
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-gray-500)", marginBottom: "16px" }}>
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "8px 16px",
                background: "var(--color-primary-500)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Erneut versuchen
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
