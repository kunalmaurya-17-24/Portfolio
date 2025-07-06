import { motion } from "framer-motion";

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

export const Projects = () => {
  return (
    <motion.section
      id="projects"
      className="projects"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        My Projects
      </motion.h2>

      <motion.div
        className="project-grid"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {/* TempSto */}
        <a
          href="http://tstorage-1.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          <motion.div
            className="project-card"
            variants={fadeInUp}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="project-image"
              style={{ backgroundImage: "url('/projects/tempsto.png')" }}
              whileHover={{ scale: 1.05 }}
            />
            <h3>TempSto - Secure Cloud Storage</h3>
            <p>
              Built a file-upload UI using React and ImageKit. Optimized with lazy-loading (18% smaller bundle). Backend supports 50+ concurrent uploads via Node.js/Express.
            </p>
            <div className="project-tech">
              <span>React</span>
              <span>Node.js</span>
              <span>MongoDB</span>
            </div>
          </motion.div>
        </a>

        {/* TailorTalk */}
        <a
          href="https://tailortalkassignment-m.streamlit.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          <motion.div
            className="project-card"
            variants={fadeInUp}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="project-image"
              style={{ backgroundImage: "url('/projects/tailortalk.png')" }}
              whileHover={{ scale: 1.05 }}
            />
            <h3>TailorTalk - AI Calendar Assistant</h3>
            <p>
              Natural language scheduling with Mistral-7B via HuggingFace. Google Calendar integration, Meet link generation. Built using Streamlit + Render.
            </p>
            <div className="project-tech">
              <span>Python</span>
              <span>Streamlit</span>
              <span>HuggingFace</span>
            </div>
          </motion.div>
        </a>

        {/* Sorting Visualizer */}
        <a
          href="https://github.com/kunalmaurya-17-24/SortingVisualizer"
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          <motion.div
            className="project-card"
            variants={fadeInUp}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="project-image"
              style={{ backgroundImage: "url('/projects/SortingVisualizer.png')" }}
              whileHover={{ scale: 1.05 }}
            />
            <h3>Sorting Algorithm Visualizer</h3>
            <p>
              Animated visualization of sorting algorithms using React + Zustand. Unit-tested with Vitest (85% coverage). Auto-deployed with GitHub Actions.
            </p>
            <div className="project-tech">
              <span>React</span>
              <span>Zustand</span>
              <span>Vitest</span>
            </div>
          </motion.div>
        </a>
      </motion.div>
    </motion.section>
  );
};
