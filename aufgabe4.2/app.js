function getRandomArray() {
  const r1 = shuffleArray(Array.from(Array(8).keys()).map((r) => r + 1));
  const r2 = shuffleArray(r1);
  return r1.concat(r2);
}

const n1 = getRandomArray();

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
    i % 2 != 0
      ? (tr += `<td ${j % 2 == 0 ? "class='black'" : ""}> ${n1[k++]}  </td>`)
      : (tr += `<td ${j % 2 == 0 ? "" : "class='black'"}> ${n1[k++]} </td>`);
  }
  tr += `</tr>`;
}
board.innerHTML = tr;
