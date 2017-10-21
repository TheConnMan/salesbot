const http = require('http');

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

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json());

// Mount the event handler on a route
// NOTE: you must mount to a path that matches the Request URL that was configured earlier
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('reaction_added', (event)=> {
  if (ifReactionApplicable(event.reaction, event.item.channel)) {
    console.log(`Received an added reaction event: user ${event.user} in channel ${event.item.channel} reaction: ${event.reaction}`);
  }
});
slackEvents.on('reaction_removed', (event)=> {
  if (ifReactionApplicable(event.reaction, event.item.channel)) {
    console.log(`Received a removed reaction event: user ${event.user} in channel ${event.item.channel} reaction: ${event.reaction}`);
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
