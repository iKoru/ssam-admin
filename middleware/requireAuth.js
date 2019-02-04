import qs from 'querystring'

export default function (context) {
  // 사용자가 인증을 하지 않은 경우.
  if (!context.store.getters.userId) {
    return context.redirect('/signin?'+qs.stringify({redirectTo:context.req.url}));
  }
}