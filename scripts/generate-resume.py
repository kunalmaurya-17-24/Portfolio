"""Build the public CV from the owner-supplied Europass facts.

Run with Python + reportlab. Private header data and ABOUT ME are intentionally
absent. Both source PDFs are preserved. The static output is three pages.
"""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'Kunal-Maurya-Resume.pdf'
OUT.parent.mkdir(exist_ok=True)
arial = Path('C:/Windows/Fonts')
if (arial / 'arial.ttf').exists():
    pdfmetrics.registerFont(TTFont('CV', str(arial / 'arial.ttf')))
    pdfmetrics.registerFont(TTFont('CV-Bold', str(arial / 'arialbd.ttf')))
    pdfmetrics.registerFontFamily('CV', normal='CV', bold='CV-Bold', italic='CV', boldItalic='CV-Bold')
    BODY, BOLD = 'CV', 'CV-Bold'
else:
    BODY, BOLD = 'Helvetica', 'Helvetica-Bold'

RED = colors.HexColor('#cf1932')
INK = colors.HexColor('#16161b')
MUTED = colors.HexColor('#50505a')
W, H = A4
WIDTH = W - 84
styles = {
    'name': ParagraphStyle('name', fontName=BOLD, fontSize=30, leading=34, textColor=INK, spaceAfter=8),
    'strap': ParagraphStyle('strap', fontName=BOLD, fontSize=9.5, leading=13, textColor=RED, spaceAfter=12),
    'contact': ParagraphStyle('contact', fontName=BODY, fontSize=9.2, leading=14, textColor=MUTED, spaceAfter=3),
    'section': ParagraphStyle('section', fontName=BOLD, fontSize=13, leading=17, textColor=INK, spaceBefore=14, spaceAfter=10),
    'role': ParagraphStyle('role', fontName=BOLD, fontSize=10.8, leading=14, textColor=INK),
    'date': ParagraphStyle('date', fontName=BODY, fontSize=9, leading=13, textColor=MUTED, alignment=2),
    'bullet': ParagraphStyle('bullet', fontName=BODY, fontSize=9.35, leading=12.9, textColor=INK, leftIndent=10, firstLineIndent=-10, spaceAfter=5),
    'body': ParagraphStyle('body', fontName=BODY, fontSize=9.5, leading=13.6, textColor=INK, spaceAfter=8),
    'small': ParagraphStyle('small', fontName=BODY, fontSize=9, leading=12.5, textColor=MUTED, spaceAfter=8),
    'pagehead': ParagraphStyle('pagehead', fontName=BOLD, fontSize=19, leading=24, textColor=INK, spaceAfter=4),
    'skill': ParagraphStyle('skill', fontName=BODY, fontSize=9, leading=12.5, textColor=INK, spaceAfter=7),
    'credential': ParagraphStyle('credential', fontName=BODY, fontSize=9.2, leading=12.8, textColor=INK, spaceAfter=7),
}

def p(text, style='body'):
    return Paragraph(text, styles[style])

def bullets(items):
    return [p('&#8226; ' + item, 'bullet') for item in items]

def record(title, meta, items, after=11):
    table = Table([[p(title, 'role'), p(meta, 'date')]], colWidths=[WIDTH-175,175])
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
    return [KeepTogether([table, *bullets(items)]), Spacer(1,after)]

def footer(c, doc):
    c.saveState()
    c.setFillColor(RED)
    c.rect(42,H-23,27,4,fill=1,stroke=0)
    c.setStrokeColor(colors.HexColor('#d7d7dc'))
    c.setLineWidth(.6)
    c.line(42,37,W-42,37)
    c.setFillColor(MUTED)
    c.setFont(BODY,8)
    c.drawString(42,24,'KUNAL MAURYA / PUBLIC CV')
    c.drawRightString(W-42,24,f'{doc.page} / 3')
    c.restoreState()

story = [p('Kunal Maurya','name'), p('EXPERIENCE / PROJECTS / EDUCATION','strap')]
story += [
    p('Delhi, India  ·  <link href="mailto:kunalmaurya.mait@gmail.com" color="#16161b">kunalmaurya.mait@gmail.com</link>','contact'),
    p('<link href="https://portfolio-eight-mocha-28.vercel.app/" color="#16161b">portfolio-eight-mocha-28.vercel.app</link>  ·  <link href="https://github.com/kunalmaurya-17-24" color="#16161b">github.com/kunalmaurya-17-24</link>','contact'),
    p('Professional experience','section'),
]
story += record('LLM Post Training Expert<br/><font color="#cf1932">Ethara AI</font>','15 Jun 2026 - 10 Nov 2026<br/>Gurugram, India',[
    'Used <b>Trinity</b>, a multi-agent adversarial benchmarking framework, to generate, audit and validate challenging evaluation tasks for frontier AI models in reinforcement learning environments.',
    'Executed agentic task-generation, independent-auditing and difficulty-calibration workflows for reliable and reproducible model evaluation.',
    'Evaluated <b>500+ LLM responses</b> for factual accuracy, reasoning quality, instruction adherence and consistency using structured rubrics.',
    'Identified inconsistencies in annotated datasets and model-generated outputs, supporting data quality, benchmark integrity and evaluation reliability.',
    'Coordinated approximately <b>20-25 team members</b> across AI evaluation workflows, supporting task execution and quality standards.',
    'Conducted multimodal evaluations involving <b>text, images, videos, AI-generated code and web applications</b>.',
])
story += record('Python AI Intern<br/><font color="#cf1932">Chirpn IT Solutions</font>','16 Feb 2026 - 30 Apr 2026<br/>Gurugram, India',[
    'Developed an AI-powered software testing agent integrating LLMs with <b>Playwright</b> for automated test generation, execution and validation.',
    'Integrated <b>Claude CLI and Codex CLI</b> for source-code analysis, test generation and structured reporting.',
    'Improved test generation using <b>Jira acceptance criteria, user requirements and source-code context</b>.',
    'Reduced testing execution from <b>over 10 minutes to under 4 minutes</b>, and report generation from <b>30 seconds to under 8 seconds</b>.',
    'Developed <b>Python, FastAPI and SSE</b> backend services for real-time AI workflow monitoring.',
])
story += record('Agentic AI Intern<br/><font color="#cf1932">FrugalX</font>','5 Nov 2025 - 30 Apr 2026<br/>Delhi, India',[
    'Developed a multimodal audio retrieval system combining speech recognition, acoustic embeddings and semantic search.',
    'Integrated <b>Whisper, CLAP and MiniLM</b> for transcription, acoustic representation and text-based retrieval.',
    'Implemented <b>HNSW vector indexing and similarity search</b> with <b>BGE-based reranking</b> to improve retrieval relevance.',
    'Developed preprocessing, repair and validation methods for missing or inconsistent temporal boundaries in audio transcription pipelines.',
    'Implemented <b>local CPU inference and persistent model loading</b> for efficient audio retrieval.',
], after=0)

story += [PageBreak(), p('Kunal Maurya','pagehead'), p('PROJECTS','strap')]
story += record('CrossSense: Cross-Modal<br/>Satellite Image Retrieval','1 Nov 2026 - Current',[
    'Investigated retrieval between <b>Sentinel-1 synthetic aperture radar (SAR)</b> and <b>Sentinel-2 optical imagery</b>, learning representations for geographically corresponding image patches across sensing modalities.',
    'Developed a reproducible pipeline for <b>geospatial preprocessing, patch pairing, model training and retrieval evaluation</b>.',
    'Implemented geographic train, validation and test splits with <b>spatial leakage detection</b>.',
    'Built a <b>dual-branch CNN</b> using <b>symmetric InfoNCE contrastive loss</b> and compared it against a statistical-feature retrieval baseline.',
    'Evaluated bidirectional retrieval using <b>Recall@K and Mean Reciprocal Rank (MRR)</b>.',
    'Initial experiments on <b>36 synthetic image pairs</b> identified limitations in the CNN approach relative to the statistical baseline; <b>real-satellite training and evaluation are planned</b>.',
],after=0)
story += [p('<link href="https://github.com/kunalmaurya-17-24/CrossSense" color="#cf1932">GitHub / CrossSense</link>','small'),Spacer(1,12)]
story += record('Sentinel: Autonomous Financial<br/>Discipline Agent','16 Jan 2026 - 10 Feb 2026',[
    'Explored natural-language financial queries by combining LLM interpretation with structured database operations for consistent, reliable information retrieval.',
    'Built a hybrid architecture with <b>CrewAI</b> task orchestration and <b>LangGraph</b> structured SQL execution.',
    'Implemented natural-language-to-SQL workflows for financial information retrieval from <b>PostgreSQL</b>.',
    'Developed SQL-error detection and self-correction to refine generated queries.',
    'Integrated <b>Opik</b> workflow observability and <b>Pydantic</b> structured-output validation.',
],after=0)
story += [p('<link href="https://github.com/kunalmaurya-17-24/autonomous-sql-analyst-langgraph-crewai" color="#cf1932">GitHub / autonomous-sql-analyst-langgraph-crewai</link>','small'),Spacer(1,12)]
story += record('YouTube Multimodal RAG Pipeline','2 Jan 2026 - 25 Jan 2026',[
    'Investigated semantic retrieval and temporal metadata for question-answering over long-form video, returning relevant information with corresponding timestamps.',
    'Built a transcript processing and retrieval pipeline using <b>Python, ChromaDB and yt-dlp</b>.',
    'Implemented <b>timestamp-aligned semantic chunking</b> to preserve context and temporal relationships.',
    'Combined <b>vector and keyword retrieval</b> for semantic and terminology-specific searches.',
    'Implemented <b>context-grounded answer generation with timestamp references</b> to improve response traceability.',
],after=0)
story += [p('<link href="https://github.com/kunalmaurya-17-24/YouTube-Multimodal-RAG-Pipeline" color="#cf1932">GitHub / YouTube-Multimodal-RAG-Pipeline</link>','small')]

story += [PageBreak(), p('Kunal Maurya','pagehead'), p('EDUCATION / SKILLS / CREDENTIALS','strap'),p('Education','section')]
story += [
    p('<b>Bachelor of Technology (B.Tech), Computer Science and Technology</b><br/>Guru Gobind Singh Indraprastha University, New Delhi, India<br/><b>Minor Specialization:</b> Artificial Intelligence and Machine Learning<br/>1 Aug 2022 - 1 May 2026  /  <b>CGPA 7.47/10, First Division</b><br/>EQF level 6  /  200 credits'),
    p('<b>Coursework:</b> Applied Mathematics I &amp; II; Discrete Mathematics; Computational Methods; Probability, Statistics and Linear Programming; Statistics; Statistical Modelling &amp; Data Analytics; Data Structures; Design and Analysis of Algorithm; Object-Oriented Programming Using C++; Database Management Systems; Theory of Computation; Operating Systems; Computer Networks; Software Engineering; Compiler Design; Artificial Intelligence; Data Science; Machine Learning; Reinforcement Learning and Deep Learning; Pattern Recognition and Computer Vision; Data Warehousing and Data Mining.','small'),
    p('Technical and research skills','section'),
    p('<b>Programming &amp; technical</b><br/>Python, C, C++, Java, JavaScript, SQL, PostgreSQL, MySQL, MongoDB, Git, Docker, FastAPI','skill'),
    p('<b>AI &amp; machine learning</b><br/>Machine Learning, Deep Learning, Reinforcement Learning, Computer Vision, Multimodal AI, Contrastive Learning, Agentic AI, RAG, NLP, Large Language Models','skill'),
    p('<b>Analytical &amp; research</b><br/>Information Retrieval, Model Evaluation, LLM Benchmarking, Error Analysis, Data Validation, Data Preprocessing, Feature Engineering, Data Mining, Data Visualisation, Data Science, Statistical Analysis, Exploratory Data Analysis (EDA)','skill'),
    p('<b>Frameworks &amp; libraries</b><br/>PyTorch, Scikit-learn, NumPy, Pandas, Matplotlib, Hugging Face Transformers, LangChain, LangGraph, CrewAI, FAISS, ChromaDB','skill'),
    p('Certifications and recognition','section'),
    p('<b>AI Fluency: Framework &amp; Foundations</b> - Anthropic  /  <link href="https://drive.google.com/file/d/1KaWO3WTsqk2FLBfPz_pkFx75kcdXLWur/view?usp=sharing" color="#cf1932">View credential</link>','credential'),
    p('<b>Claude 101</b> - Anthropic  /  <link href="https://drive.google.com/file/d/1ZrvLxznH8EJylWBG4Q7gAXqxLEty_HUD/view?usp=sharing" color="#cf1932">View credential</link>','credential'),
    p('<b>Generative AI with Large Language Models</b> - Udemy  /  <link href="https://drive.google.com/file/d/1pGH61ewp9hVNMSDLNool4kCkOOb8Xfdu/view?usp=sharing" color="#cf1932">View credential</link>','credential'),
    p('<b>Datacom Automation AI Accelerator: Autonomous Agent Job Simulation</b><br/>Forage  /  <link href="https://drive.google.com/file/d/1MBAD279i0uMgeCCdjK3-fU3XyGhb6AeY/view?usp=sharing" color="#cf1932">View credential</link>','credential'),
    p('<b>AI Interview - Outstanding Performance</b> - micro1  /  14 Nov 2026<br/>Recognition in an AI-based interview assessment.  /  <link href="https://drive.google.com/file/d/1Ayw8UdbV3waFcte9bILwSCIrb-1eAHDR/view?usp=sharing" color="#cf1932">View recognition</link>','credential'),
    p('<b>Google Arcade Winter 2024 - Champion milestone</b><br/>Hands-on technical learning activities and practical challenges.','credential'),
    p('Languages','section'),
    p('<b>Hindi:</b> mother tongue. <b>English:</b> Listening C1; Reading B2; Spoken production B2; Spoken interaction B2; Writing B2.','small'),
]

doc=SimpleDocTemplate(str(OUT),pagesize=A4,leftMargin=42,rightMargin=42,topMargin=42,bottomMargin=49,title='Kunal Maurya - Public CV',author='Kunal Maurya',subject='Experience, projects, education and skills',creator='Kunal Maurya Portfolio')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
