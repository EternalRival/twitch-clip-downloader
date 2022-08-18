const create = tag => document.createElement(tag);
const getById = id => document.getElementById(id);

let logBox = getById("log");

let btn = getById("btnPickDir");
btn.onclick = dirPicker;

function addLog(str) {
  console.log(str);
  let div = create("div");
  div.innerHTML = str;
  logBox.appendChild(div);
}
async function dirPicker() {
  addLog(await window.myAPI.pickDir());
}
