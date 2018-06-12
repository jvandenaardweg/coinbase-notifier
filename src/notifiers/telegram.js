const fetch = require('node-fetch')

class Telegram {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN
    this.channel = process.env.TELEGRAM_CHANNEL
  }

  async sendMessage (message) {
    if (!message) return new Error('Please give a message.')
    try {
      const response = fetch(`https://api.telegram.org/bot${this.token}/sendMessage?chat_id=${this.channel}&text=${message}`)
      return response
    } catch (err) { 
      throw err
    }
  }
}


module.exports = Telegram
