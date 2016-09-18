const MongoClient = require('mongodb').MongoClient
const MONGO_CONNECTION_STRING = 'mongodb://mit'
  + ':3CQLoC8YgmkeiBvLLQJmmouyHkWdQXGQJXR93SaKekbs3tcAlJNxpaddqFE0CHQoSXwPSQb8gRAMH1XKvVibjQ=='
  + '@mit.documents.azure.com:10250/?ssl=true'

module.exports = MongoClient.connect(MONGO_CONNECTION_STRING, { npromiseLibrary: require('bluebird') })
