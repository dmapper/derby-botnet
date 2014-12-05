require('yamlify/register');
require('coffee-script/register');
var async = require('async');

var starter = require('./starter');
var num = +process.env.NUM;
var startId = +process.env.INDEX;
var script = require(process.env.SCRIPT);

var tasks = []
for(var i=0; i < num; i++){
  tasks.push(start(startId + i + 1));
}

function start(id){
  return function(cb){
    setTimeout(function(){
      console.log(id, 'started')
      starter.start(script, id);
      cb()
    }, 200)
  }
}

async.series(tasks, function(){
  console.log('Worker start all the tasks!');
})
