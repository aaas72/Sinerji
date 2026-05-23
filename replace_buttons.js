const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = walkDir(directoryPath);

let replacedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // If the file imports Button from "@/components/ui/Button"
  if (content.includes('import Button from "@/components/ui/Button";')) {
    
    // Check if PrimaryButton is already imported
    if (content.includes('import PrimaryButton from "@/components/ui/PrimaryButton";')) {
      // Just remove the Button import
      content = content.replace('import Button from "@/components/ui/Button";\n', '');
      content = content.replace('import Button from "@/components/ui/Button";\r\n', '');
      content = content.replace('import Button from "@/components/ui/Button";', '');
    } else {
      // Replace with PrimaryButton import
      content = content.replace('import Button from "@/components/ui/Button";', 'import PrimaryButton from "@/components/ui/PrimaryButton";');
    }
    
    changed = true;
  }

  if (changed || content.includes('<Button') || content.includes('</Button>')) {
    // Replace JSX tags
    // Carefully replace only <Button and </Button>
    content = content.replace(/<Button(\s|>)/g, '<PrimaryButton$1');
    content = content.replace(/<\/Button>/g, '</PrimaryButton>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
    console.log(`Replaced in ${file}`);
  }
});

console.log(`Done. Replaced Button with PrimaryButton in ${replacedCount} files.`);
