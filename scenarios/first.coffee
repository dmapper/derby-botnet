async = require 'async'
actions = require '../util/actions'

module.exports = (err, model, userId, config) ->

  throw(err) if (err)

  gameId = config.gameId;

  $game = model.at('games.'+gameId);
  $user = model.at('auths.'+userId);

  model.subscribe $game, $user, (err) ->

    async.series [
      actions.addPlayer $game, $user, 120
      actions.waitForStart $game, $user
      actions.readInstruction $game, $user, 120
      actions.setupValues $game, $user, 120
      actions.setupQuestions $game, $user, 120
    ], ()->
      console.log 'All complete!'
