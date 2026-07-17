import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer" id="app-footer">
      <p>© 2024 Kommunale Entscheidungsplattform - Bundesrepublik Deutschland</p>
      <div className="footer-links">
        <a href="#" id="footer-link-impressum">Impressum</a>
        <a href="#" id="footer-link-datenschutz">Datenschutz</a>
        <a href="#" id="footer-link-kontakt">Kontakt</a>
      </div>
    </footer>
  );
};
