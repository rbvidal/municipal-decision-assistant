interface FooterProps {
  onLinkClick: (title: string) => void;
}

export default function Footer({ onLinkClick }: FooterProps) {
  const footerLinks = [
    { title: 'Impressum', url: '#' },
    { title: 'Datenschutz', url: '#' },
    { title: 'Barrierefreiheit', url: '#' },
    { title: 'Kontakt', url: '#' },
  ];

  return (
    <footer className="w-full py-md px-huge border-t border-border-default bg-white flex flex-col sm:flex-row justify-between items-center shrink-0 z-50">
      <span className="text-caption font-caption text-on-surface-variant mb-2 sm:mb-0 select-none">
        © 2024 Kommunale Entscheidungsplattform - Bundesrepublik Deutschland
      </span>
      <div className="flex gap-lg">
        {footerLinks.map((link) => (
          <button
            key={link.title}
            onClick={() => onLinkClick(link.title)}
            className="text-caption text-on-surface-variant hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {link.title}
          </button>
        ))}
      </div>
    </footer>
  );
}
