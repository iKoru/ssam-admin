import qs from 'querystring'
export default function (context) {
  if(process.server){
    // 사용자가 인증을 하지 않은 경우.
    if (!context.store.state.accessToken) {
      return context.redirect('/signin?'+qs.stringify({redirectTo:context.req.url}));
    }
  }
}