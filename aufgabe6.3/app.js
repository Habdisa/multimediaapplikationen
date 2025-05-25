const mainUrl = "http://localhost:8888/hash"
const field = document.getElementById("content");
const sendBTN = document.getElementById('send');
const editBtn = document.getElementById('edit');
function getHash(game, field) {
  const url = `${mainUrl}/${game}/game_1`;

  fetch(url).then(r => r.json()).then(log).then(r =>{
    field.innerHtml = r}
  )
}


function editHash(game,name, element, method ='POST') {
  const url = `${mainUrl}/${game}/game_1`;
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
       name
    })
  }).then(r => r.json()).then(r => {
    element.innerText = r.name;
    const contentString = document.getElementById('content-string');
    contentString.innerHTML = JSON.stringify(r);
  }
  )
}

sendBTN.addEventListener('click', (e) => {
  e.preventDefault();
  const input = document.getElementById('input');
  const value = input.value;
  const content = document.getElementById('content');
  editHash('tictactoe',value,content)
});

editBtn.addEventListener('click', e => {
  e.preventDefault();
    const input = document.getElementById('input');
  const value = input.value;
  const content = document.getElementById('content');
  editHash('tictactoe',value,content, 'PUT')
})

getHash('tictactoe', field);