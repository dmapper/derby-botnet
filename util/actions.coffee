_ = require 'lodash'
async = require 'async'
assignValue = require './assign-value'

getRandomInt = (min, max) ->
  Math.floor(Math.random() * (max - min + 1)) + min

wait = (sec, fn) ->
  (cb) ->
    time = getRandomInt(0, sec)
    setTimeout ()->
      fn(cb)
    , time * 1000

getClusterId = (game, user) ->
  userId = user.get 'id'
  teamId = game.get "players.#{userId}.teamId"
  game.get "teams.#{teamId}.clusterId"

setStatus = ($game, $user, status) ->
  player = $game.at "players.#{$user.get('id')}"
  player.set 'status', status


exports.waitForStart = (game, user, sec)->
  (cb)->
    if game.get('start') > 0
      console.log('game already started')
      cb
    else
      game.once 'change', 'start', ->
        console.log('game started')
        cb()

exports.addPlayer = (game, user, sec) ->
  userId = user.get 'id'
  wait sec, (cb) ->
    player =
      id: userId
      status: 1
      valuations: {}

    game.add('players', player);
    game.push('playerIds', userId);

    console.log('add player to game')

    cb()

exports.readInstruction = ($game, $user, sec) ->
  wait sec, (cb) ->
    userId = $user.get 'id'
    game = $game.getDeepCopy()
    player = game.players[userId]
    if player
      player.readInstructions = true
      player.status = 2
      $game.setDiffDeep(game)
      console.log 'instruction set'
    else
      console.log 'instruction dont set', $user.get()
    cb()

exports.setStatus = ($game, $user, status, sec) ->
  userId = $user.get 'id'
  wait sec, (cb) ->
    player = $game.at "players.#{userId}"
    player.set 'status', status
    console.log 'status set'
    cb()

exports.setupValues = ($game, $user, sec) ->

  (cb) ->
    clusterId = getClusterId $game, $user

    unless clusterId then return cb()

    cluster = $game.get "clusters.#{clusterId}"

    if cluster? and (cluster.vals is undefined)
      scenario = $game.get('scenario')
      issues = $game.get('scenario.issues') || []

      num = issues.length

      vals = {}
      async.eachSeries issues, (issue, cb) ->
        setTimeout () ->
          assignValue(issue, vals, scenario)
          $game.set "clusters.#{clusterId}.vals.#{issue.name}", vals[issue.name]
          console.log 'set val:', issue.name
          cb()
        , _.random(0, (sec * 1000 / num))
      , () ->

        setStatus($game, $user, 3)
        cb()
    else
      setTimeout () ->
        setStatus($game, $user, 3)
        cb()
      , _.random(0, sec * 1000)

exports.setupQuestions = ($game, $user, sec) ->

  (cb) ->

    userId = $user.get 'id'

    scenario = $game.get 'scenario'
    questions = $game.get('scenario.questions') || []
    postQuestions = $game.get('scenario.postQuestions') || []
    allQuestions = [].concat(questions, postQuestions)

    answers = {}
    num = allQuestions.length

    async.eachSeries allQuestions, (question, cb) ->
      setTimeout () ->
        assignValue(question, answers, scenario)
        $game.set "players.#{userId}.answers.#{question.name}", answers[question.name]
        console.log 'set question:', question.name
        cb()
      , _.random(0, (sec * 1000 / num))
    , () ->

      setStatus($game, $user, 4)

      cb()




