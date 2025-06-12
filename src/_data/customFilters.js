const markdownIt = require('markdown-it');

module.exports = {
  /**
   * Custom markdown filter that:
   * 1. Adds leading slash to image paths that don't already have one
   * 2. Renders images without wrapping them in paragraph tags
   */
  customMarkdown: function(content) {
    if (!content) return '';
    
    // Create a markdown-it instance with custom rendering
    const md = markdownIt({
      html: true, // Enable HTML tags in source
      breaks: true, // Convert '\n' in paragraphs into <br>
      linkify: true // Autoconvert URL-like text to links
    });
    
    // Customize the renderer to handle images differently
    const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.image = function(tokens, idx, options, env, self) {
      const token = tokens[idx];
      
      // Get the src attribute
      const srcIndex = token.attrIndex('src');
      if (srcIndex >= 0) {
        let src = token.attrs[srcIndex][1];
        
        // Add leading slash if needed and image path doesn't already have http/https
        if (!src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
          src = '/' + src;
          token.attrs[srcIndex][1] = src;
        }
      }
      
      return defaultRender(tokens, idx, options, env, self);
    };
    
    // Process content to avoid wrapping standalone images in paragraphs
    let html = md.render(content);
    
    // Replace <p><img ...></p> with just <img ...>
    html = html.replace(/<p>(<img [^>]+>)<\/p>/g, '$1');
    
    return html;
  }
};