import * as React from "react";
import { Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

// Define type for social links
interface SocialLink {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

const socialLinks: SocialLink[] = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Youtube, href: "#" },
  { icon: Instagram, href: "#" },
];

const exploreLinks: string[] = ["HOME", "ABOUT", "NEWS", "SERVICES", "VACANCIES"];

export default function Footer(): React.ReactElement {
  return (
    <footer className="bg-[#1a2744] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo and Social */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-wider">
                m<span className="text-[#8cc63f]">l</span>ab
              </h2>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              mLab plays a catalytic role in nurturing and growing tech ecosystems in South Africa through its technology ecosystem strategy. mLab co-invests in ICT hubs and technology ecosystem enablers to ensure scale.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#8cc63f] flex items-center justify-center transition-colors duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[#8cc63f]">EXPLORE</h3>
            <ul className="space-y-3">
              {exploreLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-white/70 hover:text-[#8cc63f] transition-colors text-sm font-medium tracking-wider"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[#8cc63f]">CONTACT US</h3>
            <div className="space-y-4 text-sm">
              <p className="text-white/70">
                <span className="font-semibold text-white">The Innovation Hub, Enterprise Building, 8,</span>
                <br />
                Pretoria, 0020
              </p>
              <p className="text-white/70">
                <span className="font-semibold text-white">Email:</span> info@mlab.co.za
              </p>
              <p className="text-white/70">
                <span className="font-semibold text-white">Phone:</span> +27 12 844 0240
              </p>
            </div>

            {/* Map */}
            <div className="mt-6 rounded-lg overflow-hidden h-32">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.0889626621447!2d28.27881!3d-25.7461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e956614c3a3f8a5%3A0x5d61c5d2a3c3c2a4!2sThe%20Innovation%20Hub!5e0!3m2!1sen!2sza!4v1623456789012!5m2!1sen!2sza"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-white/50 text-sm">
            © {new Date().getFullYear()} mLab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
