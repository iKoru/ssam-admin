import config from "~/assets/js/config";

function getCookie (cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

export default function ({ $axios, redirect }) {
  $axios.defaults.baseUrl = config.apiServerHost;
  $axios.defaults.withCredentials = true;
  $axios.defaults.xsrfCookieName = 'CSRF-TOKEN';
  $axios.defaults.xsrfHeaderName = 'CSRF-TOKEN';
  $axios.defaults.crossDomain = true;

  $axios.interceptors.request.use(
    function (config) {
      config.headers['CSRF-TOKEN'] = getCookie('CSRF-TOKEN')
      console.log('request config : ', config)
      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )
}