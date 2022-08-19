const create = tag => document.createElement(tag);
const getById = id => document.getElementById(id);
const ipcSend = (eventName, ...args) => window.myAPI.send(eventName, ...args);
/* const ipcGet = () => window.myAPI.projectName; */
const ipcInvoke = (eventName, ...args) =>
  window.myAPI.invoke(eventName, ...args);

const h1 = document.getElementsByTagName("h1")[0];
let logBox = getById("log");
let btnClipboard = getById("btnClipboard");
let btnOpenURL = getById("btnOpenURL");
let btnPickFile = getById("btnPickFile");
let pickedFile = getById("pickedFile");
let btnPickDir = getById("btnPickDir");
let pickedDir = getById("pickedDir");

ipcInvoke("getProjectName").then(a => (h1.innerHTML = a));
btnClipboard.onclick = () => defaultInvoke("parseJson");
btnOpenURL.onclick = () =>
  defaultInvoke("openURL", getById("nickname").value.trim());
btnPickFile.onclick = () => pickFile();
btnPickDir.onclick = () => pickDir();

welcomeMessage();

function addLog(str) {
  console.log(str);
  let div = create("div");
  div.innerHTML = str;
  logBox.appendChild(div);
  div.scrollIntoView();
}

async function defaultInvoke(eventName, ...params) {
  let args = await ipcInvoke(eventName, ...params);
  if (!args) return;
  if (typeof args == "string") addLog(args);
  else if (typeof args[0] == "string") addLog(args[0]);
  return args;
}

function pickFile() {
  defaultInvoke("dialog:pickFile").then(
    args => (pickedFile.innerText = args[1])
  );
}
function pickDir() {
  defaultInvoke("dialog:pickDir").then(args => (pickedDir.innerText = args[1]));
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
    }, (+i + 1) * 1750);
}
