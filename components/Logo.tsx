import Link from 'next/link';

interface LogoProps {
  className?: string;
  href?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = '', href = '/', variant = 'light' }: LogoProps) {
  // For light backgrounds (white), use dark text for "Rent" and blue for "IQ"
  // For dark backgrounds, use white for "Rent" and blue for "IQ"
  // Note: Navbar has white background, so use dark text
  const rentColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const iqColor = 'text-[#2A6AFF]';
  
  const logoContent = (
    <span className={`font-bold text-3xl ${className}`}>
      <span className={rentColor}>Rent</span>
      <span className={iqColor}>IQ</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

