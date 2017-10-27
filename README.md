# Salesbot

Notifications for inbound lead rotation

## Running

Clone and run with the following commands:

```bash
git clone https://github.com/TheConnMan/salesbot.git
cd salesbot
npm install
<environment-variables> node index.js
```

## Configuration

Follow the steps in https://github.com/slackapi/node-slack-events-api#configuration to set up the **SLACK_VERIFICATION_TOKEN** and request the following events subscriptions from the Slack Events API:
- `reaction_added`
- `reaction_removed`

In your Slack application configuration, go to **Add features and functionality** and add a bot user. Then go to **OAuth & Permissions** and add the following scopes:
- `chat:write:bot`

In your Slack application configuration, go to **Add features and functionality** and add a slash command integration.

## Environment Variables

- SLACK_VERIFICATION_TOKEN - Token used for the Slack API
- CHANNEL - Slack channel ID to be posted to
- EMOJI_REACTION - Name of emoji in Slack that will result in salesbot taking action
- TEAM_LIST - Comma delimited list of Slack usernames
- SLACK_API_TOKEN - Token used for the Slack Web API
