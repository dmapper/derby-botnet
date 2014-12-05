_ = require 'lodash'

module.exports = (entity, result, scenario = {}) ->
  switch entity.type
    when 'select', 'radio', 'button'
      opts = entity.options
      return unless opts?
      # If for some reason 'options' is an array of objects with value prop
      if opts[0].value?
        opts = _.pluck(opts, 'value')
      result[entity.name] = opts[_.random(0,opts.length-1)]
    when 'range'
      min = entity.min || scenario.limits?.min || scenario.chartLimits?.min || entity.limits?.min || 0
      max = entity.max || scenario.limits?.max || scenario.chartLimits?.max || entity.limits?.max || 100
      result[entity.name] = _.random(min, max)
    when 'number'
    # Well, in the game config file number limits should be specified
      min = entity.min || scenario.limits?.min || scenario.chartLimits?.min || entity.limits?.min || 0
      max = entity.max || scenario.limits?.max || scenario.chartLimits?.max || entity.limits?.max || 100000
      result[entity.name] = _.random(min, max)
    when 'text', 'textarea'
    # Этот тип сущности "интересный"
    # Откуда робот знает, что ему написать в ответе?
      dummyresult = ["Don't know", "Maybe", "Definately", "Sure",
                     "Don't care", "Neither Agree nor Disagree", "Strongly Agree"]
      result[entity.name] = dummyresult[_.random(0,dummyresult.length-1)]
    when 'checkbox'
      opts = [true, false]
      result[entity.name] = opts[_.random(0,opts.length-1)]
    else
      console.log("[Demo Mode] No such entity type.")
      result[entity.name] = 0