const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = function() {
  // This will hold our final navigation data
  let navigationData = [];
  
  // Get manually configured navigation settings from navigation.json
  let navSettings = {};
  try {
    const navFile = fs.readFileSync(path.join(__dirname, 'navigation.json'), 'utf8');
    navSettings = JSON.parse(navFile);
  } catch (e) {
    console.warn('No navigation.json file found or error parsing it');
    navSettings = { items: [] };
  }
  
  // Create a map of path to settings for quick lookup
  const settingsMap = {};
  navSettings.items.forEach(item => {
    settingsMap[item.path] = item;
  });
  
  // Scan the src directory for .njk files
  const srcDir = path.join(__dirname, '..');
  const files = fs.readdirSync(srcDir);
  
  files.forEach(file => {
    if (file.endsWith('.njk') && !file.startsWith('_')) {
      const filePath = path.join(srcDir, file);
      let title = file.replace('.njk', '');
      let pagePath = '/' + (file === 'index.njk' ? '' : title + '/');
      
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
      
      // Format title (capitalize first letter)
      title = title === 'index' ? 'Home' : title.charAt(0).toUpperCase() + title.slice(1);
      
      // Create navigation item, using settings from navigation.json if available
      const navItem = {
        title: title,
        path: pagePath,
        show_in_nav: true // Default to showing in nav
      };
      
      // Override with custom settings if available
      if (settingsMap[pagePath]) {
        Object.assign(navItem, settingsMap[pagePath]);
      }
      
      navigationData.push(navItem);
    }
  });
  
  return navigationData;
}