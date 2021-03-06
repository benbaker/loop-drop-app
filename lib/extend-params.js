var computed = require('mutant/computed')
var MutantArray = require('mutant/array')
var resolveAvailable = require('lib/resolve-available')

module.exports = function extendParams (obs) {
  var paramOverrideStack = MutantArray([])
  obs.overrideParams = function (params) {
    paramOverrideStack.push(params)
    return function release () {
      paramOverrideStack.delete(params)
    }
  }

  var raw = {}

  var paramLookup = computed([obs.params, obs.paramValues, paramOverrideStack], function (params, values, overrides) {
    var result = {}
    var rawResult = {}
    for (var i = 0; i < params.length; i++) {
      var key = params[i]
      var override = paramOverrideStack.get(paramOverrideStack.getLength() - 1)
      if (override && override[i] != null) {
        result[key] = typeof override[i] === 'function' ? override[i]() : override[i] || 0
        rawResult[key] = override[i]
      } else {
        result[key] = values && values[key] || 0
        rawResult[key] = obs.paramValues.get(key)
      }
    }
    raw = rawResult
    return result
  })

  paramLookup.get = function (key) {
    return raw[key]
  }

  paramLookup.keys = function (key) {
    return Object.keys(raw)
  }

  obs.context.paramLookup = paramLookup

  obs.resolveAvailableParam = function (id, lastId) {
    return resolveAvailable(obs.params(), id, lastId)
  }
}
