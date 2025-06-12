const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Function to update navigation when a new page is detected
function updateNavigation() {
  // Path configurations
  const dataDir = __dirname;
  const srcDir = path.join(dataDir, '..');
  const navFilePath = path.join(dataDir, 'navigation.json');

  // Read existing navigation file
  let navigation = { items: [] };
  try {
    const navData = fs.readFileSync(navFilePath, 'utf8');
    navigation = JSON.parse(navData);
  } catch (e) {
    console.warn('No navigation.json file found or error parsing it');
    navigation = { items: [] };
  }

  // Create a map of existing paths for quick lookup
  const existingPaths = {};
  navigation.items.forEach(item => {
    existingPaths[item.path] = true;
  });

  // Scan the src directory for .njk files
  const files = fs.readdirSync(srcDir);
  let changes = false;

  files.forEach(file => {
    if (file.endsWith('.njk') && !file.startsWith('_')) {
      // Skip admin files
      if (file === 'admin.njk') return;
      
      const filePath = path.join(srcDir, file);
      let title = file.replace('.njk', '');
      let pagePath = '/' + (file === 'index.njk' ? '' : title + '/');
      
      // Skip if already in navigation
      if (existingPaths[pagePath]) return;
      
      // Try to extract front matter to get the title
      try {
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
      
      // Add new page to navigation
      navigation.items.push({
        title: title,
        path: pagePath,
        show_in_nav: true
      });
      
      changes = true;
      console.log(`Added ${title} (${pagePath}) to navigation`);
    }
  });

  // Write updated navigation file if changes were made
  if (changes) {
    fs.writeFileSync(navFilePath, JSON.stringify(navigation, null, 2));
    console.log('Navigation updated with new pages');
  }
}

// Run the update when this module is loaded (happens on build)
updateNavigation();

// Export a function that returns the processed navigation data
module.exports = function() {
  // Read navigation data after potential updates
  try {
    const navData = fs.readFileSync(path.join(__dirname, 'navigation.json'), 'utf8');
    return JSON.parse(navData);
  } catch (e) {
    console.warn('Error reading navigation data:', e);
    return { items: [] };
  }
};