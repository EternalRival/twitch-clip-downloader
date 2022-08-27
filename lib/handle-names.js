const path = require("path");

exports.getUniqueName = (filename, arr) => {
  const separator = " _";
  let n = 0;
  while (arr.some(e => path.basename(e.name) == path.basename(filename))) {
    let { dir, name, ext } = path.parse(filename);
    name = !n ? name + separator : name.slice(0, -`${n}`.length);
    filename = path.join(dir, name + ++n + ext);
  }
  return filename;
};

exports.fixName = str => str.trim().replace(/[\\/:*?"'<>|]/g, "");
