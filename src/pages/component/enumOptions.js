export const departmentOptions = [
  { code: "BSCS", name: "Bachelor of Science in Computer Science" },
  { code: "BSTM", name: "Bachelor of Science in Tourism Management" },
  { code: "BSBA", name: "Bachelor of Science in Business Administration" },
  { code: "BSHM", name: "Bachelor of Science in Hospitality Management" },
  { code: "BSA", name: "Bachelor of Science in Accountancy" },
  { code: "ACT", name: "Associate in Computer Technology" },
  { code: "BSNED", name: "Bachelor of Special Needs Education" },
  { code: "BEED", name: "Bachelor of Elementary Education" },
  { code: "BSED-ENG", name: "Bachelor of Secondary Education Major in English" },
  { code: "BSED-FIL", name: "Bachelor of Secondary Education Major in Filipino" },
];

export const genderOptions = [
  { code: "M", name: "Male" },
  { code: "F", name: "Female" },
];

export const yearLevelOptions = [
  { code: "1", name: "1st Year" },
  { code: "2", name: "2nd Year" },
  { code: "3", name: "3rd Year" },
  { code: "4", name: "4th Year" },
];

// File type mappings for icons
const fileTypeIcons = {
  // Documents
  doc: '📘', docx: '📘', pdf: '📕', txt: '📄', md: '📝', rtf: '�',
  
  // Spreadsheets
  xls: '📗', xlsx: '📗', csv: '📗',
  
  // Presentations
  ppt: '�', pptx: '📙',
  
  // Images
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️', svg: '🖼️', webp: '🖼️', ico: '🖼️',
  
  // Videos
  mp4: '🎥', avi: '🎥', mov: '🎥', wmv: '🎥', flv: '🎥', webm: '🎥', mkv: '🎥',
  
  // Audio
  mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵', m4a: '🎵',
  
  // Archives
  zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
  
  // Code/Web
  html: '💻', htm: '💻', css: '💻', js: '💻', jsx: '💻', ts: '💻', tsx: '💻', json: '💻', xml: '💻',
  
  // Configuration
  yml: '⚙️', yaml: '⚙️', env: '�', config: '⚙️', conf: '⚙️', ini: '⚙️',
  
  // Database
  sql: '🗄️', db: '🗄️', sqlite: '🗄️',
  
  // Fonts
  ttf: '🔤', otf: '🔤', woff: '🔤', woff2: '🔤',
  
  // Programming Languages
  py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️', php: '🐘', rb: '💎', go: '🐹', rs: '🦀', swift: '🍎', kt: '🎯', dart: '🎯',
  
  // Frameworks
  vue: '💚', svelte: '🧡',
  
  // Design
  psd: '🎨', ai: '🎨', fig: '🎨', sketch: '🎨',
};

export const getFileIcon = (fileName) => {
  if (!fileName) return '📄';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  return fileTypeIcons[extension] || '📄';
};

// File type letter mappings
const fileTypeLetters = {
  // Development
  jsx: '⚛️', tsx: '🔷', js: '🟨', ts: '🔷', html: '🌐', htm: '🌐', css: '🎨', scss: '💅', sass: '💅', json: '📋', xml: '📄',
  
  // Documents
  doc: '📘', docx: '📘', pdf: '📕', txt: '📝', md: '📝', rtf: '📄',
  
  // Spreadsheets
  xls: '📗', xlsx: '📗', csv: '📗',
  
  // Presentations
  ppt: '📙', pptx: '📙',
  
  // Images
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️', svg: '🖼️', webp: '🖼️', ico: '🖼️',
  
  // Videos
  mp4: '🎥', avi: '🎥', mov: '🎥', wmv: '🎥', flv: '🎥', webm: '🎥', mkv: '🎥',
  
  // Audio
  mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵', m4a: '🎵',
  
  // Archives
  zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
  
  // Config
  yml: '⚙️', yaml: '⚙️', env: '🔐', config: '⚙️', conf: '⚙️', ini: '⚙️',
  
  // Database
  sql: '🗄️', db: '🗄️', sqlite: '🗄️',
  
  // Fonts
  ttf: '🔤', otf: '🔤', woff: '🔤', woff2: '🔤',
  
  // Languages
  py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️', php: '🐘', rb: '💎', go: '🐹', rs: '🦀', swift: '🍎', kt: '🎯', dart: '🎯',
  
  // Frameworks
  vue: '💚', svelte: '🧡',
  
  // Design
  psd: '🎨', ai: '🎨', fig: '🎨', sketch: '🎨',
};

export const getFileTypeLetter = (fileName) => {
  if (!fileName) return '📄';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  return fileTypeLetters[extension] || '📄';
};


