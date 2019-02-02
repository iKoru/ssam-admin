const https = require('https')
const fs = require('fs')
const {Nuxt, Builder} = require('nuxt')
const isProd = process.env.NODE_ENV === 'production'
const port = process.env.ADMIN_PORT || 443

// Nuxt.js setup
let config = require('./nuxt.config.js')
config.dev = !isProd
const nuxt = new Nuxt(config)
if (isProd) {
  // HTTPS Server
  const options = {
    key: fs.readFileSync(process.env.ADMIN_KEY),
    cert: fs.readFileSync(process.env.ADMIN_CERT)
  }
  
  // Create the server
  https
  .createServer(options, nuxt.render)
  .listen(port)
  
  // set up plain http server
  const http = require('http')
  const express = require('express')()
  
  // set up a route to redirect http to https
  express.all(function(req, res) {  
    res.redirect('https://'+ process.env.ADMIN_DOMAIN);
  })
  http.Server(express).listen(80);
  console.log(`Server listening on https://${process.env.ADMIN_DOMAIN}`)
}else{
  new Builder(nuxt).build() // Build in development mode
}
