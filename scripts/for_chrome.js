/**
 *   1. Переходим на эту страницу
 *       (CHANNELNAME меняем на свой)
 *         https://dashboard.twitch.tv/u/CHANNELNAME/content/clips/channel
 *   2. Скроллим таблицу с клипами вниз до упора
 *   3. ВНИМАТЕЛЬНО ЧИТАЕМ принцип работы и примечания ниже
 *   4. Открываем DevTools браузера (по умолчанию F12), переходим в консоль браузера, копипастим туда скрипт и жмём Enter
 *   5. Жмём кнопку для запуска скрипта (находится в конце списка клипов на странице)
 *
 * ⚠️Современные браузеры обычно не качают более 10 файлов за раз⚠️
 *    Принцип работы скрипта:
 *        1. В папку загрузок скачивается список обнаруженных клипов в формате json (можно просмотреть блокнотом)
 *        2. Запускается скачивание {clipsPerRequest} файлов (по умолчанию 5)
 *        3. Пауза {offset} секунд (по умолчанию 10. можно уменьшить на свой страх и риск)
 *        4. Шаги 2 и 3 повторяются, пока список клипов не закончится
 *    Примечания:
 *        - Скрипт не будет работать, если запускать не на той странице
 *        - Скрипт не будет работать, если не разрешена одновременная загрузка нескольких файлов
 *            (если браузер запросил разрешение - разрешить, обновить страницу и перезапустить скрипт)
 *        - Скрипт не будет работать, если в браузере не включены автосохранения файлов при загрузке
 *        - Скрипт не будет работать, если отсутствует статус редактора или владельца канала
 *        - Скрипт может пропускать файлы, если все 10 слотов загрузки будут заняты на момент попытки скачивания
 *            (в таком случае рекомендуется увеличить offset)
 *        - Скрипт может не работать, если селектор отличается от того, что использовался у автора
 *            (в этом случае следует попросить показать пальчиком, где найти подходящий)
 *        - Скрипт не увидит файлы, которые браузер не отрендерил на момент запуска
 *            (скролль ручками таблицу вниз до упора)
 *        - НИ В КОЕМ СЛУЧАЕ НЕ КЛИКАЙ ПО КЛИПАМ. Таблица с клипами должна быть в первозданном и однотипном виде
 *        - Во время работы скрипта ВКЛАДКУ НЕ ЗАКРЫВАТЬ и СТРАНИЦУ НЕ ОБНОВЛЯТЬ. Это остановит выполнение скрипта.
 *        - Если потребуется остановить работу скрипта (для отмены/перезапуска), можно обновить страницу в браузере (не в консоли) или закрыть вкладку.
 *        - Было протестировано на Chrome версии 104.0.5112.81
 */
{
  let selector = ".fLixHT";
  let params = { offset: 10, clipsPerRequest: 3 };

  createDownLoadButton(selector, params);
}

function createDownLoadButton(selector, params) {
  let clips = document.querySelector(selector);
  let button = document.createElement("button");
  button.style.backgroundColor = "#9147ff";
  button.style.borderRadius = "5px";
  button.style.padding = "3px";
  button.style.margin = "3px";
  button.innerHTML = "КАЧАТЬКАЧАТЬКАЧАТЬ";
  button.onclick = () => requestDownload(selector, params);

  clips.after(button);
}

function requestDownload(selector, params) {
  selector += ">*:not(.scrollable-trigger__wrapper)";
  let clipList = Array.from(document.querySelectorAll(selector), getClipData);

  console.log(`> обнаружено клипов: ${clipList.length}`);
  downloadNameList(clipList);
  console.log(`⚠️ не закрывайте вкладку пока загружаются файлы!!!⚠️`);
  console.log(`⚠️ не закрывайте вкладку пока загружаются файлы!!!⚠️`);
  console.log(`⚠️ не закрывайте вкладку пока загружаются файлы!!!⚠️`);
  startDownload(clipList, params);
}

function getClipData(clip) {
  let clipData = [...clip.querySelectorAll("h5,a")];
  let a = clipData.pop();
  let [title, streamer, game] = Array.from(clipData, e => e.title);
  let fileName = a.pathname.slice(1);
  return { a, title, streamer, game, fileName };
}

function downloadNameList(clips) {
  console.log(`> подготавливаем список…`);
  let urlList = [];
  let nameList = [];
  clips.forEach(e => {
    urlList.push(e.a.href);
    nameList.push({
      fileName: e.fileName.replace("%7C", "_"),
      title: e.title,
      streamer: e.streamer,
      game: e.game,
      URL: e.a.href,
    });
  });
  let a = document.createElement("a");
  let json = JSON.stringify({ urlList, nameList }, null, "\t");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = "fileList.json";
  a.click();
  console.log("> список готов!");
}

function startDownload(clips, params) {
  console.log(`> начинаем загрузку…`);
  let delay = 3000;
  for (let n in clips) {
    if (+n && +n % params.clipsPerRequest == 0) delay += params.offset * 1000;
    setTimeout(() => {
      console.log(`> загружаем "${clips[n].fileName.replace("%7C", "_")}"…`);
      clips[n].a.click();
    }, delay);
    delay += 1000;
  }
}
