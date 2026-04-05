<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>

<h1>📘 AI-Based Question Paper Generator</h1>

<p><strong>📚 Course:</strong> Natural Language Processing</p>
<p><strong>🎓 Class:</strong> Semester VI (Third Year Engineering)</p>
<p><strong>🏫 College:</strong> Pillai College of Engineering — 
<a href="https://www.pce.ac.in" target="_blank">www.pce.ac.in</a></p>
<p><strong>👨‍💻 Batch:</strong> TY COMP A — Batch A3</p>

<hr>

<h2>🔹 Overview</h2>
<p>
The <strong>AI-Based Question Paper Generator</strong> is a smart web application that automates the generation of academic question papers using <strong>Natural Language Processing (NLP)</strong> and AI.
</p>

<p>
The system generates structured question papers based on syllabus, difficulty level, and Bloom’s Taxonomy. It ensures balanced question distribution, reduces manual effort, and improves accuracy.
</p>

<p>🔗 <strong>Live Website:</strong> 
<a href="https://paper-gen-seven.vercel.app/" target="_blank">
https://paper-gen-seven.vercel.app/
</a>
</p>

<hr>

<h2>🎯 Objective</h2>

<ul>
  <li>Eliminate manual paper setting</li>
  <li>Reduce repetition of questions</li>
  <li>Ensure proper marks distribution</li>
  <li>Apply Bloom’s Taxonomy</li>
  <li>Automate answer generation</li>
</ul>

<hr>

<h2>🛠️ Technologies Used</h2>

<h3>Frontend</h3>
<ul>
  <li>React 19</li>
  <li>Vite</li>
  <li>TypeScript</li>
  <li>React Router DOM</li>
</ul>

<h3>Styling</h3>
<ul>
  <li>Tailwind CSS</li>
  <li>Tailwind Merge</li>
  <li>Clsx</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>TSX (TypeScript execution)</li>
</ul>

<h3>Database</h3>
<ul>
  <li>Firebase Firestore</li>
</ul>

<h3>Authentication</h3>
<ul>
  <li>Firebase Authentication</li>
</ul>

<h3>AI Integration</h3>
<ul>
  <li>Google Gemini API (@google/genai)</li>
</ul>

<h3>PDF Generation</h3>
<ul>
  <li>html2canvas</li>
  <li>jsPDF</li>
</ul>

<h3>UI & Icons</h3>
<ul>
  <li>Lucide React</li>
  <li>Motion</li>
</ul>

<h3>Other Tools</h3>
<ul>
  <li>dotenv</li>
  <li>Zod</li>
</ul>

<hr>

<h2>📊 Dataset</h2>

<p><strong>Source:</strong> AI-generated questions + user inputs</p>

<ul>
  <li>Subject and topics</li>
  <li>Difficulty level</li>
  <li>Question formats (MCQ, descriptive, case-based)</li>
  <li>Model answers</li>
</ul>

<p>Data is optionally stored in Firebase Firestore.</p>

<hr>

<h2>⚙️ Installation</h2>

<pre>
git clone &lt;repo-url&gt;
cd question-paper-generator
npm install
npm run dev
</pre>

<h3>🔑 Environment Variables</h3>

<pre>
NEXT_PUBLIC_FIREBASE_API_KEY=&lt;firebase-api-key&gt;
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=&lt;firebase-auth-domain&gt;
NEXT_PUBLIC_FIREBASE_PROJECT_ID=&lt;firebase-project-id&gt;

GEMINI_API_KEY=&lt;gemini-api-key&gt;
</pre>

<hr>

<h2>🚀 Usage</h2>

<ul>
  <li>Login using Firebase Authentication</li>
  <li>Enter subject and topics</li>
  <li>Select difficulty and format</li>
  <li>Generate question paper using AI</li>
  <li>Download as PDF</li>
</ul>

<hr>

<h2>⚙️ Functionalities</h2>

<ul>
  <li>AI-based question generation using Gemini</li>
  <li>Bloom’s Taxonomy-based questions</li>
  <li>Multiple formats (MCQ, descriptive, case-based)</li>
  <li>PDF export using jsPDF</li>
  <li>Repetition avoidance logic</li>
  <li>Real-time generation</li>
  <li>Secure authentication</li>
  <li>Responsive UI</li>
</ul>

<hr>

<h2>📈 Results</h2>

<ul>
  <li>Automated question paper generation</li>
  <li>Balanced topic coverage</li>
  <li>Improved efficiency</li>
  <li>Reduced manual workload</li>
</ul>

<hr>

<h2>🎥 Demo Video</h2>

<p><strong>Demo:</strong> www.youtube.com</p>

<hr>

<h2>👥 Team Members</h2>

<ul>
  <li>Pachpande Phalguni Chetan</li>
  <li>Palekar Vedant Vijay</li>
  <li>Panicker Anjali Jayakumar</li>
  <li>Janhavi Ravindra Patil</li>
  <li>Patil Kshitij Virendra</li>
  <li>Abhay Muraleedharan Pillai</li>
  <li>Pulipati Aditya Prakash</li>
  <li>Saini Shanikumar Mulchand</li>
  <li>Sharma Manik</li>
  <li>Shetty Puja Sridhar</li>
  <li>Shetty Yash Satish</li>
  <li>Shinde Pavanraj Arun</li>
  <li>Shivale Sahil Santosh</li>
</ul>

<hr>

<h2>💻 Contributions</h2>

<table border="1" cellpadding="8" cellspacing="0">
<tr>
<th>Member</th>
<th>Contribution</th>
</tr>

<tr><td>Pachpande Phalguni</td><td>Designed and implemented the core AI-based question generation workflow, including prompt engineering with Gemini API to ensure structured, syllabus-aligned, and balanced output across different formats.</td></tr>

<tr><td>Palekar Vedant</td><td>Developed frontend components using React and Vite, focusing on user-friendly forms for input, topic selection, and seamless navigation throughout the application.</td></tr>

<tr><td>Panicker Anjali</td><td>Integrated Bloom’s Taxonomy into the system by designing logic to generate questions across multiple cognitive levels, ensuring effective academic assessment.</td></tr>

<tr><td>Janhavi Patil</td><td>Implemented Firebase Firestore integration for storing generated papers and user data, ensuring efficient data structuring and retrieval.</td></tr>

<tr><td>Patil Kshitij</td><td>Developed intelligent logic to reduce repetition in generated questions by refining prompts and improving variation in AI responses.</td></tr>

<tr><td>Abhay Pillai</td><td>Worked on overall system integration by connecting frontend interfaces with backend APIs, ensuring smooth communication and data flow.</td></tr>

<tr><td>Pulipati Aditya</td><td>Implemented model answer generation and structured formatting of outputs to make them suitable for evaluation and readability.</td></tr>

<tr><td>Saini Shanikumar</td><td>Developed backend services using Express.js, handled API integration with Gemini, and optimized performance and reliability of the application.</td></tr>

<tr><td>Sharma Manik</td><td>Designed and implemented logic for generating structured question papers with proper marks distribution and formatting.</td></tr>

<tr><td>Shetty Puja</td><td>Enhanced UI/UX design using Tailwind CSS, ensuring responsive design, visual consistency, and improved user interaction.</td></tr>

<tr><td>Shetty Yash</td><td>Developed analytics and tracking features to monitor generated papers and improve insights into system usage.</td></tr>

<tr><td>Shinde Pavanraj</td><td>Performed debugging, testing, and optimization across modules to improve system stability and reduce errors.</td></tr>

<tr><td>Shivale Sahil</td><td>Assisted in testing, validation, and deployment of the project to ensure reliability and correctness before final release.</td></tr>

</table>

<hr>

<h2>📚 References</h2>

<ul>
  <li><a href="https://ai.google.dev/" target="_blank">Google Gemini API Documentation</a></li>
  <li><a href="https://firebase.google.com/docs" target="_blank">Firebase Documentation</a></li>
  <li><a href="https://react.dev/" target="_blank">React Documentation</a></li>
  <li><a href="https://vitejs.dev/" target="_blank">Vite Documentation</a></li>
  <li><a href="https://tailwindcss.com/docs" target="_blank">Tailwind CSS Documentation</a></li>
  <li><a href="https://expressjs.com/" target="_blank">Express.js Documentation</a></li>
  <li><a href="https://www.npmjs.com/package/jspdf" target="_blank">jsPDF Documentation</a></li>
  <li><a href="https://www.npmjs.com/package/html2canvas" target="_blank">html2canvas Documentation</a></li>
</ul>

<hr>

<h2>🙌 Acknowledgement</h2>

<p>We thank our faculty and institution for their support and guidance.</p>

</body>
</html>