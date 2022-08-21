const create = tag => document.createElement(tag);
const getById = id => document.getElementById(id);
const listen = (eventName, callback) =>
  window.myAPI.listen(eventName, callback);
const ipcSend = (eventName, args) => window.myAPI.send(eventName, args);
const ipcInvoke = async (eventName, args) => {
  const resolve = await window.myAPI.invoke(eventName, args);
  addLog(resolve.log);
  return resolve;
};

const h1 = document.getElementsByTagName("h1")[0];
const logBox = getById("log");
const btnClipboard = getById("btnClipboard");
const btnOpenURL = getById("btnOpenURL");
const btnPickFile = getById("btnPickFile");
const pickedFile = getById("pickedFile");
const btnPickDir = getById("btnPickDir");
const pickedDir = getById("pickedDir");
const btnGottaCatchEmAll = getById("btnGottaCatchEmAll");

listen("send-project-name", (_, str) => (h1.innerHTML = str));
btnClipboard.onclick = () => ipcInvoke("btnClipboardClick");
btnOpenURL.onclick = () =>
  ipcInvoke("openURL", { username: getById("username").value });
btnPickFile.onclick = () => pickFile();
btnPickDir.onclick = () => pickDir();
btnGottaCatchEmAll.onclick = () => ipcSend("request-downloads");
listen("ready-to-download", () => (btnGottaCatchEmAll.disabled = false));
listen("downloader-message", (_, str) => addLog(str));

welcomeMessage();

function addLog(str) {
  console.log(str);
  const div = create("div");
  div.innerHTML = str.replaceAll("\n", "<br>");
  logBox.appendChild(div);
  div.scrollIntoView();
}

async function pickFile() {
  pickedFile.innerText = (await ipcInvoke("dialog:pickFile"))?.fileName;
}
async function pickDir() {
  pickedDir.innerText = (await ipcInvoke("dialog:pickDir"))?.dirName;
}

function welcomeMessage() {
  let welcomeDiv = logBox.firstElementChild;

  const msgList = [
    "Доброго времени суток!",
    "Данная программа поможет тебе открыть страницу с клипами твоего канала, прокрутит её до конца и прокликает по ссылочкам загруки.",
    "Программа работает в полуавтоматическом режиме и всё, что нужно - быть залогиненным на Twitch в своём браузере.",
    "Ну и следовать инструкции, конечно. 😉",
    "<u>В первом пункте</u> введи имя своего Twitch-канала (либо имя канала, где ты являешься редактором).",
    "<u>Кнопка во втором пункте</u> положит в твой буфер обмена код, который пролистает страницу с клипами до самого конца.",
    "<u>Кнопка в третьем пункте</u> откроет в твоём браузере страницу с клипами.",
    "На этой странице тебе нужно открыть инструменты разработчика (по умолчанию F12).",
    "В инструментах разработчика найди консоль (console) и вставь код из буфера обмена в поле для ввода (по умолчанию Ctrl+V).",
    "Нажав Enter ты запустишь процесс прокрутки страницы.",
    "Во время прокрутки страницы откинься на спинку кресла и подожди.",
    "Список клипов на странице не будет пополняться, если страница будет не в фокусе (не сворачивай страницу).",
    "Как только страница будет прокручена до конца, твой браузер сгенерирует и сохранит json файл со списком имён клипов и ссылок для их загрузки.",
    "Ссылки на клипы в этом файле временные и действуют лишь несколько часов. (если файл устарел, вместо файлов ты получишь пустышки)",
    "<u>Кнопка в четвёртом пункте</u> откроет меню, в котором нужно найти и выбрать этот json файл.",
    "<u>Кнопка в пятом пункте</u> служит для выбора папки, куда твои клипы будут загружаться.",
    "<u>Кнопка в шестом пункте</u> запустит процесс загрузки клипов.",
    "Кнопка в седьмом пункте…",
    "Подожди…",
    "Нет такой кнопки D:",
    "Время, которое займёт загрузка клипов, зависит от их количества и скорости твоего интернета.",
    "Программа была протестирована на браузерах 'FireFox 103.0.2 (x64)' и 'Chrome 104.0.5112.81 (x64)'.",
    "Дата последнего тестирования указана в правом верхнем углу программы.",
    "Во время тестирования разом было скачано 726 клипов (13,9 ГБ).",
    "Время не стоит на месте и сайт Twtich периодически меняется.",
    "Если с того дня Twitch изменил HTML-код страницы клипов канала (как-либо изменился дизайн), программу использовать крайне не рекомендуется.",
    "Серьёзно, лучше не надо. Может произойти что-угодно. (от падения программы с ошибкой до полного удаления клипов с канала)",
    "Все действия выполняются на свой страх и риск.",
  ];

  for (let i in msgList)
    setTimeout(() => {
      welcomeDiv.innerHTML += `💬 ${msgList[i]}<br>`;
      welcomeDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    }, (+i + 1) * 2500);
}
