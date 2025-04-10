import { motion } from 'framer-motion';
import Container from '../components/layout/Container';
import SectionDivider from '../components/ui/SectionDivider';

const HomePage = () => {
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
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
              Creative Developer & Designer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              I build exceptional digital experiences that are fast, accessible, and visually appealing.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Contact Me
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Container with max width to make image more professional and not too big */}
            <div className="max-w-xs md:max-w-sm relative mx-auto">
              {/* Gradient border */}
              <div className="aspect-square rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {/* Placeholder for profile image */}
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-900 animate-spin-slow"></div>

              {/* Additional decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full border border-indigo-100 dark:border-indigo-800 opacity-70"></div>
              <div className="absolute -z-20 -bottom-6 -right-6 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-xl"></div>
              <div className="absolute -z-20 -top-6 -left-6 w-20 h-20 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-xl"></div>
            </div>
          </motion.div>
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
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">My Skills</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            I've worked with a variety of technologies to create exceptional digital experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                {skill.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{skill.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{skill.description}</p>
            </motion.div>
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
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Featured Projects</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Here are some of my recent projects. Check out the Projects page for more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                {/* Placeholder for project image */}
                <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project →
                </a>
              </div>
            </motion.div>
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

      {/* Contact CTA Section */}
      <section id="contact" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 md:p-12 mt-16">
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
            Have a project in mind? I'd love to hear about it. Let's discuss how we can work together.
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
    name: 'Frontend Development',
    description: 'Creating responsive and interactive user interfaces with modern frameworks.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Backend Development',
    description: 'Building robust server-side applications and APIs.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'UI/UX Design',
    description: 'Designing intuitive and visually appealing user experiences.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
      </svg>
    ),
  },
  {
    name: 'Database Design',
    description: 'Designing and optimizing database schemas for performance.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
      </svg>
    ),
  },
  {
    name: 'AI Integration',
    description: 'Implementing AI solutions to enhance user experiences.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Performance Optimization',
    description: 'Optimizing applications for speed and efficiency.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Responsive Design',
    description: 'Creating websites that work on all devices and screen sizes.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    name: 'Accessibility',
    description: 'Ensuring websites are usable by people of all abilities.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const featuredProjects = [
  {
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce platform with product management, cart functionality, and payment processing.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    link: '#',
  },
  {
    title: 'AI-Powered Content Generator',
    description: 'A tool that uses AI to generate blog posts, social media content, and marketing copy.',
    technologies: ['React', 'Python', 'TensorFlow', 'GPT-3'],
    link: '#',
  },
];

export default HomePage;
