import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../../layouts";
import { Button, Alert } from "../../components/common";
import { apiClient, ApiError } from "../../api";
import styles from "./RegisterPage.module.css";

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: "Schwach", color: "#e54545" };
  if (score <= 3) return { score, label: "Mittel", color: "#f5a623" };
  return { score, label: "Stark", color: "#22b07d" };
}

export const RegisterPage: React.FC = React.memo(() => {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordsMatch = password === passwordConfirm;
  const canSubmit =
    displayName.trim() && email.trim() && password.length >= 8 && passwordsMatch && !isSubmitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!canSubmit) {
        if (!displayName.trim()) {
          setError("Bitte geben Sie Ihren Namen ein.");
        } else if (!email.trim()) {
          setError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
        } else if (!passwordsMatch) {
          setError("Die Passwörter stimmen nicht überein.");
        } else if (password.length < 8) {
          setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
        }
        return;
      }

      setIsSubmitting(true);
      try {
        await apiClient.post("/api/auth/register", {
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          roles: [],
        });
        navigate("/login?registered", { replace: true });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === "VALIDATION_ERROR" && err.fieldErrors) {
            setError(Object.values(err.fieldErrors).join(", "));
          } else if (err.status === 409 || err.message?.includes("already registered")) {
            setError("Diese E-Mail-Adresse ist bereits registriert.");
          } else {
            setError(err.message || "Registrierung fehlgeschlagen.");
          }
        } else {
          setError("Ein unerwarteter Fehler ist aufgetreten.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [displayName, email, password, passwordsMatch, canSubmit, navigate],
  );

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.heading}>Registrieren</h2>

        {error && <Alert type="error" title={error} />}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-name">
            Name
          </label>
          <input
            id="reg-name"
            className={styles.input}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Dr. Anna Schmidt"
            autoComplete="name"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-email">
            E-Mail
          </label>
          <input
            id="reg-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@verwaltung.de"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-password">
            Passwort
          </label>
          <input
            id="reg-password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mindestens 8 Zeichen"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {password.length > 0 && (
            <div className={styles.strengthBar}>
              <div className={styles.strengthTrack}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${(strength.score / 5) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <span className={styles.strengthLabel} style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-password-confirm">
            Passwort bestätigen
          </label>
          <input
            id="reg-password-confirm"
            className={styles.input}
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Passwort wiederholen"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {passwordConfirm.length > 0 && !passwordsMatch && (
            <span className={styles.hintError}>Passwörter stimmen nicht überein</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={!canSubmit}
        >
          {isSubmitting ? "Registrierung läuft..." : "Registrieren"}
        </Button>

        <p className={styles.footer}>
          Bereits ein Konto?{" "}
          <Link to="/login" className={styles.link}>
            Jetzt anmelden
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
});

RegisterPage.displayName = "RegisterPage";
