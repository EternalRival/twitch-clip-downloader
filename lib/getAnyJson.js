import * as fs from "fs";

export function getAnyJson(folder) {
  const file = `${fs.readdirSync(folder)[0]}`;
  console.log(file);
  return JSON.parse(fs.readFileSync(`${folder}/${file}`));
}
