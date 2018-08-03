var url = require('url');
var random = require('lodash/random');
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

exports.start = function(callback, id){
  var baseUrl = url.parse(process.env.URL);

  var email = process.env.EMAIL;
  var password = process.env.PASS;

  var timeout = (random(0, process.env.TIMEOUT) * 1000) || 10000;

  setTimeout(start, timeout);

  function start(){

    if (email){
      bot.login(getLoginOptions(), connect);
    } else {
      bot.register(getRegisterOptions(), connect);
    }
  }

  function connect(err, cookie, userId){
    console.log(id, 'sign in');

    var opts = {
      url: process.env.URL,
      cookie: cookie
    }

    bot.connect(opts, function(err, model){
      callback(err, model, userId, id);
    })
  }

  function getLoginOptions(){
    var opts = {
      url: getLoginUrl(baseUrl),
      form: {
        email: getEmail(email, id),
        password: password,
      }
    }
    return opts;
  }

  function getRegisterOptions(){
    var password = 'pass' + random(0, 100000000)
    var opts = {
      url: getRegisterUrl(baseUrl),
      confirmUrl: getConfirmUrl(baseUrl),
      form: {
        email: 'bot_' + random(0, 100000) + Charlatan.Internet.safeEmail(),
        password: password,
        confirm:  password,
        firstname: Charlatan.Name.firstName(),
        lastname: Charlatan.Name.lastName()
      }
    }
    return opts;
  }
}

function getConfirmUrl(url){
  var pr = url.protocol === 'ws:' ? 'http:' : 'https:';
  var res = pr + "//" + url.host + '/auth/confirmregistration?id='
  return res;
}

function getLoginUrl(url){
  var pr = url.protocol === 'ws:' ? 'http:' : 'https:';
  var res = pr + "//" + url.host + '/auth/login'
  return res;
}

function getRegisterUrl(url){
  var pr = url.protocol === 'ws:' ? 'http:' : 'https:';
  var res = pr + "//" + url.host + '/auth/register'
  return res;
}


function zeroPad(num, places){
  zero = places - num.toString().length + 1
  return Array(+(zero > 0 && zero)).join("0") + num
}

function getEmail(emailPattern, id){
  return emailPattern.replace(/{{index}}/g, zeroPad(id, 4))
}


