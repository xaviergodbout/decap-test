const markdownIt = require("markdown-it");
const { customMarkdown } = require('./src/_data/customFilters');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/img");
    eleventyConfig.addPassthroughCopy("src/admin");
    eleventyConfig.addPassthroughCopy("public");

    // Initialize Markdown-It
    const markdownLib = markdownIt({ html: true });

    // Add a custom filter named "markdown"
    eleventyConfig.addFilter("markdown", (value) => {
        return markdownLib.render(value || "");
    });

    // Add custom markdown filter
    eleventyConfig.addFilter("customMarkdown", customMarkdown);

    // Optional but recommended: use this library globally
    eleventyConfig.setLibrary("md", markdownLib);

    return {
        dir: {
            input: "src", // Source files
            output: "_site", // Output files
            includes: "_includes",
            data: "_data"
        },
    };
};

