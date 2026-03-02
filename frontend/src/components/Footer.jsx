import React from 'react';
import { Heart, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Team', href: '#team' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    services: [
      { name: 'Yoga', href: '#yoga' },
      { name: 'Meditation', href: '#meditation' },
      { name: 'Ayurveda', href: '#ayurveda' },
      { name: 'Reiki', href: '#reiki' },
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'FAQ', href: '#faq' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer id="contact" className="bg-background border-t" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                GoaHealers
              </span>
            </div>
            <p className="text-muted-foreground max-w-xs" data-testid="footer-description">
              Transform your wellness journey with Goa's finest holistic healing practitioners. Your path to balance and harmony starts here.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Goa, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@goahealers.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4" data-testid="footer-company-title">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    data-testid={`footer-company-link-${index}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4" data-testid="footer-services-title">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    data-testid={`footer-services-link-${index}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4" data-testid="footer-support-title">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    data-testid={`footer-support-link-${index}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
            © {currentYear} GoaHealers. All rights reserved. Built with <Heart className="inline w-4 h-4 text-teal-500" /> for wellness.
          </p>

          {/* Social Links */}
          <div className="flex gap-2" data-testid="footer-social-links">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-emerald-500/10"
                  data-testid={`footer-social-${social.label.toLowerCase()}`}
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    <IconComponent className="w-4 h-4" />
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}