function getRandomArray() {
  const r1 = shuffleArray(Array.from(Array(8).keys()).map((r) => r + 1));
  const r2 = shuffleArray(r1);
  return r1.concat(r2);
}

const randomNumber = getRandomArray();

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const board = document.getElementById("board");
let tr = "";
let k = 0;
for (let i = 0; i < 4; i++) {
  tr += `<tr>`;
  for (let j = 0; j < 4; j++) {
    tr += `<td  class="blank" pos=${k}>  </td>`;
    k++;
  }
  tr += `</tr>`;
}

board.innerHTML = tr;
let result = [];
let previousPosValue = -1;
let previousPos = -1;
let previousElement = null;
let setTimeoutId = null;
board.addEventListener("click", (event) => {
  let currentElement = event.target?.closest("td");
  if (!currentElement) return;
  const pos = currentElement?.getAttribute("pos");
  const currentPosValue = randomNumber[pos];
  currentElement.innerHTML = currentPosValue;
  currentElement?.classList.add("visible");

  if (
    previousPosValue != -1 &&
    currentPosValue == previousPosValue &&
    pos != previousPos
  ) {
    currentElement.classList.add("visible");
    previousElement.classList.add("visible");
    currentElement.innerHTML = previousPosValue;
    previousElement.innerHTML = previousPosValue;
    previousElement.isFound = true;
    currentElement.isFound = true;
    if (setTimeoutId) {
      clearTimeout(setTimeoutId);
    }
    return;
  }

  setTimeoutId = setTimeout(() => {
    currentElement.innerHTML = "";
    currentElement.classList.remove("visible");
  }, 1000);

  previousPos = pos;
  previousPosValue = currentPosValue;
  previousElement = currentElement;
});
