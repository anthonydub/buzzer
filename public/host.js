const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const lock = document.querySelector('.js-lock')
const unlock = document.querySelector('.js-unlock')

let data = {
  users: {},
  buzzes: new Set(),
  connections: {},
}

const getData = () => ({
  users: data.users,
  buzzes: [...data.buzzes].map(b => {
    const [ name ] = b.split('-')
    return { name }
  }),
  connections: data.connections,
})

function updatePlayerList()
{
  let userList = []
  Object.keys(data.users).forEach(key => {
    userList.push(data.users[key].name)
    })
  if (userList.length > 1)
  {
    active.innerText = `${userList} jouent à QPUP !`
  }
  else if(userList.length == 1)
  {
    active.innerText = `${userList} joue à QPUP !`
  }
  else
  {
    active.innerText = `Personne ne joue à QPUP`
  }
}

socket.on('active', (user) => {
  data.connections[user.id] = socket
  data.users[user.id] = user
  updatePlayerList()
})

socket.on('inactive', (user) => {
  if (user != undefined)
  {
    delete data.connections[user.id]
    delete data.users[user.id]
    updatePlayerList()
  }
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0] }
    })
    .map(user => `<h1>${user.name}</h1>`)
    .join('')
  if (buzzes.length > 0)
  {
    socket.emit('lock', buzzes[0])
  }
})

lock.addEventListener('click', () => {
  console.log("Admin lock")
  socket.emit('lock', "Samuel Etienne")
})

unlock.addEventListener('click', () => {
  console.log("Admin unlock")
  socket.emit('unlock', true)
})