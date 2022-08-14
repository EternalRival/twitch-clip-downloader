import * as fs from "fs";

export const getUniqueName = (p, e, n = 0, s = " _") =>
  fs.existsSync(p)
    ? getUniqueName(p.slice(0, -(n ? s + n + e : e).length) + s + ++n + e, e, n)
    : p;

export const fixName = str => str.replace(/[:*?"'<>|]/g, "");
