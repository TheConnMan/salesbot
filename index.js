const http = require('http');

var WebClient = require('@slack/client').WebClient;

var token = process.env.SLACK_API_TOKEN || '';

var web = new WebClient(token);

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

// Initialize an Express application
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const REACTION = process.env.EMOJI_REACTION;
const CHANNEL = process.env.CHANNEL;
const TEAM = process.env.TEAM_LIST.split(',');

let index = 0;

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

// Mount the event handler on a route
// NOTE: you must mount to a path that matches the Request URL that was configured earlier
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('reaction_added', (event)=> {
  if (ifReactionApplicable(event.reaction, event.item.channel)) {
    let teamMember = getNextTeamMember();
    let message = `@${teamMember} YOU'RE UP!`;
    sendThreadedMessage(message, event.item.channel, event.item.ts);
  }
});
slackEvents.on('reaction_removed', (event)=> {
  if (ifReactionApplicable(event.reaction, event.item.channel)) {
    let teamMember = getCurrentTeamMember();
    index -= 1;
    let message = `@${teamMember} YOU GET A SECOND LIFE`;
    sendThreadedMessage(message, event.item.channel, event.item.ts);
  }
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

app.post('/set/:username', function (req, res) {
  var memberIndex = TEAM.indexOf(req.params.username);
  if (memberIndex == -1) {
    res.sendStatus(404);
  } else {
    index = memberIndex;
    res.sendStatus(200);
  }
});

app.get('/get', function (req, res) {
  res.send(getCurrentTeamMember());
});

// Handling slah commands in Slack
app.get('/slack', function (req, res) {
  res.sendStatus(200)
})

app.post(bodyParser.urlencoded({extended:true}), function(req, res) {
  if (req.body.token !== VERIFY_TOKEN) {
    return res.sendStatus(401)
  }

  if (req.body.text === 'whosnext') {
      res.json({
        text: TEAM[(index + 1) % TEAM.length]
      });
  } else {
    res.json({
      text: 'I need valid instructions like "whosnext"'
    });
  }
})

// Start the express application
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});

function ifReactionApplicable(reaction, channel) {
  return REACTION == reaction && CHANNEL == channel;
}
function getNextTeamMember() {
  index += 1;
  return getCurrentTeamMember();
}
function getPreviousTeamMember() {
  index -= 1;
  return getCurrentTeamMember();
}
function getCurrentTeamMember() {
  return TEAM[index % TEAM.length];
}
function listCurrentTeamMember() {
  return TEAM[(index + 1) % TEAM.length];
}
function sendThreadedMessage(message, channel, ts) {
  web.chat.postMessage(channel, message, {
    thread_ts: ts,
    parse: 'full'
  }, function(err, res) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Message sent!');
    }
  });
}
