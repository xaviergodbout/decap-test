// Update theme color dynamically
const bgColor = getComputedStyle(document.body).backgroundColor;
document.querySelector('meta[name="theme-color"]').setAttribute('content', bgColor);