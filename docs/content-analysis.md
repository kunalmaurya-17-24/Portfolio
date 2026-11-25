# Resume and content analysis

Source: `KUNAL MAURYA RESUME - JUNE.pdf` (two pages). Both pages were rendered with Poppler at a 1600px maximum dimension and visually inspected. Text and URI annotations were extracted independently using the bundled Python runtime and pypdf. The source PDF was preserved.

## Public identity

- **Name:** Kunal Maurya
- **Professional title:** Agentic AI & LLM Engineer
- **General location:** New Delhi, India
- **Public professional email:** kunalmaurya.mait@gmail.com
- **GitHub:** https://github.com/kunalmaurya-17-24
- **LinkedIn:** https://www.linkedin.com/in/kunal-maurya-a58035304/

The resume's visible LinkedIn text is shortened; the actual URI annotation above is the reliable destination. The original includes a personal phone number. Omit that number from the website and any public resume derivative by default. There is no residential street address or identification number in the supplied PDF. Do not copy the original PDF directly into public assets without deciding whether to remove the phone number and metadata. Certificate documents themselves have not been inspected; link only to the supplied public destinations if desired.

A sanitized two-page derivative has been created at `public/Kunal-Maurya-Resume.pdf`. It preserves the supplied qualifications and reported outcomes, condenses prose, excludes the phone number, and retains the professional email, general city, correct GitHub/LinkedIn destinations, project repository, and certificate links. It was rendered and visually inspected; extraction confirms two pages, seven link annotations, and no personal phone number. The source PDF is unchanged.

## Experience: complete factual inventory

### Ethara AI - LLM Associate

**June 2026 - Present** (as stated in the supplied resume)

- Evaluated **500 LLM-generated responses** across diverse domains using structured rubrics covering accuracy, relevance, coherence, and instruction adherence.
- Performed prompt-response assessment, data validation, and quality assurance checks supporting large-scale LLM post-training workflows.
- Identified annotation inconsistencies and contributed to dataset refinement, data quality, and benchmark standards.
- Used analytical reasoning and language evaluation frameworks to assess model behavior and output quality.
- Collaborated with quality reviewers on feedback, evaluation consistency, project guidelines, and SLAs.

Use present-tense descriptions only for this current role. Do not extrapolate evaluation volume beyond the supplied 500 responses.

### Chirpn - Python AI Engineer

**February 2026 - April 2026**

- Owned core development of the **AI-powered QA Agent** inside a multi-agent software automation platform.
- Integrated **Claude CLI and Codex CLI** with dynamic provider routing for automated **Playwright** test generation, execution, and structured validation reports.
- Reduced end-to-end QA execution from **10+ minutes to under 4 minutes** by optimizing command generation, removing redundant test creation, and improving orchestration.
- Improved generated test-suite relevance by **approximately 70%**, using Jira acceptance criteria, requirements, and source context.
- Optimized token consumption, response consistency, and execution speed; no numeric token savings are supplied.
- Reduced final-report delivery from **30 seconds to under 8 seconds**.
- Enhanced **FastAPI + SSE** for live progress updates and frontend responsiveness.
- Implemented cross-browser automation across **Chromium, Firefox, and WebKit**.

### FrugalX - Agentic AI Intern

**November 2025 - April 2026**

- Built a local inference engine running **Whisper, CLAP, and MiniLM** on standard consumer CPUs without a GPU dependency.
- Built a real-time CLI with persistent in-memory model states and **sub-second search across thousands of audio chunks**.
- Developed data-repair and validation algorithms for missing or corrupted sub-second temporal boundaries in long-form audio.
- Unified localized word-level semantic text, speaker identification, and acoustic signatures into a queryable index.

### Infits - Web Development Intern (remote)

**September 2024 - December 2024**

- Built **Node.js and MySQL** backend services for a job-finding platform, with API responses **under 200ms**.
- Designed and optimized **15+ RESTful endpoints** and input-validation middleware; the resume reports **100% schema compliance**.
- Integrated **Cloud Firestore** for real-time mobile/server synchronization with **sub-100ms latency**.

The Chirpn and FrugalX dates overlap in the original. Preserve them; do not invent a narrative explaining the overlap.

## Personal project

### ATS Resume Tailoring Agent

**Stack:** Python, LangGraph, Docker, FastAPI; KeyBERT; LaTeX.

**Problem:** Repeatedly tailoring a resume to job descriptions is manual and time-consuming.

**Approach:** An autonomous agent parses job descriptions and rewrites LaTeX resumes. KeyBERT performs low-cost keyword extraction before expensive LLM rewrite calls. A LangGraph state machine validates output structure. A Dockerized FastAPI service exposes the workflow, with semantic scores measuring resume-to-job-description alignment.

**Reported outcomes:** **80% reduction in manual customization time** and **100% LaTeX compilation success** through structure validation. These are resume claims rather than independently benchmarked results; retain context and do not generalize them to universal guarantees.

**Repository:** https://github.com/kunalmaurya-17-24/ATS-Resume-Tailoring-Agent/tree/main

There is only one separately listed personal project in the provided resume. The QA Agent and local audio engine may be presented as **selected professional work** with explicit employer attribution. No repository, demo URL, screenshot, product name, or public ownership claim was supplied for those employer systems. Do not create such links or imply they are open source.

## Skills

Use categories and actual named technologies, without ratings or proficiency percentages.

- **Languages:** Python, C++, JavaScript (Node.js), SQL.
- **AI engineering:** Agentic workflows, LangGraph, CrewAI, Claude CLI, RAG architectures, LangChain, Transformers.js, Chroma, FAISS.
- **Automation and integrations:** n8n, Zapier, Latenode, webhooks, API integrations.
- **Backend and DevOps:** FastAPI, SSE (Server-Sent Events), Kubernetes (K8s), Docker, Postman, Git.
- **Additional experience-supported tools:** Codex CLI, Playwright, Chromium, Firefox, WebKit, Whisper, CLAP, MiniLM, MySQL, Cloud Firestore, KeyBERT, LaTeX.

Do not add frontend frameworks to the person's resume skill inventory merely because they are used to implement this portfolio.

## Education

**Maharaja Agrasen Institute of Technology, GGSIPU, Delhi**

**B.Tech in Computer Science & Technology, 2022 - 2026**

Relevant coursework: Data Structures & Algorithms, Machine Learning, Deep Learning, NLP, Computer Vision, DBMS, Operating Systems.

No GPA, class rank, distinction, or graduation ceremony status is supplied.

## Certifications and awards

- **Claude 101 - Anthropic.** Supplied certificate link: https://drive.google.com/file/d/1ZrvLxznH8EJylWBG4Q7gAXqxLEty_HUD/view?usp=sharing
- **AI Fluency: Framework & Foundations - Anthropic.** Supplied certificate link: https://drive.google.com/file/d/1KaWO3WTsqk2FLBfPz_pkFx75kcdXLWur/view?usp=sharing
- **Google Arcade 2024 (Winter):** Champion milestone for coding performance.
- **Datacom Automation AI Accelerator: Autonomous Agent Job Simulation - Forage.** Supplied certificate link: https://drive.google.com/file/d/1MBAD279i0uMgeCCdjK3-fU3XyGhb6AeY/view?usp=sharing

Do not present the Forage simulation as employment at Datacom. No dates are supplied for the certificates except the Google Arcade Winter 2024 award.

## Recommended information architecture

1. **Opening and hero:** Name, Agentic AI & LLM Engineer, and a concise editorial statement grounded in the agentic workflows, evaluation, and backend background. Example: "Building agents that move from reasoning to real work."
2. **Profile:** General location, factual professional focus, and short resume access. Avoid unsupported personality traits or availability statements.
3. **Selected work:** A leading ATS agent personal-project feature, followed by two clearly marked professional case studies: Chirpn QA automation and FrugalX local audio intelligence. Distinct visual treatments can represent documents, test execution, and acoustic search using original interface graphics rather than fabricated product screenshots.
4. **Experience:** Four-role timeline or selectable role menu, preserving supplied dates and employers.
5. **Technical toolkit:** Four tabbed categories drawn from the skills inventory. No arbitrary numeric rankings.
6. **Education and credentials:** Degree, coursework, certificates, and award.
7. **Contact:** Email, actual GitHub and LinkedIn destinations, and a sanitized public resume download.

## Editorial safeguards

- No fabricated testimonials, client names, awards, project launch dates, or project outcomes.
- Do not say "available for work" or imply a preferred employment arrangement unless the user supplies it.
- General location is appropriate; phone number should remain private by default.
- Keep employer-owned work attribution visible in expanded details as well as in showcase summaries.
- Resume facts are supplied claims, not independent verification. A portfolio should not promise the same metrics for future work.
