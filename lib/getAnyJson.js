import * as fs from "fs";
import { exit } from "process";

export function getAnyJson(dir) {
  const file = fs.readdirSync(dir).find(f => f.toLowerCase().endsWith(".json"));
  if (!file) console.log(`⛔ отсутствует json файл в папке '${dir}'!`), exit();
  console.log(file);
  return JSON.parse(fs.readFileSync(`${dir}/${file}`));
}
