/* const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // prints out 'pong'
};

func();
 */
/* setInterval(() => {
  let lorem = document.createElement("div");
  lorem.innerHTML =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae nostrum at facilis autem reiciendis, recusandae itaque alias minus consectetur maxime, et omnis excepturi earum sed odio. Consectetur pariatur accusantium ut.";
  log.appendChild(lorem);
  log.scrollTop = log.scrollHeight;
}, 500);
 */
const create = tag => document.createElement(tag);
const getById = id => document.getElementById(id);

let logBox = getById("log");

let btn = getById("btnPickDownloadFolder");
btn.onclick = () =>  dirPicker1;

function addLog(str) {
  let div = create("div");
  div.innerHTML = str;
  logBox.appendChild(div);
}
async function dirPicker1() {
  addLog(await window.myAPI.pickDir());
}
