const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);
const title = 'Buffer Buzzer'

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


app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

let adminLock = false

function resolve3Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 3000);
  });
}

function unlockAll(){
  Object.keys(data.connections).forEach(s => {
    data.connections[s].emit('unlock')
  });
  data.buzzes = new Set()
  io.emit('buzzes', [...data.buzzes])
}

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    data.users[user.id] = user
    data.connections[user.id] = socket
    io.emit('active', user)
    console.log(`${user.name} joined!`)
  })

  socket.on('disconnect', () => {
    let userid = ""
    Object.keys(data.connections).forEach(uid => {
      if(data.connections[uid] == socket)
        userid = uid
    });
    io.emit('inactive', data.users[userid])
    delete data.users[userid]
    delete data.connections[userid]
  })

  socket.on('buzz', (user) => {
    data.buzzes.add(`${user.name}`)
    io.emit('buzzes', [...data.buzzes])
    console.log(`${user.name} buzzed in!`)
  })

  socket.on('lock', async (userName)  => {
    Object.keys(data.connections).forEach(s => {
      data.connections[s].emit('lock', userName)
    });
    if (userName != "Samuel Etienne")
    {
      await resolve3Seconds()
      if(!adminLock)
      {
        unlockAll()
      }
    }
    else {
      adminLock = true
      Object.keys(data.connections).forEach(s => {
        data.connections[s].emit('lock', userName)
      });
    }
  })

  socket.on('unlock', (admin) => {
    if(admin)
    { 
      adminLock = false
    }
    unlockAll()
  })
})

server.listen(8090, () => console.log('Listening on 8090'))
