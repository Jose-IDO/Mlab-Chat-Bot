import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../button';

// Define type for navigation links
interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'HOME', href: '#' },
  { label: 'WHAT WE DO', href: '#', hasDropdown: true },
  { label: 'NEWS', href: '#' },
  { label: 'OUR STORY', href: '#' },
  { label: 'OPPORTUNITIES', href: '#', hasDropdown: true },
  { label: 'CONTACT US', href: '#' },
];

export default function Navbar(): React.ReactElement {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 !transition-all duration-300 ${
        isScrolled ? '!bg-[#1a2744] shadow-lg' : '!bg-transparent'
      }`}
    >
      <div className="!max-w-7xl !mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              m<span className="text-[#8cc63f]">l</span>ab
            </h1>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="px-3 py-2 !text-white/90 !hover:text-[#8cc63f] !text-xs font-semibold !tracking-wider flex !items-center gap-1 !transition-colors"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="bg-[#8cc63f] hover:bg-[#7ab635] text-white font-semibold text-xs tracking-wider px-6">
              CONTACT US
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#1a2744] border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block px-3 py-3 text-white/90 hover:text-[#8cc63f] text-sm font-semibold tracking-wider border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
            <Button className="w-full bg-[#8cc63f] hover:bg-[#7ab635] text-white font-semibold text-sm tracking-wider mt-4">
              CONTACT US
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
