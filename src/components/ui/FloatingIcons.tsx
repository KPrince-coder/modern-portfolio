import React from "react";
import { motion } from "framer-motion";

// Import common tech icons
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaDocker,
  FaGithub,
  FaDatabase,
  FaJs,
  FaCode,
} from "react-icons/fa";
import { SiTypescript, SiTailwindcss } from "react-icons/si";

interface FloatingIconsProps {
  className?: string;
  iconSize?: number;
  iconCount?: number;
}

const icons = [
  { Icon: FaReact, color: "#61DAFB" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: FaJs, color: "#F7DF1E" },
  { Icon: FaPython, color: "#3776AB" },
  { Icon: FaNodeJs, color: "#339933" },
  { Icon: SiTailwindcss, color: "#06B6D4" },
  { Icon: FaDatabase, color: "#47A248" },
  { Icon: FaDatabase, color: "#4169E1" },
  { Icon: FaDocker, color: "#2496ED" },
  { Icon: FaGithub, color: "#181717" },
  { Icon: FaCode, color: "#FF9900" },
  { Icon: FaCode, color: "#FF6F00" },
];

const FloatingIcons: React.FC<FloatingIconsProps> = ({
  className = "",
  iconSize = 24,
  iconCount = 8,
}) => {
  // For performance, use fewer icons on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const adjustedIconCount = isMobile ? Math.min(iconCount, 5) : iconCount;

  // Select a random subset of icons
  const selectedIcons = React.useMemo(() => {
    const shuffled = [...icons].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, adjustedIconCount);
  }, [adjustedIconCount]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {selectedIcons.map((icon, index) => {
        // Calculate random positions and animation properties
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = 15 + Math.random() * 20;
        const delay = Math.random() * 5;

        // Create a random path for the icon to follow
        const path = [
          [startX, startY],
          [
            startX + (Math.random() * 30 - 15),
            startY + (Math.random() * 30 - 15),
          ],
          [
            startX + (Math.random() * 30 - 15),
            startY + (Math.random() * 30 - 15),
          ],
          [startX, startY],
        ];

        return (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: `${path[0][0]}%`,
              y: `${path[0][1]}%`,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: [
                `${path[0][0]}%`,
                `${path[1][0]}%`,
                `${path[2][0]}%`,
                `${path[3][0]}%`,
              ],
              y: [
                `${path[0][1]}%`,
                `${path[1][1]}%`,
                `${path[2][1]}%`,
                `${path[3][1]}%`,
              ],
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <icon.Icon
              size={iconSize}
              color={icon.color}
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))" }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
