const div = document.getElementById("ergebnis");
div.innerHTML = "Hallo"


const ul = document.getElementById('ul');
for (let i = 0; i < 50; i++){
  ul.innerHTML += `<li>Satz +${i+1}</li>`
}

let tr = ""
const board1 = document.getElementById("board1");
for (let i = 0; i < 8; i++){

  tr += `<tr>`
  for (let j = 0; j < 8; j++){

     tr += `<td >  </td>`
  }
  tr +=`</tr>`
}
board1.innerHTML = tr
 tr = ""
const board = document.getElementById("board");
for (let i = 0; i < 8; i++){

  tr += `<tr>`
  for (let j = 0; j < 8; j++){
   i%2!=0 ?
     tr += `<td ${j % 2 == 0 ? "class='black'" : ""}>  </td>`
     :
     tr += `<td ${j % 2 == 0 ? "" : "class='black'"}>  </td>`
  }
  tr +=`</tr>`
}

board.innerHTML = tr