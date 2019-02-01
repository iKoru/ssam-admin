import qs from 'querystring'
function getCookie(cname, cookie) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
}
export default function (context) {
  if(process.server){
    // 사용자가 인증을 하지 않은 경우.
    if (!context.store.getters.userId) {
      return context.redirect('/signin?'+qs.stringify({redirectTo:context.req.url}));
    }
  }else{
    if(!getCookie('token', document.cookie)){
      return context.redirect('/signin?'+qs.stringify({redirectTo:context.req.url}));
    }
  }
}