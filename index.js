require('yamlify/register');

var cluster = require('cluster');
var config = require('./config');
var async = require('async');

cluster.setupMaster({ exec: __dirname + '/client.js' });

var tasks = [];

for(var script in config.bots){
  var count = config.bots[script];

  for(var i=0; i < count; i++){
    tasks.push(start(script));
  }
}

async.series(tasks, function(){
  console.log('all tasks are queued');
});

function start(script){
  return function(cb){
    setTimeout(function(){
      var env = {
        CONFIG: __dirname + '/config.yaml',
        SCRIPT: __dirname + '/scenarios/'+script
      }
      cluster.fork(env);
      cb();
    }, 200)
  }
}
cluster.on('online', function(worker) {
  console.log('worker ' + worker.id + ' online');
});

cluster.on('exit', function(worker, code, signal) {
  console.log('worker ' + worker.id + ' died');
});

