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
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-2 lg:col-span-2 space-y-6"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
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

              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Empowering students worldwide with study tools, interactive quizzes, and a thriving community.
              </p>

              <div className="space-y-3">
                <ContactItem icon={Mail} text="support@eduplatform.com" />
                <ContactItem icon={Phone} text="+1 (555) 123-4567" />
                <ContactItem icon={MapPin} text="San Francisco, CA" />
              </div>
            </motion.div>

            {/* Link Sections - Stacked on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-2 lg:col-span-2"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm">
                Get the latest study materials and quiz updates in your inbox.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="py-6 md:py-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-gray-400 text-sm flex items-center"
            >
              © {new Date().getFullYear()} clys. Made with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mx-1 inline-flex"
              >
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </motion.span>{" "}
              for students.
            </motion.p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-9 h-9 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 ${social.color} backdrop-blur-sm`}
                  aria-label={`${social.icon.name} link`}
                >
                  <social.icon className="h-4 w-4 text-white" />
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
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </motion.button>
    </footer>
  );
}

// Reusable Components
function FooterColumn({ title, links }) {
  return (
    <div className="min-w-0">
      <h4 className="text-base font-semibold mb-4 text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <motion.a
              href={link.href}
              whileHover={{ x: 5 }}
              className="text-gray-400 hover:text-white transition-colors duration-300 block text-sm"
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
      whileHover={{ x: 5 }}
      className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 text-sm"
    >
      <Icon className="h-4 w-4 mr-3 text-purple-400 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </motion.div>
  );
}