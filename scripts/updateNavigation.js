const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path configurations
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const navFilePath = path.join(rootDir, 'src', '_data', 'navigation.json');

// Read existing navigation file
let navigation = { items: [] };
if (fs.existsSync(navFilePath)) {
  const navData = fs.readFileSync(navFilePath, 'utf8');
  navigation = JSON.parse(navData);
}

// Create a map of existing paths for quick lookup
const existingPaths = {};
navigation.items.forEach(item => {
  existingPaths[item.path] = true;
});

// Scan the src directory for .njk files
const files = fs.readdirSync(srcDir);
let newPagesAdded = false;

// Find pages not in navigation
const newPages = [];
files.forEach(file => {
  if (file.endsWith('.njk') && !file.startsWith('_')) {
    let title = file.replace('.njk', '');
    let pagePath = '/' + (file === 'index.njk' ? '' : title + '/');
    
    // Skip if already in navigation
    if (existingPaths[pagePath]) {
      return;
    }
    
    // Try to extract front matter to get the title
    try {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontMatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
      
      if (frontMatterMatch && frontMatterMatch[1]) {
        const frontMatter = yaml.load(frontMatterMatch[1]);
        if (frontMatter.title) {
          title = frontMatter.title;
        }
      }
    } catch (e) {
      console.warn(`Error processing front matter for ${file}:`, e);
    }
    
    // Format title (capitalize first letter)
    title = title === 'index' ? 'Home' : title.charAt(0).toUpperCase() + title.slice(1);
    
    // Add to new pages
    newPages.push({
      title: title,
      path: pagePath,
      show_in_nav: true,
      order: navigation.items.length + newPages.length // Assign order after existing items
    });
    
    newPagesAdded = true;
    console.log(`Added ${title} (${pagePath}) to navigation`);
  }
});

// Add new pages to navigation
if (newPages.length > 0) {
  navigation.items = [...navigation.items, ...newPages];
}

// Write updated navigation file if changes were made
if (newPagesAdded) {
  fs.writeFileSync(navFilePath, JSON.stringify(navigation, null, 2));
  console.log('Navigation file updated successfully!');
} else {
  console.log('No new pages to add to navigation.');
}