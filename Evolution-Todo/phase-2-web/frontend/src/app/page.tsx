"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Nav from "@/components/Navbar/Nav";
import {
  Zap,
  Users,
  BarChart3,
  Shield,
  Bell,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Star,
  ChevronRight,
  Play,
  Rocket,
  Smartphone,
  Laptop,
  Globe,
  ShieldCheck,
  Zap as Lightning,
  Infinity as InfinityIcon,
  Cloud,
  Code,
  Palette,
  Heart,
  Award,
  MessageSquare,
  Database,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    if (statsInView) {
      const taskTimer = setInterval(() => {
        setCompletedTasks((prev) => {
          if (prev >= 1248573) return prev;
          return prev + Math.floor(Math.random() * 100) + 1;
        });
      }, 10);

      const userTimer = setInterval(() => {
        setActiveUsers((prev) => {
          if (prev >= 50000) return prev;
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 20);

      const timeTimer = setInterval(() => {
        setTimeSaved((prev) => {
          if (prev >= 250000) return prev;
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 30);

      return () => {
        clearInterval(taskTimer);
        clearInterval(userTimer);
        clearInterval(timeTimer);
      };
    }
  }, [statsInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
      <Nav />

      {/* Hero Section with Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-28 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Task Management
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <span className="block text-gray-800 dark:text-white">
                Productivity Journey
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
              The ultimate{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                AI-powered
              </span>{" "}
              todo app that helps you accomplish more with intelligent task
              management
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden"
            >
              <Link href={"/dashboard"}>
                <span className="relative z-10 flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-xl text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 hidden lg:block"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-40 right-10 hidden lg:block"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-4">
              <Zap className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Powerful Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                supercharge
              </span>{" "}
              productivity
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Packed with cutting-edge features designed to streamline your
              workflow and boost efficiency
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 },
              }}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity -z-10" />

              <div
                className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 mb-4">
              <Rocket className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Simple & Effective
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Get started in{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-24 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-1/2">
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-y-1/2 animate-pulse" />
                </div>
              )}

              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                {/* Step Number */}
                <div className="absolute -top-5 -left-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                  0{index + 1}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6 ml-auto">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {step.description}
                </p>
                <ul className="space-y-3">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start text-gray-600 dark:text-gray-400"
                    >
                      <ChevronRight className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-4xl p-8 md:p-12 text-center text-white overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              Ready to{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-pink-400 bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Productivity?
            </h2>
            <p className="text-xl mb-10 opacity-95 max-w-3xl mx-auto">
              Join users who have revolutionized their workflow with TodoFlow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                Get Started Free
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-transparent border-2 border-white/50 text-white font-bold rounded-xl text-lg backdrop-blur-sm hover:border-white transition-all"
              >
                Schedule a Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  TodoFlow
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-Powered Productivity Suite
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              The ultimate productivity tool designed to help individuals and
              teams accomplish more with intelligent task management powered by
              AI.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column, index) => (
            <div key={index}>
              <h4 className="font-bold text-gray-800 dark:text-white mb-6 text-lg">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 TodoFlow. All rights reserved. Built with ❤️ for the
              Hackathon.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Features Data
const features = [
  {
    icon: <Zap className="w-8 h-8 text-white" />,
    title: "AI-Powered Suggestions",
    description:
      "Intelligent task recommendations using advanced machine learning algorithms.",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    bullets: [
      "Smart priority scoring",
      "Pattern recognition",
      "Adaptive scheduling",
      "Context-aware suggestions",
    ],
  },
  {
    icon: <Users className="w-8 h-8 text-white" />,
    title: "Team Collaboration",
    description:
      "Seamless teamwork with real-time updates and shared workspaces.",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    bullets: [
      "Real-time collaboration",
      "Role-based permissions",
      "Team analytics",
      "Shared calendars",
    ],
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-white" />,
    title: "Advanced Analytics",
    description:
      "Detailed insights into your productivity patterns and progress.",
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
    bullets: [
      "Productivity trends",
      "Time tracking",
      "Goal completion rates",
      "Custom reports",
    ],
  },
  {
    icon: <Shield className="w-8 h-8 text-white" />,
    title: "Enterprise Security",
    description:
      "Bank-level security with end-to-end encryption and compliance.",
    color: "bg-gradient-to-br from-gray-700 to-gray-900",
    bullets: [
      "End-to-end encryption",
      "GDPR compliant",
      "Regular backups",
      "SOC 2 certified",
    ],
  },
  {
    icon: <Bell className="w-8 h-8 text-white" />,
    title: "Smart Reminders",
    description:
      "Intelligent notifications that adapt to your schedule and habits.",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    bullets: [
      "Context-aware alerts",
      "Smart snooze",
      "Location-based reminders",
      "Priority notifications",
    ],
  },
  {
    icon: <Calendar className="w-8 h-8 text-white" />,
    title: "Calendar Integration",
    description:
      "Sync with all major calendar platforms for seamless scheduling.",
    color: "bg-gradient-to-br from-purple-500 to-violet-600",
    bullets: [
      "Google Calendar sync",
      "Outlook integration",
      "Apple Calendar",
      "Multi-calendar view",
    ],
  },
];

// Steps Data
const steps = [
  {
    icon: <Smartphone className="w-8 h-8 text-purple-500" />,
    title: "Sign Up",
    description: "Create your free account in less than a minute.",
    details: [
      "No credit card required",
      "Import existing tasks",
      "Set up your profile",
      "Choose your plan",
    ],
  },
  {
    icon: <Laptop className="w-8 h-8 text-blue-500" />,
    title: "Customize",
    description: "Tailor TodoFlow to match your workflow.",
    details: [
      "Set up projects & teams",
      "Configure notifications",
      "Integrate your tools",
      "Customize your dashboard",
    ],
  },
  {
    icon: <Rocket className="w-8 h-8 text-pink-500" />,
    title: "Accelerate",
    description: "Watch your productivity soar with AI assistance.",
    details: [
      "AI task prioritization",
      "Automated scheduling",
      "Smart reminders",
      "Progress tracking",
    ],
  },
];

// Footer Links
const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "API", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#contact" },
      { name: "Press Kit", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Tutorials", href: "#" },
      { name: "Webinars", href: "#" },
      { name: "Status", href: "#" },
    ],
  },
];

// Social Links
const socialLinks = [
  { icon: <Globe className="w-5 h-5" />, href: "#" },
  { icon: <MessageSquare className="w-5 h-5" />, href: "#" },
  { icon: <Database className="w-5 h-5" />, href: "#" },
  { icon: <Heart className="w-5 h-5" />, href: "#" },
];
