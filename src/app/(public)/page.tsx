'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Shield, 
  Smartphone, 
  Bell,
  ArrowRight,
  Star,
  Route
} from 'lucide-react';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function FloatingBus({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100, rotate: -10 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        x: [null, 100, 200, 300],
        rotate: [null, 5, -5, 0]
      }}
      transition={{ 
        duration: 8, 
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute text-4xl"
      style={{ top: '20%' }}
    >
      🚌
    </motion.div>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Track your bus location in real-time with GPS precision. Never miss a ride again.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "View accurate ETAs and schedule your day around bus timings effortlessly.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Role-based access with NextAuth. Your data is protected with industry standards.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Progressive Web App works seamlessly on all your devices, online and offline.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Get notified about delays, arrivals, and important announcements instantly.",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Route,
      title: "Route Management",
      description: "Admin can manage multiple routes with stops, schedules, and waypoints easily.",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  const stats = [
    { value: "10+", label: "Bus Routes" },
    { value: "5000+", label: "Students" },
    { value: "50+", label: "Buses" },
    { value: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      role: "Computer Science Student",
      text: "The real-time tracking feature is amazing! I always know exactly when my bus will arrive.",
      avatar: "👨‍🎓"
    },
    {
      name: "Sara Ali",
      role: "Engineering Student",
      text: "The notification system keeps me informed about any delays. Highly recommended!",
      avatar: "👩‍💻"
    },
    {
      name: "Dr. Muhammad Rashid",
      role: "Transport Coordinator",
      text: "Managing routes and tracking buses has never been easier. Great system!",
      avatar: "👨‍🏫"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
        <FloatingBus delay={0} />
        <FloatingBus delay={3} />
        <FloatingBus delay={6} />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">NUTECH BusTrack</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">Now serving NUTECH University</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Track Your Bus
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              In Real-Time
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/70 mb-10 max-w-2xl mx-auto"
          >
            Never miss your bus again. Get real-time location updates, 
            smart notifications, and seamless commute experience at NUTECH University.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-lg flex items-center gap-2"
              >
                Start Tracking
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-lg border border-white/20"
              >
                View Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                A complete solution for university transportation management
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with your NUTECH email and verify your account" },
              { step: "02", title: "Choose Route", desc: "Select your campus route and get assigned to a bus" },
              { step: "03", title: "Track & Ride", desc: "View real-time bus location and get notified on arrival" }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                  >
                    <span className="text-6xl font-bold text-white/10">{item.step}</span>
                    <h3 className="text-2xl font-semibold text-white mt-4 mb-3">{item.title}</h3>
                    <p className="text-white/60">{item.desc}</p>
                  </motion.div>
                  {i < 2 && (
                    <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-white/30" />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Students Say
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{testimonial.avatar}</span>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-white/50 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-white/10 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/70 mb-10">
            Join thousands of students who trust NUTECH BusTrack for their daily commute
          </p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-xl"
            >
              Create Free Account
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">NUTECH BusTrack</span>
          </div>
          <div className="text-white/50 text-sm">
            © 2024 NUTECH University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
