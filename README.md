## Setup (If you want to run it)

To run this website, you'll need to create a `config.js` file in the root directory. This file is not included in the repository because it contains private API keys.

### Creating config.js

1. Create a new file called `config.js`
2. Add the following code:

```javascript
const config = {
    LASTFM_API_KEY: 'YOUR_LASTFM_API_KEY',
    SPOTIFY_USER_ID: 'YOUR_SPOTIFY_USER_ID',
    SPOTIFY_POLL_INTERVAL: 30000 // 30 seconds, you can change this to whatever you want
};
```

3. Replace `YOUR_LASTFM_API_KEY_HERE` with your Last.fm API key
4. Replace `YOUR_LASTFM_USERNAME` with your Last.fm username
