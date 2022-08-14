import { exec } from "child_process";
import * as fs from "fs";
import * as https from "https";
import { getAnyJson } from "./getAnyJson.js";
import { getUniqueName, fixName } from "./handleNames.js";
const USERDIR = "./public";
const DOWNLOADROOT = `${USERDIR}/download`;
const EXTENSION = ".mp4";

const fileList = getAnyJson(`${USERDIR}/json`).nameList;

function getAllClips(list) {
  let c = list.length;
  function getClip(clip) {
    const streamer = fixName(clip.streamer),
      game = fixName(clip.game),
      title = fixName(clip.title),
      url = clip.URL;

    https.get(url, resolve => {
      const dir = `${DOWNLOADROOT}/${streamer}/${game}`,
        file = getUniqueName(`${dir}/${title}${EXTENSION}`, EXTENSION),
        short = file.slice(DOWNLOADROOT.length);

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      console.log(`> загрузка запрошена: ${short}`);

      const download = fs.createWriteStream(file);
      resolve.pipe(download);
      download.on("finish", () => {
        download.close();
        console.log(`> загрузка завершена: ${short}`);
      
        if (--c) return console.log(`осталось: ${c}`);
        console.log(`> все загрузки завершены! можно закрыть программу`);
        exec(`start "" "${DOWNLOADROOT.slice(2).replace("/", "\\")}"`);
      });
    });
  }
  list.forEach(getClip);
}

getAllClips(fileList);
