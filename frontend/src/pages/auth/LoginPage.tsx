import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import { AuthLayout } from "../../layouts";
import { Button, Alert } from "../../components/common";
import { ApiError } from "../../api";
import styles from "./LoginPage.module.css";

export const LoginPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setFieldErrors({});

      if (!email.trim() || !password.trim()) {
        setError("Bitte geben Sie E-Mail und Passwort ein.");
        return;
      }

      setIsSubmitting(true);
      try {
        await login(email.trim(), password);
        navigate("/home", { replace: true });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === "VALIDATION_ERROR" && err.fieldErrors) {
            setFieldErrors(err.fieldErrors);
            setError("Bitte korrigieren Sie die markierten Felder.");
          } else if (err.status === 401) {
            setError("Ungültige E-Mail oder Passwort.");
          } else if (err.status === 0 || err.code === "NETWORK_ERROR") {
            setError("Keine Verbindung zum Server. Bitte versuchen Sie es später erneut.");
          } else {
            setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
          }
        } else {
          setError("Ein unerwarteter Fehler ist aufgetreten.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, navigate],
  );

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.heading}>Anmelden</h2>

        {error && (
          <Alert type="error" title={error} />
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            E-Mail
          </label>
          <input
            id="login-email"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => { const next = {...prev}; delete next.email; return next; }); }}
            placeholder="name@verwaltung.de"
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
          />
          {fieldErrors.email && (
            <span className={styles.hintError}>{fieldErrors.email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-password">
            Passwort
          </label>
          <input
            id="login-password"
            className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const next = {...prev}; delete next.password; return next; }); }}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          {fieldErrors.password && (
            <span className={styles.hintError}>{fieldErrors.password}</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Anmeldung läuft..." : "Anmelden"}
        </Button>

        <p className={styles.footer}>
          Noch kein Konto?{" "}
          <Link to="/register" className={styles.link}>
            Jetzt registrieren
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
});

LoginPage.displayName = "LoginPage";
