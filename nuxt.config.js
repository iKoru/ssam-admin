module.exports = {
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],
  head: {
    titleTemplate: '%s - Pedagy Admin',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'pedagy admin' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: [
    {src:'~/plugins/vuetify'},
    {src:'~/plugins/veevalidate', ssr:false},
    {src:'~/plugins/moment'},
    {src:'~/plugins/router', ssr:false},
    '~/plugins/axios'
  ],
  css: ['~/assets/style/app.styl'],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  axios:{
    credentials:true,
    proxy:true,
    proxyHeaders:false,
    prefix:'/api'
    //https:true,
    //host:process.env.NODE_ENV === 'development'?'node2-koru.c9users.io':'api.pedagy.com',
    //port:process.env.NODE_ENV === 'development'?'8080':'443',
    //crossDomain:true,
    //browserBaseURL:process.env.NODE_ENV === 'development'?'https://node2-koru.c9users.io:8080':process.env.API_DOMAIN//config.apiServerHost
  },
  proxy: {
    '/api/': { target: process.env.NODE_ENV === 'development'?'https://node2-koru.c9users.io:8080':process.env.API_DOMAIN, pathRewrite: {'^/api/': ''} }
  },
  build: {
    extractCSS: true
  }
}
