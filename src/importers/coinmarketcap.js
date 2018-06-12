const fetch = require('node-fetch')

class Coinmarketcap {
  constructor() {
    this.data = null
  }

  async getData () {
    try {
      // const currencies = await fetch('https://api.coinmarketcap.com/v2/listings/')
      // Get the top coins from Coinmarketcap
      // We use the top coins, and not all coins, so we minimize the risk of false positives
      // Since we are comparing strings/text, we need to make sure we don't match the word/letter "J" to "Joincoin" for example
      const currencies = await fetch('https://api.coinmarketcap.com/v2/ticker/?structure=array&limit=100')
      .then(res => res.json())
      .then(json => json.data)

      this.data = currencies

      return this.data
    } catch (err) {
      console.log(err)
      throw 'Failed to get currencies from Coinmarketcap.com'
    }

  }
}

module.exports = Coinmarketcap
