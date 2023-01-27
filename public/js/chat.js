const socketed = io();
// Elements 

const $messageForm = document.querySelector('#messgae-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector("#send-loctaion")
const $messages = document.querySelector('#message')

// Templates
  
const $messageTemplates = document.querySelector('#message-template').innerHTML
const $locationMessageTemplates = document.querySelector('#locationMessage-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
// New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage )
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  console.log(newMessageMargin)

  //Visible Height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled
  const scrollOffSet = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffSet){
    $messages.scrollTop = $messages.scrollHeight

  }
}

socketed.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render($messageTemplates, {
    username: message.username,
    message: message.text,
    createAt: moment(message.createAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
});

socketed.on('locationMessage', (message) =>{
  //console.log(url)
  const html = Mustache.render($locationMessageTemplates, {
   username: message.username,
   url: message.url,
   createAt: moment(message.createUrlAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socketed.on('roomData', ({ room, users }) =>{
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = document.querySelector("input").value;

  socketed.emit("sendMessage", message, (error) =>{

    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value =''
    $messageFormInput.focus()

    if(error){
        return console.log(error)
    }
    console.log("The message delivered!")
  });
});

$sendLocation.addEventListener("click", (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Geolocations is not supported by ur browser");
  }

$sendLocation.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socketed.emit('sendLocation', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    }, () =>{
        $sendLocation.removeAttribute('disabled')
        console.log('Location shared')

    })
  });
});

socketed.emit('join', { username,room }, (error) =>{
  if(error){
    alert(error)
    location.href = '/'
  }
})