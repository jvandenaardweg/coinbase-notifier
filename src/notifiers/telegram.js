const fetch = require('node-fetch')

class Telegram {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN
    this.channel = process.env.TELEGRAM_CHANNEL
  }

  async sendMessage (message) {
    let response
    if (!message) return new Error('Please give a message.')
    try {
      // For dev purposes we just assume the message has been send, for now
      if (process.env.NODE_ENV === 'production') {
        response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage?chat_id=${this.channel}&text=${message}`)
      } else {
        console.log('DEV MODE: Telegram message should be send. If you see this message in production then the NODE_ENV is not "production".')
        response = true
      }
      return response
    } catch (err) {
      throw err
    }
  }
}

module.exports = Telegram
