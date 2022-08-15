import * as fs from "fs";
import { exit } from "process";

export const getUniqueName = (p, e) => {
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
/* 
export const getUniqueNameRecursive = (p, e, n = 0, s = " _") =>
  fs.existsSync(p)
    ? getUniqueNameRecursive(p.slice(0, -(n ? s + n + e : e).length) + s + ++n + e, e, n)
    : p;
 */
export const fixName = str => str.replace(/[:*?"'<>|]/g, "");
