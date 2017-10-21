const http = require('http');

var WebClient = require('@slack/client').WebClient;

var token = process.env.SLACK_API_TOKEN || '';

var web = new WebClient(token);

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;

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
