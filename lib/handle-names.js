const fs = require("fs");

exports.getUniqueName = (p, e) => {
  const separator = " _";
  let n = 0;
  while (fs.existsSync(p)) {
    const end = n ? n + e : e;
    p = p.slice(0, -end.length);
    if (!n) p += separator;
    p += ++n + e;
  }
  return p;
};

exports.fixName = str => str.trim().replace(/[\\/:*?"'<>|]/g, "");
