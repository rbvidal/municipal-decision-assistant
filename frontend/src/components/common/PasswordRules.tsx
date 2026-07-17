import React from 'react';
import type { PasswordRulesProps } from '../../types';
import { cn, hasUppercase, hasNumber, hasSpecialChar } from '../../utils';
import styles from './PasswordRules.module.css';

export const PasswordRules: React.FC<PasswordRulesProps> = React.memo(({
  password, minLength = 8, requireUppercase = true, requireNumber = true, requireSpecial = true, className,
}) => (
  <ul className={cn(styles.rules, className)} aria-label="Passwort-Anforderungen">
    <li className={password.length >= minLength ? styles.pass : styles.fail}>
      Mindestens {minLength} Zeichen
    </li>
    {requireUppercase && (
      <li className={hasUppercase(password) ? styles.pass : styles.fail}>
        Mindestens 1 Großbuchstabe
      </li>
    )}
    {requireNumber && (
      <li className={hasNumber(password) ? styles.pass : styles.fail}>
        Mindestens 1 Zahl
      </li>
    )}
    {requireSpecial && (
      <li className={hasSpecialChar(password) ? styles.pass : styles.fail}>
        Mindestens 1 Sonderzeichen
      </li>
    )}
  </ul>
));

PasswordRules.displayName = 'PasswordRules';
