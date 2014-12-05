require('yamlify/register');

var cluster = require('cluster');
var async = require('async');

cluster.setupMaster({ exec: __dirname + '/client.js' });

module.exports = function(config, emailPattern, password){
  var tasks = [];

  var index = 0;
  config.bots.forEach(function(script){
    var count = script.count;
    var num = Math.ceil(count / config.botPerWorker)

    for(var i=0; i < num; i++){
      var mod = count % config.botPerWorker
      if (mod == 0 ) mod = config.botPerWorker;
      var usersNum = (i === num-1 ? mod : config.botPerWorker);

      var data = {
        GAME: config.gameId,
        SCRIPT: script.path,
        URL: config.url,
        TIMEOUT: config.startTimeout,
        NUM: usersNum,
        INDEX: index
      };

      if (emailPattern) {
        data.EMAIL = emailPattern;
        data.PASS = password;
      }

      tasks.push(data);
      index += usersNum
    }
  });

  async.eachSeries(tasks, startTask, function(){
    console.log('All tasks are started!')
  });
}

function startTask(task, cb){
  setTimeout(function(){
    cluster.fork(task);
    cb();
  }, 200);
}

cluster.on('online', function(worker) {
  console.log('worker ' + worker.id + ' online');
});

cluster.on('exit', function(worker, code, signal) {
  console.log('worker ' + worker.id + ' died');
});

