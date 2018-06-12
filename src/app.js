

const TwitterImporter = require('./importers/twitter')
const CoinmarketcapImporter = require('./importers/coinmarketcap')
const TelegramNotifier = require('./notifiers/telegram')
const redis = require('./database/redis')
const interval = require('interval-promise')

const alreadyAnnouncedCurrencies = [
  {
    symbol: 'BTC',
    name: 'Bitcoin'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin'
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum'
  }
]

function hasUnannouncedCurrencies (text, currencies) {
  // Detects if a string contains currencies that are not yet announced

  const matchingCurrency = currencies.reduce((prev, currency) => {

    const matchesCurrencyName = text.includes(currency.name)
    const matchesCurrencySymbol = text.includes(currency.symbol)

    // If we found some currencies in the text...
    if(matchesCurrencyName || matchesCurrencySymbol) {
      // We can now check if the found currency does not exist yet in the alreadyAnnouncedCurrencies array
      const hasNewSymbol = alreadyAnnouncedCurrencies.every(announcedCurrency => announcedCurrency.symbol !== currency.symbol)
      if (hasNewSymbol) {
        prev.push(currency)
      }
    }

    return prev
  }, [])
  return matchingCurrency

}

async function getData() {
  try {
    const twitterImporter = new TwitterImporter()
    const coinmarketcapImporter = new CoinmarketcapImporter()

    const tweets = await twitterImporter.getData()
    console.log(`Coinbase Notifier: Got ${tweets.length} Tweets from Coinbase Twitter account.`)

    const currencies = await coinmarketcapImporter.getData()
    console.log(`Coinbase Notifier: Got ${currencies.length} currencies from Coinmarketcap.`)

    const storedTweetIds = await getStoredTweetIds()
    console.log(`Coinbase Notifier: Already got ${Object.keys(storedTweetIds).length} tweets in our database. Try to determine if we got new ones...`)

    const newTweets = tweets.filter(tweet => {
      return !Object.keys(storedTweetIds).includes(tweet.id.toString()) // toString because Redis returns tweet Id's as strings
    })

    if (!newTweets.length) {
      console.log('Coinbase Notifier: No new Tweets found. We stop. Bye!')
    } else {
      console.log(`Coinbase Notifier: Found ${newTweets.length} tweets to analyze! Analyzing...`)

      const matchingTweets = getMatchingTweets(newTweets, currencies)
      console.log(matchingTweets.length)
      if (matchingTweets.length) {
        console.log(`Coinbase Notifier: Found a matching Tweet after analyzing!`)

        matchingTweets.forEach(match => {

          // Make a list of matching currencies, like: BTC, ETH etc...
          const currenciesList = match.currencies.map(currency => {
            return currency.symbol
          }).join(', ')

          const message = `Possible new Coinbase listing for ${currenciesList}?\n https://twitter.com/coinbase/status/${match.tweet.id} \n\n "${match.tweet.text}"`

          broadcastMessageToSubscribers(message)
        })

      } else {
        console.log('Coinbase Notifier: No matching Tweet found after analyzing.')
      }

    }

    newTweets.forEach(tweet => {
      store(tweet.id)
    })

  } catch (err) {
    console.log(err)
  }

}

function getMatchingTweets (tweets, currencies) {
  const matchingTweets = tweets.reduce((prev, tweet) => {
    const matchedCurrencies = hasUnannouncedCurrencies(tweet.text, currencies)

    if (matchedCurrencies.length) {
      const newData = {
        tweet: tweet,
        currencies: matchedCurrencies
      }
      prev.push(newData)
    }

    return prev
  }, [])
  return matchingTweets
}

function store (tweetId) {
  console.log(`Coinbase Notifier: Storing Tweet ID ${tweetId} in the database.`)
  redis.hset(`tweets`, `${tweetId}`, true)
}

function getStoredTweetIds () {
  return redis.hgetall('tweets')
}

function broadcastMessageToSubscribers (message) {
  const telegramNotifier = new TelegramNotifier()
  telegramNotifier.sendMessage(message)
  console.log(message)
}

// if (process.env.NODE_ENV === 'production') {
  interval(async () => {
    await getData()
  }, 5000, {stopOnError: false})
// } else {
  // getData()
// }


