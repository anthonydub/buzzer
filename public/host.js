const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const allPlayers = document.querySelector('.js-all-players')
const lock = document.querySelector('.js-lock')
const unlock = document.querySelector('.js-unlock')
const btnMode = document.querySelector('.js-mode')
const modeText= document.querySelector('.js-mode-text')
const countDown= document.querySelector('#loading-bar')
const progressBar= document.querySelector('#progress')
const pointsFinale= document.querySelector('.js-pointsFinale')
const btnPause= document.querySelector('.js-pause')
const btnReset= document.querySelector('.js-reset')
const passageText= document.querySelector('.js-passage-text')

const blue = "rgb(16, 21, 78)"
const yellow = "rgb(242, 182, 16)"
const hostName = "Samuel Etienne"
class Countdown{
  pauseTimer = false
  progress = 100.0
  queue = []

  Countdown()
  {  
  }

  stopCountdown()
  {
    this.pauseTimer = true
    countDown.style.backgroundColor = "black"
    progressBar.style.backgroundColor = "gray"
    socket.emit('lock', this.queue.shift().name)
  }

  resetCountdown()
  {
    this.stopCountdown()
    if (btnPause.innerHTML == "Pause timer")
    {
      btnPause.innerHTML = "Démarrer timer"
    }
    this.progress = 100.0
    progress.style.height = this.progress + "%";
    pointsFinale.innerText = 4
    countDown.style.backgroundColor = blue
    progressBar.style.backgroundColor = yellow
    finalists = data.users.filter(u => u.finalist);
    queue = [finalists[0], finalists[1], finalists[0], finalists[1]]
  }

  resumeCountdown(){
    countDown.style.backgroundColor = blue
    progressBar.style.backgroundColor = yellow
    this.pauseTimer = false
    const prevPointsFinale = pointsFinale.innerText
    let interval = setInterval(() => {
      if (prevPointsFinale != pointsFinale.innerText)
      {
        socket.emit('switchHand', this.queue[0].name)
        queue.shift()
        if (this.progress > 75 && this.progress <= 100) {
          pointsFinale.innerText = 4
        }
        else if (this.progress <= 75 && this.progress > 50) {
          pointsFinale.innerText = 3
        }
        else if (this.progress <= 50 && this.progress > 25) {
          pointsFinale.innerText = 2
        }
        else {
          pointsFinale.innerText = 1
        }
      }
      
      this.progress = this.progress - 0.5
      progress.style.height = this.progress + "%";
      if(this.progress <= 0 || this.pauseTimer)
      {
        //TODO: Send every player the info on who talks
        if(this.progress <= 0) pointsFinale.innerText = 0
        clearInterval(interval)
      }
    }, 50)
  }
}

let data = {
  users: {},
  buzzes: new Set(),
  connections: {},
  CTDWN : new Countdown(),
}

function mode9PtsGagnants()
{
  modeText.innerHTML = "9 points gagnants !"
  passageText.innerHTML = "Passage en mode face à face"
  countDown.classList.add('hidden')
  btnMode.innerHTML = "Mode face à face"
  btnPause.classList.add('hidden')
  btnReset.classList.add('hidden')
  lock.classList.remove('hidden')
  unlock.classList.remove('hidden')
  data.CTDWN.stopCountdown()
}

function modeFaceAFace()
{
  modeText.innerHTML = "Face à face !"
  passageText.innerHTML = "Passage en mode 9 points gagnants"
  countDown.classList.remove('hidden')
  btnMode.innerHTML = "Mode 9 points gagnants"
  btnPause.classList.remove('hidden')
  btnReset.classList.remove('hidden')
  lock.classList.add('hidden')
  unlock.classList.add('hidden')
  finalePlayerList = []
}

function updatePlayerList()
{
  let array = []
  for (let key in data.users) {
    array.push(data.users[key])
  }
  allPlayers.innerHTML = array
    .map(u => {
      const color = u.finalist ? "green" : "red";
      console.log(data.users)
      return `<button style="background-color:${color}">${u.name}</button>`
    })
}

// Player connection
socket.on('active', (user) => {
  data.connections[user.id] = socket
  data.users[user.id] = user
  updatePlayerList()
})

// Player disconnect
socket.on('inactive', (user) => {
  if (user != undefined)
  {
    delete data.connections[user.id]
    delete data.users[user.id]
    updatePlayerList()
  }
})

function updateWhoBuzzed(buzzes){
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0] }
    })
    .map(user => `<h1>${user.name}</h1>`)
    .join('')
}

// When a player buzzes, inform the host
socket.on('buzzes', (buzzes) => {
  updateWhoBuzzed(buzzes)
  if (btnMode.innerHTML == "Mode face à face"){
    if (buzzes.length > 0)
    {
      socket.emit('lock', buzzes[0])
    }
  } else {
    data.CTDWN.stopCountdown()
  }
})

// Switch mode
btnMode.addEventListener('click', () => {
  if (btnMode.innerHTML == "Mode face à face")
  {
    console.log("Mode face à face")
    modeFaceAFace()
    socket.emit('mode', "finale")  
  }
  else if (btnMode.innerHTML == "Mode 9 points gagnants"){
    console.log("Mode 9 points gagnants")
    mode9PtsGagnants()
    socket.emit('mode', "debut")
  }
})

// Toggle finalist
allPlayers.addEventListener('click', () => {
  Object.entries(data.users).filter(([key, value]) => {
    if (value.name == event.target.innerText) {
      console.log("Toggle finalist", key)
      console.log(data.users)
      data.users[key].finalist = !data.users[key].finalist
      socket.emit('toggleFinalist', key)
      updatePlayerList()
    }
  })
})

// Pause timer
btnPause.addEventListener('click', () => {
  if (btnPause.innerHTML == "Pause timer")
  {
    console.log("Pause timer")
    data.CTDWN.stopCountdown()
    btnPause.innerHTML = "Démarrer timer"
    socket.emit('pause')
  }
  else if (btnPause.innerHTML == "Démarrer timer")
  {
    console.log("Démarrer timer")
    data.CTDWN.resumeCountdown()
    btnPause.innerHTML = "Pause timer"
    socket.emit('resume')
  }
})

// Reset timer
btnReset.addEventListener('click', () => {
  console.log("Reset timer")
  data.CTDWN.resetCountdown()
  socket.emit('reset')
})

// Lock buzzers
lock.addEventListener('click', () => {
  console.log("Admin lock")
  buzzList.innerHTML = `<h1>${hostName}</h1>`
  socket.emit('lock', hostName)
})

// Unlock buzzers
unlock.addEventListener('click', () => {
  console.log("Admin unlock")
  buzzList.innerHTML = ""
  socket.emit('unlock', true)
})