<p align="center">
  <img width="400px" src="https://github.com/bufferapp/buzzer/blob/master/public/buzzer-logo.svg?raw=true&sanitize=true" alt="Buzzer"/>
</p>

A little buzzer app for running your own quizzes or game shows! Uses websockets to sent messages.

## Running the app

You'll need [Node.js](https://nodejs.org) to run this
application.


The game master starts the server with `npm run start`.
Another cmd must be used to expose the app online with ngrok.

```
npm install
npm run start
```

Open another cmd at the root of the project to use to expose the app online :
```
ngrok http 8090
``` 

Share the forwarding address displayed to your friends.

## How to use - Online use
The players go to the homepage (`http://${ngrokID}.ngrok.io/`) and they can enter their name and team
number. Joining will give them a giant buzzer button!

The host heads over to `/host` and will be able to see everyone that buzzes in and clear the list
in between questions.

## License

MIT
