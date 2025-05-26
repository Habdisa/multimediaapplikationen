function createWall(index) {
  const div = document.createElement('div');
  div.contentEditable = true;
  div.classList.add('wall');

  getData(index,div,'loading ...')
  return div;
}


function isLocal() {
  const prom = fetch('http://localhost:8888').then(r => {
    return true;
  }).catch(() => {
    return false;
  });
return  Promise.resolve(prom).then(value => value)
}


function getData(index, div,text) {
  let url = `http://localhost:8888/hash/${index}`
  // let url = `/habdisa69407/hash/${index}`
  if (!isLocal()) {
    url= `/habdisa69407/hash/${index}`;
    
  }

  fetch(url).then(r => r.json()).then(r => {
    console.log(r);
    if (r) {
      div.textContent = r.text;
    } else { 
      div.textContent = text;
    }
  })
}

function createWalls(n) {
  return Array.from(Array(n).keys()).map((r,index) => createWall(index)).map((div,i) => {
    div.addEventListener('blur', () => {
  let url = `http://localhost:8888/hash/${index}`
  // let url = `/habdisa69407/hash/${index}`
      fetch(url,
        {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify ({ text: div.innerText })
        }
      ).then(r => r.json())
      // getData(i,div)
    });

    return div;
})

}

createWalls(16).map(r => {

  document.body.appendChild(r);
})