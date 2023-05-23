// description: "All Systems Operational", "Partial System Outage", "Major Service Outage"
// indicator: none, minor, major, or critical

const messages = {
  none: "Keis Problem. Liit wahrschinlech glich a öppis anderem",
  minor: "es chliises Problem",
  major: "es grösssers Problem",
  ciritical: "Ich glaube da sind grad es paar am schwitze",
};

async function init() {
  initPlayer();
  renderAudioVisual();
  messageConductor();
}

const map = (value, start1, stop1, start2, stop2) =>
  ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

async function renderAudioVisual() {
  const { createNoise2D } = await import("https://esm.sh/simplex-noise@4.0.1/");

  const noise2D = createNoise2D();

  const visualEl = document.querySelector("[data-audio-visual]");
  const NUM_OF_LINES = 10;
  const lineStep = visualEl.viewBox.baseVal.width / 10;

  new Array(NUM_OF_LINES).fill(null).forEach((item, index) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    const yLineRange = visualEl.viewBox.baseVal.height / 2;
    const y = Math.abs(noise2D(0, index / 10) * yLineRange);

    line.setAttribute("x1", lineStep * index);
    line.setAttribute("y1", yLineRange - y);
    line.setAttribute("x2", lineStep * index);
    line.setAttribute("y2", yLineRange + y);
    line.setAttribute("stroke-width", lineStep / 2);

    visualEl.append(line);
  });
}

function initPlayer() {
  const audio = document.querySelector("[data-player] audio");
  const button = document.querySelector("[data-player] button");

  button.addEventListener("click", (e) => {
    e.preventDefault();
    audio.play();
  });
}

async function fetchGitHubStatus() {
  const response = await fetch(
    "https://www.githubstatus.com/api/v2/status.json"
  );
  const data = await response.json();
  const { status } = data;

  return status.indicator;
}

async function messageConductor() {
  const messages = Array.from(
    document.querySelectorAll("[data-message]")
  ).reduce((acc, el) => {
    const type = el.dataset.message;
    acc[type] = el;
    return acc;
  }, {});

  messages.initial.hidden = false;
  await waitFor(1000);

  messages.typing.hidden = false;
  await waitFor(2000);

  messages.typing.hidden = true;
  messages["initial-response"].hidden = false;
  await waitFor(500);

  messages.typing.hidden = false;
  await waitFor(400);

  try {
    const indicator = await fetchGitHubStatus();
    messages.typing.hidden = true;
    messages[`indicator-${indicator}`].hidden = false;
  } catch (err) {
    messages.typing.hidden = true;
    messages.error.hidden = false;
    console.error(err);
  }

  await waitFor(2000);
  messages.audio.hidden = false;
}

async function waitFor(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

init();
