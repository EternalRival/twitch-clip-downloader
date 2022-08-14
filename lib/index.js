import { exec } from "child_process";
import * as fs from "fs";
import * as https from "https";
const USERDIR = "./public";
const JSONFILE = `${USERDIR}/json/fileList.json`;
const DOWNLOADROOT = `${USERDIR}/download`;

const fileList = JSON.parse(fs.readFileSync(JSONFILE)).nameList;

function getAllClips(list) {
  let c = list.length;
  function getClip(clip) {
    const fixName = str => str.replace(/[:*?"'<>|]/g, "");
    const handleNames = (p, n = 0) =>
      fs.existsSync(p)
        ? handleNames(p.replace(`${n ? ` _${n}` : ""}.mp4`, ` _${++n}.mp4`), n)
        : p;
    const streamer = fixName(clip.streamer),
      game = fixName(clip.game),
      title = fixName(clip.title),
      url = clip.URL;

    https.get(url, res => {
      const fileDir = `${DOWNLOADROOT}/${streamer}/${game}`,
        filePath = handleNames(`${fileDir}/${title}.mp4`),
        filePathShort = filePath.replace(DOWNLOADROOT, "");
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

      console.log(`> загрузка запрошена: ${filePathShort}`);

      const download = fs.createWriteStream(filePath);
      res.pipe(download);
      download.on("finish", () => {
        download.close();
        console.log(`> загрузка завершена: ${filePathShort}`);
        if (!--c) {
          console.log(`все загрузки завершены!`);
          exec(`start "" "${DOWNLOADROOT.slice(2).replace("/", "\\")}"`);
        } else console.log(`осталось: ${c}`);
      });
    });
  }
  list.forEach(getClip);
}

getAllClips(fileList);
