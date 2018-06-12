# Coinbase Notifier
<img src="https://github.com/jvandenaardweg/coinbase-notifier/blob/master/logo.png?raw=true" width="90" align="left" />

Receive a notification when Coinbase Tweets about a possible new listing. So you can buy before the pump.

Notifications are send instantly to this Telegram channel [t.me/CoinbaseNotifier](https://t.me/CoinbaseNotifier) < Join!

## How does it work?
The script will analyze new tweets from [@coinbase](https://twitter.com/coinbase/coinbase) and matches the tweet with all known cryptocurrencies (thanks Coinmarketcap).

If the script finds a currency in the tweet's text that's not yet listed (or announced) on Coinbase, you'll receive a notification instantly.

We let you decide if it's an announcement or not. Since it's not clear how Coinbase will formulate their tweet. The best thing we can do is see if the tweet matches an unlisted currency.

### Notification example:
> Possible new Coinbase listing ETC?
>
> https://twitter.com/coinbase/status/1006344839569403905
>
> "We are pleased to announce our intention to add support for Ethereum Classic (ETC) on Coinbase in the coming months."

## Why did I make this?
I noticed after the pump. Not gonna happen again.

#### But can't I just use my Twitter app notifications?
You can, but you'll receive other notifications as well. This script filters out the things you don't want to receive as a notification.

###### Icon made by Smashicons from [Flaticon.com](https://www.flaticon.com)
