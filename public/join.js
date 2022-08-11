const socket = io()
const body = document.querySelector('.js-body')
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')
const buzzer = document.querySelector('.js-buzzer')
const whoBuzzed = document.querySelector('.js-whoBuzzed')
const joinedInfo = document.querySelector('.js-joined-info')
const editInfo = document.querySelector('.js-edit')

let user = {}

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.name) {
    form.querySelector('[name=name]').value = user.name
  }
}
const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.name = form.querySelector('[name=name]').value
  user.finalist = false
  if (!user.id) {
    user.id = Math.floor(Math.random() * new Date())
  }
  socket.emit('join', user)
  saveUserInfo()
  joinedInfo.innerText = `${user.name}`
  form.classList.add('hidden')
  joined.classList.remove('hidden')
  body.classList.add('buzzer-mode')
})

buzzer.addEventListener('click', (e) => {
  socket.emit('buzz', user)
})

socket.on('lock', (userName) => {
  console.log(`Lock buzzers :`, userName)
  if(userName == user.name)
  {
    buzzer.classList.add('isBuzzed')
    buzzer.innerText = `Vous avez la main, Dites votre réponse !`
  }
  else{
    buzzer.classList.add('isNotBuzzed')
    buzzer.innerText = `${userName} a la main, FERMEZ-LA !`
  }
})

socket.on('unlock', () => {
  unlockBuzzer();
})


function lockBuzzer() {
  buzzer.disabled = true
  buzzer.classList.add('disabled')
}

function unlockBuzzer(){
  console.log(`Unlock buzzers`)
  buzzer.innerText = `Buzzer`
  buzzer.classList.remove('isBuzzed')
  buzzer.classList.remove('isNotBuzzed')
  buzzer.disabled = false
  buzzer.classList.remove('disabled')
}

socket.on('mode', (mode, finalist) => {
  if (mode == 'finale') {
    if (finalist) {
      buzzer.innerText = `Vous êtes finaliste !`
    }
    else {
      buzzer.innerText = `Vous n'êtes pas finaliste :(`
      lockBuzzer();
    }
  }
  else {
    unlockBuzzer();
  }
})

// editInfo.addEventListener('click', () => {
//   joined.classList.add('hidden')
//   form.classList.remove('hidden')
//   body.classList.remove('buzzer-mode')
// })

getUserInfo()
