# Coinbase Announcer
Receive a notification when Coinbase Tweets about a possible new listing. So you can buy before the pump.

## How does it work?
The script will analyze new tweets from @coinbase and matches the tweet with all known cryptocurrencies (thanks Coinmarketcap).

If the script finds a currency in the tweet's text that's not yet listed (or announced) on Coinbase, you'll receive a notification instantly.

We let you decide if it's an announcement, or not. Since it's not clear how Coinbase will formulate a tweet. The best thing we can do is see if the tweet matches an unlisted currency.

Notification: `Possible new Coinbase listing? [link to Tweet] [Tweet text]`

Notifications are send to this Telegram channel `https://t.me/CoinbaseAnnouncer` < Join!
