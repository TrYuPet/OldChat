var checkAuth = require('middleware/checkAuth');

module.exports = function(app) {

//корневая страницы обрабатывается routes/frontpage
  app.get('/', require('./frontpage').get);

  //страница авторизации обрабатывается routes/login
  app.get('/login', require('./login').get);
  //попытка авторизации
  app.post('/login', require('./login').post);

  app.post('/logout', require('./logout').post);

  app.get('/profile', require('./profile').get);

  app.get('/chat', checkAuth, require('./chat').get);

};