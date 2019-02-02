const https = require('https')
const fs = require('fs')
const Nuxt = require('nuxt')
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
  console.log(`Server listening on https://${process.env.ADMIN_DOMAIN}`)
}else{
  nuxt.build() // Build in development mode
}
