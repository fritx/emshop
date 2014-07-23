path = require 'path'
_ = require 'underscore'
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

store =
  address: require './data/address'
  orders: require './data/orders'
  coupons: require './data/coupons'

app.get '/api/fetch_shop', (req, res)->
  res.json require './data/shop'
app.get '/api/fetch_items', (req, res)->
  res.json require './data/items'

app.post '/api/create_order', (req, res)->
  console.log req.body
  # lack of logic
  res.send 'ok'

app.get '/api/fetch_address', (req, res)->
  res.json store.address

app.get '/api/fetch_orders', (req, res)->
  res.json store.orders

app.post '/api/action_order', (req, res)->
  console.log req.body
  # lack of logic
  res.send 'ok'

app.get '/api/check_coupon', (req, res)->
  code = req.query['code']
  coupon = _.findWhere store.coupons, { code }
  res.send coupon or ''

# listen

app.listen PORT, ->
  console.log "Server started on #{PORT}"