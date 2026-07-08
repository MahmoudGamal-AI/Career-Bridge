import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'src/split_output');
const pagesDir = path.join(process.cwd(), 'src/pages');
const compDir = path.join(process.cwd(), 'src/components/layout');
const commonDir = path.join(process.cwd(), 'src/components/common');

[pagesDir, compDir, commonDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const preamblePath = path.join(outDir, '00_preamble.tsx');
let preamble = fs.readFileSync(preamblePath, 'utf8');

// The preamble has imports for lucide-react and react.
// We just need to add our local types and constants imports.
const localImportsPages = `
import { Page } from '../types';
import { NAV_LINKS, STATS, SERVICES_INDIVIDUALS, SERVICES_COMPANIES, JOBS, TESTIMONIALS, FAQS, STEPS } from '../lib/constants';
import StatCounter from '../components/common/StatCounter';
`;

const localImportsComp = `
import { Page } from '../../types';
import { NAV_LINKS } from '../../lib/constants';
`;

const processFile = (fileName, targetDir, importStr, componentNameOverride) => {
  if (!fs.existsSync(path.join(outDir, fileName))) return;
  const content = fs.readFileSync(path.join(outDir, fileName), 'utf8');
  // Export the function
  let newContent = content;
  if (componentNameOverride) {
      newContent = newContent.replace(/function\s+([A-Za-z0-9_]+)/, `export default function $1`);
  } else {
      newContent = newContent.replace(/function\s+([A-Za-z0-9_]+)/, `export default function $1`);
  }
  
  const finalContent = preamble + "\n" + importStr + "\n" + newContent;
  const destName = componentNameOverride ? componentNameOverride + '.tsx' : fileName.replace(/_PAGE/g, 'Page').toLowerCase().replace(/(^|_)([a-z])/g, (m, p1, p2) => p2.toUpperCase()) + '.tsx';
  
  let targetPath = path.join(targetDir, destName);
  // manual overrides for exact naming
  if (fileName === 'Animated_counter.tsx') targetPath = path.join(targetDir, 'StatCounter.tsx');
  if (fileName === 'Navbar.tsx') targetPath = path.join(targetDir, 'Navbar.tsx');
  if (fileName === 'Footer.tsx') targetPath = path.join(targetDir, 'Footer.tsx');
  if (fileName === 'ADMIN_DASHBOARD.tsx') targetPath = path.join(targetDir, 'AdminDashboard.tsx');
  if (fileName === 'UPLOAD_CV_PAGE.tsx') targetPath = path.join(targetDir, 'UploadCVPage.tsx');
  if (fileName === 'HIRE_TALENT_PAGE.tsx') targetPath = path.join(targetDir, 'HireTalentPage.tsx');
  
  fs.writeFileSync(targetPath, finalContent);
  console.log('Created', targetPath);
};

processFile('Animated_counter.tsx', commonDir, `import { Page } from '../../types';`, 'StatCounter');
processFile('Navbar.tsx', compDir, localImportsComp, 'Navbar');
processFile('Footer.tsx', compDir, localImportsComp, 'Footer');

const pages = ['HOME_PAGE.tsx', 'SERVICES_PAGE.tsx', 'JOBS_PAGE.tsx', 'ABOUT_PAGE.tsx', 'UPLOAD_CV_PAGE.tsx', 'HIRE_TALENT_PAGE.tsx', 'CONSULTATION_PAGE.tsx', 'CONTACT_PAGE.tsx', 'ADMIN_DASHBOARD.tsx'];

pages.forEach(p => {
  processFile(p, pagesDir, localImportsPages);
});

// For App.tsx itself
const appImports = `
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import JobsPage from './pages/JobsPage';
import AboutPage from './pages/AboutPage';
import UploadCVPage from './pages/UploadCVPage';
import HireTalentPage from './pages/HireTalentPage';
import ConsultationPage from './pages/ConsultationPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import { Page } from './types';
`;

let appContent = fs.readFileSync(path.join(outDir, 'APP.tsx'), 'utf8');
appContent = appContent.replace(/export default function App/, 'export default function App');
fs.writeFileSync(path.join(process.cwd(), 'src/app/App.tsx'), preamble + "\n" + appImports + "\n" + appContent);

console.log("Assembly done.");
