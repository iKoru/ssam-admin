import config from "~/assets/js/config";
import qs from 'querystring'

export default function ({ $axios, redirect, app, router, store }) {
  $axios.defaults.baseUrl = config.apiServerHost;
  $axios.defaults.withCredentials = true;
  $axios.defaults.xsrfCookieName = 'CSRF-TOKEN';
  $axios.defaults.crossDomain = true;
  
  $axios.interceptors.response.use(
    null,
    function (error) {
      if (error.response && error.response.status === 401) {
        let query = location.search !== '' ? qs.parse(location.search.substring(1)) : {};
        query.redirectTo = location.pathname
        let isRefreshing = true;
        return $axios({
          method: 'POST',
          url: '/refresh'
        })
        .then(response => { // success to refresh
          isRefreshing = false;
          return $axios.request(error.config);
        })
        .catch(error2 => { // failed to refresh. redirect to signin page. save original request information only when get request
          if (isRefreshing) {
            app.$emit('showSnackbar', '세션이 만료되었습니다.', 'error')
            return router.push('/signin?' + qs.stringify(query))
          } else {
            return Promise.reject(error2)
          }
        });
      }
      return Promise.reject(error)
    }
  )
}