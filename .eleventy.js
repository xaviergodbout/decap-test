const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
    // Add pages to NAV
    eleventyConfig.addCollection("pages", function(collectionApi) {
        return collectionApi.getAll().filter(item => {
          return item.inputPath.startsWith("./src/") &&
                 item.inputPath.endsWith(".njk") &&
                 item.data.permalink; // Only get pages with permalink
        });
      });

    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/img");
    eleventyConfig.addPassthroughCopy("src/admin");

    // Initialize Markdown-It
    const markdownLib = markdownIt({ html: true });

    // Add a custom filter named "markdown"
    eleventyConfig.addFilter("markdown", (value) => {
        return markdownLib.render(value || "");
    });

    // Optional but recommended: use this library globally
    eleventyConfig.setLibrary("md", markdownLib);

    return {
        dir: {
            input: "src", // Source files
            output: "public", // Output files
            includes: "_includes",
            data: "_data"
        },
    };
};

  