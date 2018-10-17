

const TwitterImporter = require('./importers/twitter')
const CoinmarketcapImporter = require('./importers/coinmarketcap')
const TelegramNotifier = require('./notifiers/telegram')
const redis = require('./database/redis')
const interval = require('interval-promise')

async function getAlreadyListedCurrencies () {
  console.log('Coinbase Notifier: Getting already listed currencies from cache...')
  try {
    const listings = await redis.hgetall('listings')
    const symbols = (listings) ? Object.keys(listings) : null
    const currencies = symbols.map(symbol => {
      const listing = JSON.parse(listings[symbol])
      return {
        symbol: listing.symbol,
        name: listing.name
      }
    })
    console.log(`Coinbase Notifier: Got ${symbols.length} currencies from cache.`)
    return currencies
  } catch (err) {
    console.log('ERROR getting the listings from cache')
    throw err
  }
}

// Method to store some initial data, when starting the project with an empty cache
// function initData () {
//   const alreadyListedCurrencies = [
//     {
//       symbol: 'BTC',
//       name: 'Bitcoin'
//     },
//     {
//       symbol: 'LTC',
//       name: 'Litecoin'
//     },
//     {
//       symbol: 'BCH',
//       name: 'Bitcoin Cash'
//     },
//     {
//       symbol: 'ETH',
//       name: 'Ethereum'
//     }
//   ]

//   // Store them
//   alreadyListedCurrencies.forEach(currency => {
//     redis.hset(`listings`, currency.symbol, JSON.stringify(currency))
//   })
// }


async function hasUnannouncedCurrencies (text, currencies) {
  // Detects if a string contains currencies that are not yet announced
  const alreadyListedCurrencies = await getAlreadyListedCurrencies()

  const matchingCurrency = currencies.reduce((prev, currency) => {

    const matchesCurrencyName = text.includes(currency.name)
    const matchesCurrencySymbol = text.includes(currency.symbol)

    // If we found some currencies in the text...
    if(matchesCurrencyName || matchesCurrencySymbol) {
      // We can now check if the found currency does not exist yet in the alreadyListedCurrencies array
      const hasNewSymbol = alreadyListedCurrencies.every(announcedCurrency => announcedCurrency.symbol !== currency.symbol)
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

      if (matchingTweets.length) {
        console.log(`Coinbase Notifier: Found a matching Tweet after analyzing!`)

        matchingTweets.forEach(match => {

          // Make a list of matching currencies, like: BTC, ETH etc...
          const currenciesList = match.currencies.map(currency => {
            redis.hset(`listings`, currency.symbol, JSON.stringify(currency))
            return currency.symbol
          }).join(', ')

          const message = `Possible new Coinbase listing for ${currenciesList}?\n https://twitter.com/coinbase/status/${match.tweet.id_str} \n\n "${match.tweet.text}"`

          broadcastMessageToSubscribers(message)
        })

      } else {
        console.log('Coinbase Notifier: No matching Tweet found after analyzing.')
      }

    }

    // Save the Tweets in this run in Redis, so we can determine new tweets
    newTweets.forEach(tweet => {
      store(tweet.id)
    })

  } catch (err) {
    console.log('ERROR getting and/or analyzing data')
    throw err
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

async function broadcastMessageToSubscribers (message) {
  const telegramNotifier = new TelegramNotifier()
  try {
    await telegramNotifier.sendMessage(message)
    console.log(`Coinbase Notifier: Send message to channel ${process.env.TELEGRAM_CHANNEL}`)
  } catch (err) {
    console.log('ERROR sending message to Telegram channel')
    throw err
  }
}

// Lower the interval time when we are working on it
const intervalTime = (process.env.NODE_ENV === 'production') ? 2000 : 10000

interval(async () => {
  await getData()
}, intervalTime, {stopOnError: false})
