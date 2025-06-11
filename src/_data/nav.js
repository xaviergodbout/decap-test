const fs = require("fs");
const path = require("path");

module.exports = function () {
  const dir = path.join(__dirname, "navigation");
  const items = [];

  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const raw = fs.readFileSync(path.join(dir, file));
      const json = JSON.parse(raw);
      items.push(json);
    });
  }

  return items.sort((a, b) => a.order - b.order);
};
