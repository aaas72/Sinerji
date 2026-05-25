const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirsToSearch = ['client/app', 'client/components'];
let files = [];
dirsToSearch.forEach(d => {
    files = files.concat(walk(path.join(__dirname, d)));
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/max-w-7xl mx-auto/g, 'app-container');
    content = content.replace(/max-w-6xl mx-auto/g, 'app-container');
    content = content.replace(/max-w-\[1200px\] mx-auto/g, 'app-container');
    content = content.replace(/max-w-7xl/g, 'app-container');
    content = content.replace(/max-w-6xl/g, 'app-container');
    content = content.replace(/max-w-\[1200px\]/g, 'app-container');
    content = content.replace(/container mx-auto/g, 'app-container');
    content = content.replace(/max-w-5xl/g, 'app-container');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
