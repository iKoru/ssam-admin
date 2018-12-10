
export default function ({ store, redirect }) {
  if(process.browser){
    //console.log('browser middlewares');
  }else{
    // 사용자가 인증을 하지 않은 경우.
    if (!store.state.accessToken) {
      return redirect('/signin')
    }
  }
}