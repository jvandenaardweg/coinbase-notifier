require('dotenv').config()
const fetch = require('node-fetch')
var FormData = require('form-data')

class Twitter {
  constructor() {
    this.data = null
    this.accessToken = null
  }

  async auth () {
    const AuthorizationHeader = 'Basic ' + Buffer.from(`${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`).toString('base64')
    const body = 'grant_type=client_credentials'

    try {
      const accessToken = await fetch('https://api.twitter.com/oauth2/token', {
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': AuthorizationHeader
        },
      })
      .then(res => res.json())
      .then(json => json.access_token)

      this.accessToken = accessToken
    } catch (err) {
      throw err
    }
  }

  async getData () {
    try {
      await this.auth()

      // Important: Endpoint is rate limited 1500 (app auth) calls every 15 minutes. So that 1,666666 calls per second.
      // So we'll poll the Tweets every second
      const limit = 100
      const tweets = await fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=coinbase&count=${limit}&exclude_replies=true&include_rts=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
         }
        })
        .then(res => res.json())

      this.data = tweets
      return this.data
    } catch (err) {
      console.log(err)
      throw 'Failed to get tweets from Twitter'
    }

  }
}

module.exports = Twitter

