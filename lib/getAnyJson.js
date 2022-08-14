import * as fs from "fs";

export function getAnyJson(dir) {
  const file = fs.readdirSync(dir).find(f => f.toLowerCase().endsWith(".json"));
  console.log(file);
  return JSON.parse(fs.readFileSync(`${dir}/${file}`));
}
