"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUp,
} from "lucide-react";

export default function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    platform: [
      { name: "Browse Files", href: "#" },
      { name: "Take Quizzes", href: "#" },
      { name: "Join Contests", href: "#" },
      { name: "Upload Content", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Contact", href: "#contact" },
      { name: "Blog", href: "#" },
      { name: "Terms & Condition", href: "terms-condition" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Tutorials", href: "#" },
      { name: "Status", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "#", color: "hover:bg-gray-700" },
    { icon: Linkedin, href: "#", color: "hover:bg-blue-600" },
    { icon: Twitter, href: "#", color: "hover:bg-blue-400" },
    { icon: Instagram, href: "#", color: "hover:bg-pink-500" },
  ];

  return (
    <footer
      id="contact"
      className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-hidden"
    >
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Content */}
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-12">

            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-5"
            >
              <div className="flex items-center gap-3">
                <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  clys
                </span>
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm">
                Empowering students worldwide with study tools, interactive quizzes, and a thriving community.
              </p>

              {/* Contact items: 2-col grid on mobile, stacked on lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <ContactItem icon={Mail} text="support@eduplatform.com" />
                <ContactItem icon={Phone} text="+1 (555) 123-4567" />
                <ContactItem icon={MapPin} text="San Francisco, CA" />
              </div>
            </motion.div>

            {/* Link Columns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              {/* 3 equal columns on all screen sizes */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <FooterColumn title="Company" links={footerLinks.company} />
                <FooterColumn title="Platform" links={footerLinks.platform} />
                <FooterColumn title="Support" links={footerLinks.support} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-8 md:py-12 border-t border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-1">Stay Updated</h3>
              <p className="text-gray-300 text-sm">
                Get the latest study materials and quiz updates in your inbox.
              </p>
            </div>
            <form className="flex gap-2 w-full">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="py-5 md:py-8 border-t border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-gray-400 text-xs sm:text-sm flex items-center"
            >
              © {new Date().getFullYear()} clys. Made with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mx-1 inline-flex"
              >
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 fill-current" />
              </motion.span>{" "}
              for students.
            </motion.p>

            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 ${social.color} backdrop-blur-sm`}
                  aria-label={`${social.icon.name} link`}
                >
                  <social.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        viewport={{ once: true }}
        className="fixed bottom-6 right-6 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </motion.button>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="min-w-0">
      <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <motion.a
              href={link.href}
              whileHover={{ x: 4 }}
              className="text-gray-400 hover:text-white transition-colors duration-300 block text-xs sm:text-sm leading-snug"
            >
              {link.name}
            </motion.a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({ icon: Icon, text }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-purple-400 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </motion.div>
  );
}