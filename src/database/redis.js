require('dotenv').config()
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

redis.on('error', function (error) {
  console.log('Redis:', 'Error', error.code, error.message)
})

redis.on('reconnecting', function () {
  console.log('Redis:', 'Reconnecting...')
})

redis.on('close', function () {
  console.log('Redis:', 'Connection closed.')
})

redis.on('ready', function () {
  console.log('Redis:', 'Connection successful!')
})

redis.on('end', function () {
  console.log('Redis:', 'End.')
})

// redis.monitor().then(function (monitor) {
//   monitor.on('monitor', function (time, args, source, database) {
//     if (args[1] && !args[1].includes('TICKERS~')) console.log(`Redis: ${args[0]} -> ${args[1]}`)
//   })
// })

module.exports = redis
