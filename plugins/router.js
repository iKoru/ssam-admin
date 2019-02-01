import NProgress from 'nprogress';

export default ({app})=>{
  // router gards
  app.router.beforeEach((to, from, next) => {
    NProgress.start();
  
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/signin', '/error'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = app.store.getters.userId;
  
    if (authRequired && !loggedIn) {
      return next('/signin');
    }
  
    next();
  }); 
  
  app.router.afterEach((to, from) => {
    // ...
    NProgress.done();
  });
};