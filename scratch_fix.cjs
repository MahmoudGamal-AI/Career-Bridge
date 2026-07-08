const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/setPage\(['"]([^'"]+)['"]\)/g, (match, p1) => {
    return `navigate('/${p1 === 'home' ? '' : p1}')`;
  });
  // Also fix `<HomePage setPage={setPage} />` if it exists
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

fixFile('src/pages/HomePage.tsx');
fixFile('src/pages/ServicesPage.tsx');
