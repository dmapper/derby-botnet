var cluster = require('cluster');
var bot = require('derby-bot');
var Charlatan = require('charlatan');

var chalk = require('chalk')

var workerId = cluster.isWorker && cluster.worker.id;
var id = chalk.blue(workerId + '>');

var log = console.log;

console.log = function(){
  var args = Array.prototype.slice.call(arguments);
  log.apply(console, [id].concat(args));
}

module.exports = function(callback){
  var config = process.env.CONFIG;

  if (!config) {
    throw new Error('There is no config!');
  }

  config = require(config);
  var email = process.env.EMAIL;
  var password = process.env.PASS;

  var timeout = (config.startTimeout * 1000) || 10000;

  setTimeout(start, timeout);

  function start(){

    if (email){
      bot.login(getLoginOptions(), connect);
    } else {
      bot.register(getRegisterOptions(), connect);
    }
  }

  function connect(err, cookie, userId){
    console.log('logged in');

    var opts = {
      url: config.connectUrl,
      cookie: cookie
    }

    bot.connect(opts, function(err, model){
      callback(err, model, userId, config);
    })
  }

  function getLoginOptions(){
    var opts = {
      url: config.loginUrl,
      form: {
        email: email,
        password: password,
      }
    }
    return opts;
  }

  function getRegisterOptions(){
    var opts = {
      url: config.registerUrl,
      confirmUrl: config.registerConfirmUrl,
      form: {
        email: 'bot_' + Charlatan.Internet.safeEmail(),
        password: config.password || '123456',
        confirm:  config.password || '123456',
        firstname: Charlatan.Name.firstName(),
        lastname: Charlatan.Name.lastName()
      }
    }
    return opts;
  }
}

