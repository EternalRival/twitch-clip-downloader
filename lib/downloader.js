import { exec } from "child_process";
import * as fs from "fs";
import * as https from "https";
import { getAnyJson } from "./get-any-json.js";
import { getUniqueName, fixName } from "./handle-names.js";

const USERDIR = "./public";
const DOWNLOADROOT = `${USERDIR}/download`;
const EXTENSION = ".mp4";
export function getAllClips() {
  let list = getAnyJson(`${USERDIR}/json`);
  let remaining = list.length;
  let pending = list.length;
  let availableSlots = 50;
  let queue = setInterval(() => {
    if (remaining && availableSlots) {
      getClip(list[--remaining]);
      --availableSlots;
    }
  }, 500);

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
      download.on("finish", () => {
        download.close();
        console.log(`> загрузка завершена: ${short}`);
        ++availableSlots;
        --pending;
        if (pending > 0) {
          console.log(`осталось: ${pending}`);
        } else {
          clearInterval(queue);
          console.log(`> все загрузки завершены! можно закрыть программу`);
          exec(`start "" "${DOWNLOADROOT.slice(2).replace("/", "\\")}"`);
        }
      });
      resolve.pipe(download);
    });
  }
}
