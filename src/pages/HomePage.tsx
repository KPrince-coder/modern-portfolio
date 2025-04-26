import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import SectionDivider from "../components/ui/SectionDivider";
import SkillCard from "../components/ui/SkillCard";
import ProjectCard from "../components/ui/ProjectCard";
import FeaturedBlogPosts from "../components/home/FeaturedBlogPosts";
import ProfileImage from "../components/ui/ProfileImage";
import { usePersonalData } from "../hooks/useSupabase";

const HomePage = () => {
  // Fetch personal data for profile image
  const { data: personalData, isLoading: isLoadingPersonal } =
    usePersonalData();

  // Use personal data or fallback
  const personalInfo = personalData || {
    name: "John Doe",
    title: "Creative Developer & Designer",
    bio: "I build exceptional digital experiences that are fast, accessible, and visually appealing.",
    profile_image_url: "",
  };

  return (
    <Container>
      <div className="py-20">
        {/* Hero Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center lg:text-start"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
                Crafting the Future with Code and Intelligence
              </h1>
              <h2 className="text-xl md:text-2xl mb-6">
                Data Engineer | Full Stack Developer | Android Developer | AI
                Engineer
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 ">
                I build exceptional digital experiences that are fast,
                accessible, and visually appealing.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-center">
                <a
                  href="#projects"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-[170px]"
                >
                  View My Work
                </a>
                <a
                  href="#contact"
                  className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors w-[170px]"
                >
                  Contact Me
                </a>
              </div>
            </motion.div>

            {/* Profile Image Component */}
            <ProfileImage
              imageUrl={personalInfo.profile_image_url}
              name={personalInfo.name}
              isLoading={isLoadingPersonal}
              size="sm"
            />
          </div>
        </section>

        <SectionDivider />

        {/* Skills Section */}
        <section className="mb-32 pt-8" id="skills">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              My Skills
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              I've worked with a variety of technologies to create exceptional
              digital experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <SkillCard
                key={skill.name}
                icon={skill.icon}
                title={skill.name}
                description={skill.description}
                level={skill.level || 3}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Featured Projects Section */}
        <section className="mb-32 pt-8" id="projects">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Here are some of my recent projects. Check out the Projects page
              for more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={project.id || project.title}
                id={
                  project.id || project.title.toLowerCase().replace(/\s+/g, "-")
                }
                title={project.title}
                description={project.description}
                imageUrl={
                  project.imageUrl ||
                  "https://via.placeholder.com/800x450?text=Project+Image"
                }
                tags={project.technologies}
                delay={index * 0.2}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/projects"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              View All Projects
            </a>
          </div>
        </section>

        <SectionDivider />

        {/* Featured Blog Posts Section */}
        <section className="mb-32 pt-8" id="blog">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Featured Blog Posts
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Check out my latest thoughts and insights on technology, design,
              and development.
            </p>
          </motion.div>

          <FeaturedBlogPosts />

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </section>

        <SectionDivider />

        {/* Contact CTA Section */}
        <section
          id="contact"
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 md:p-12 mt-16"
        >
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
            >
              Let's Work Together
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Have a project in mind? I'd love to hear about it. Let's discuss
              how we can work together.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <a
                href="/contact"
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </Container>
  );
};

// Sample data
const skills = [
  {
    name: "Frontend Development",
    description:
      "Creating responsive and interactive user interfaces with modern frameworks.",
    level: 5,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Backend Development",
    description: "Building robust server-side applications and APIs.",
    level: 4,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "UI/UX Design",
    description: "Designing intuitive and visually appealing user experiences.",
    level: 4,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
      </svg>
    ),
  },
  {
    name: "Database Design",
    description: "Designing and optimizing database schemas for performance.",
    level: 3,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
      </svg>
    ),
  },
  {
    name: "AI Integration",
    description: "Implementing AI solutions to enhance user experiences.",
    level: 3,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Performance Optimization",
    description: "Optimizing applications for speed and efficiency.",
    level: 4,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Responsive Design",
    description: "Creating websites that work on all devices and screen sizes.",
    level: 5,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    name: "Accessibility",
    description: "Ensuring websites are usable by people of all abilities.",
    level: 4,
    icon: (
      <svg
        className="w-10 h-10"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const featuredProjects = [
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    description:
      "A full-featured e-commerce platform with product management, cart functionality, and payment processing.",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    link: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ai-content-generator",
    title: "AI-Powered Content Generator",
    description:
      "A tool that uses AI to generate blog posts, social media content, and marketing copy.",
    technologies: ["React", "Python", "TensorFlow", "GPT-3"],
    link: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1677442135136-760c813a6f14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "portfolio-website",
    title: "Portfolio Website",
    description:
      "A modern portfolio website built with React and Tailwind CSS to showcase projects and skills.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    link: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "task-management-app",
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates and team features.",
    technologies: ["React", "Firebase", "Redux", "Material UI"],
    link: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  },
];

export default HomePage;
