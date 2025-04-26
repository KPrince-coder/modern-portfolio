import React from "react";
import { motion } from "framer-motion";
import ProfileImage from "../ui/ProfileImage";
import TypedText from "../ui/TypedText";
import FloatingElement from "../ui/FloatingElement";
import ParticleBackground from "../ui/ParticleBackground";
import AnimatedCodeBlock from "../ui/AnimatedCodeBlock";
import FloatingIcons from "../ui/FloatingIcons";

interface HeroSectionProps {
  personalInfo: {
    name: string;
    title: string;
    bio: string;
    profile_image_url: string;
  };
  isLoadingPersonal: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  personalInfo,
  isLoadingPersonal,
}) => {
  // Roles for the dynamic typing effect
  const roles = [
    "Full Stack Developer",
    "Android Developer (Jetpack Compose)",
    "AI Engineer",
    "Data Engineer",
  ];

  // Static tagline
  const tagline = "Where Data Meets Design and AI Sparks Innovation";

  return (
    <section className="relative mb-10 pb-32 overflow-hidden">
      {/* Particle background - only show on desktop for performance */}
      <div className="absolute inset-0 -z-10 hidden md:block">
        <ParticleBackground
          particleCount={20}
          particleColors={["#6366f1", "#8b5cf6", "#d946ef"]}
          connectParticles={true}
        />
      </div>

      {/* Floating tech icons */}
      <FloatingIcons className="opacity-20" iconCount={8} />

      {/* Animated code blocks in background */}
      <div className="absolute top-[10%] -left-10 -z-10 opacity-5 dark:opacity-10 hidden lg:block">
        <AnimatedCodeBlock />
      </div>
      <div className="absolute bottom-[10%] -right-10 -z-10 opacity-5 dark:opacity-10 hidden lg:block">
        <AnimatedCodeBlock />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center lg:text-start relative z-10"
        >
          {/* Gradient badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white animate-gradient-text">
              Available for new projects
            </span>
          </motion.div>

          {/* Main heading with gradient text */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block mb-2">Crafting the Future with</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-text">
              Code & Intelligence
            </span>
          </h1>

          {/* Typed roles with dynamic effect */}
          <h2 className="text-xl md:text-2xl mb-6 h-8 flex items-center justify-center lg:justify-start">
            <TypedText
              strings={roles}
              className="font-medium text-indigo-600 dark:text-indigo-400"
              typeSpeed={70}
              backSpeed={40}
              backDelay={1500}
              loop={true}
            />
          </h2>

          {/* Static tagline with gradient effect */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 animate-gradient-text font-medium">
              {tagline}
            </span>
          </p>

          {/* CTA buttons with hover effects */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <a
                href="#projects"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-[170px] inline-block"
              >
                View My Work
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <a
                href="#contact"
                className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors w-[170px] inline-block"
              >
                Contact Me
              </a>
            </motion.div>
          </div>

          {/* Stats with counting animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
          >
            <div className="text-center">
              <motion.span
                className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                5+
              </motion.span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Years Experience
              </span>
            </div>
            <div className="text-center">
              <motion.span
                className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                50+
              </motion.span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Projects
              </span>
            </div>
            <div className="text-center">
              <motion.span
                className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                20+
              </motion.span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Clients
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Profile image with floating animation */}
        <FloatingElement
          duration={6}
          xOffset={5}
          yOffset={5}
          rotationDegrees={2}
          className="relative z-10"
        >
          <div className="relative">
            {/* Decorative elements */}
            <motion.div
              className="absolute -z-10 -top-6 -left-6 w-20 h-20 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -z-10 -bottom-6 -right-6 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* Profile image */}
            <ProfileImage
              imageUrl={personalInfo.profile_image_url}
              name={personalInfo.name}
              isLoading={isLoadingPersonal}
              size="sm"
            />
          </div>
        </FloatingElement>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 hidden md:block"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ height: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-gray-400 dark:bg-gray-600 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
