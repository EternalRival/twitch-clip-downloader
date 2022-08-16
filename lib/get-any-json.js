const fs = require("fs");
const { exit } = require("process");

exports.getAnyJson = dir => {
  const file = fs.readdirSync(dir).find(f => f.toLowerCase().endsWith(".json"));
  if (!file) console.log(`⛔ отсутствует json файл в папке '${dir}'!`), exit(); //todo сюда добавить диалог на случай если жсона нет
  console.log(`> Загружены данные из ${file}`);
  return JSON.parse(fs.readFileSync(`${dir}/${file}`));
};
