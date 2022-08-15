const SCROLLDELAY = 1000;
const SELECTOR = ".fLixHT";

const container = document.querySelector(SELECTOR);
const trigger = document.querySelector(".scrollable-trigger__wrapper");

function startScrolling(attempt = 3, last = null) {
  const interval = setInterval(() => {
    if (last != container.childElementCount) {
      trigger.scrollIntoView();
      last = container.childElementCount;
      console.log("> найдено клипов", last - 1);
      return;
    }
    clearInterval(interval);
    if (!attempt) return requestClipList();
    console.log(`> пытаемся найти еще (${attempt--})`);
    setTimeout(() => startScrolling(attempt), 3000);
  }, SCROLLDELAY);
}

function requestClipList() {
  console.log("> собираем данные клипов…");
  const clipsData = [...container.childNodes].slice(0, -1).map(node => {
    const data = [...node.querySelectorAll("h5,a")].map(e => e.title || e.href);
    return { title: data[0], game: data[2], streamer: data[1], URL: data[3] };
  });
  console.log("> список сформирован");
  
  const json = JSON.stringify(clipsData, null, "\t");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = "twitch_clips_data.json";
  a.click();
  console.log("> список отправлен в папку загрузок!");
}

startScrolling();
