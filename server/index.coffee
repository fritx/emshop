path = require 'path'
express = require 'express'
bodyParser = require 'body-parser'
app = express()
PORT = 8099

# middleware

app.use bodyParser.urlencoded extended: true

# static

app.use '/', express.static(
  path.resolve __dirname, '../dist'
  )
app.use '/content', express.static(
  path.resolve __dirname, './content'
  )

# logic

app.get '/api/fetch_shop', (req, res)->
  res.json require './data/shop'
app.get '/api/fetch_items', (req, res)->
  res.json require './data/items'

app.post '/api/create_order', (req, res)->
  console.log req.body
  res.end 'ok'

# listen

app.listen PORT, ->
  console.log "Server started on #{PORT}"