import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const Hero = () => {
  return (
    <motion.section
      id="home"
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="hero-container">
        <motion.div
          className="hero-content"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className="hero-badge">
            <span> 👋 Hello, I'm </span>
          </motion.div>
          <motion.h1
            className="glitch"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
          >
            Kunal Maurya
          </motion.h1>
          <motion.h2 className="hero-subtitle" variants={fadeInUp}>
          Full Stack Developer
          </motion.h2>
          <motion.p className="hero-description" variants={fadeInUp}>
            Aspiring ReactJS developer with hands-on experience building responsive UIs using React Hooks, Context API, and component-based design. Skilled in modern front-end tooling and passionate about turning user-centric designs into scalable web applications. Actively seeking frontend internship opportunities.
          </motion.p>

          <motion.div className="cta-buttons" variants={staggerContainer}>
            <motion.a
              href="#projects"
              className="cta-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Work
            </motion.a>
            <motion.a
              href="#contacts"
              className="cta-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Me
            </motion.a>
          </motion.div>
          <motion.div className="social-links" variants={staggerContainer}>
            <motion.a href="https://github.com/kunalmaurya-17-24" target="_blank">
              <i className="fab fa-github"> </i>
            </motion.a>
            <motion.a href="https://www.linkedin.com/in/kunal-maurya-a58035304" target="_blank">
              <i className="fab fa-linkedin"> </i>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="code-display">
            <SyntaxHighlighter
              language="typescript"
              customStyle={{
                margin: 0,
                padding: "2rem",
                height: "100%",
                borderRadius: "20px",
                background: "rgba(30, 41, 59, 0.8)",
                backdropFilter: "blur(10px)",
                marginBottom: 50,
              }}
              style={vscDarkPlus}
            >
              {`const aboutMe: DeveloperProfile = {
  codename: "Kunal Maurya",
  origin: "🌍 New Delhi, India",
  role: "Frontend Developer | React Enthusiast",
  stack: {
    languages: ["JavaScript", "TypeScript", "C++", "Python"],
    frameworks: ["React", "Next.js", "Material-UI"],
  },
  traits: [
    "UI/UX focused",
    "performance optimizer",
    "clean code advocate",
    "dark mode enthusiast",
  ],
  missionStatement:
    "Turning user-centric designs into scalable web applications.",
  availability: "Open for frontend internship roles (2025)",
};`}
            </SyntaxHighlighter>
          </div>

          <motion.div
            className="floating-card"
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="card-content">
              <span className="card-icon"> 💻 </span>
              <span className="card-text">
                Currently building tools like TailorTalk – an AI calendar assistant.
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
