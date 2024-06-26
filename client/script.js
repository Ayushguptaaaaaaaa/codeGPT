import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval
// This Fucntion is for the dots before answering query, for 300 milisecs, thena gain dots shows up, 4 dots at a time
function loader(element) {
  element.textContent=''

  loadInterval = setInterval(() => {
  element.textContent += '.'

  if(element.textContent === '....') {
     element.textContent = '';
   }
  }, 300);
}

// This function is for Tying text letter by letter
function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval);
      }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}
// This is for ChatStripe- To distinguish Between Usertexts and AI texts;
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user}
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

// Trigger to Generate the AI generated Response:-
const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  // This function is for adding Server and Client
  const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = ''

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim(); // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"

        alert(err)
    }
}


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
      handleSubmit(e)
  }
})
