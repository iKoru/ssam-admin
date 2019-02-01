module.exports = {
  modules: [
    '@nuxtjs/axios',
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
    {src:'~/plugins/axios'}
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
    https:true,
    host:'node2-koru.c9users.io',
    port:'8080',
    browserBaseURL:'https://node2-koru.c9users.io:8080'//config.apiServerHost
  },
  build: {
    extractCSS: true
  }
}
