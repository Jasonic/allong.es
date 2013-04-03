(function (root) {
  var CORE = require('./core')
      FOLDING = require('./folding');
  
  var functionalize = CORE.functionalize,
      extend = CORE.extend,
      compose = CORE.compose,
      variadic = CORE.variadic,
      mapWith = FOLDING.mapWith;

  var unbind = function unbind (fn) {
    fn = functionalize(fn);
    return fn.unbound ? unbind(fn.unbound()) : fn
  };

  function bind (fn, context, force) {
    fn = functionalize(fn);
    var unbound, bound;

    if (force) {
      fn = unbind(fn)
    }
    bound = function () {
      return fn.apply(context, arguments)
    };
    bound.unbound = function () {
      return fn;
    };

    return bound;
  }

  function invoke (fn) {
    fn = functionalize(fn);
    var args = __slice.call(arguments, 1);

    return function (instance) {
      return fn.apply(instance, args)
    }
  };

  function get (object, attr) {
    if (attr == null) {
      return function (attr) { return object[attr]; };
    }
    else return object[attr];
  };

  function getWith (attr, object) {
    if (object == null) {
      return function (object) { return object[attr]; };
    }
    else return object[attr];
  };

  var pluck = compose(mapWith, getWith);

  // Send a message/invoke a method on the receiver.
  // TODO: Think about what it has in common with applyLeft
  var send = variadic( function (methodName, args) {
    return variadic( function (receiver, remainingArgs) {
      var fn = receiver[methodName];
      return fn.apply(receiver, args.concat(remainingArgs))
    })
  });
  
  extend(root, {
    bind: bind,
    unbind: unbind,
    invoke: invoke,
    getWith: getWith,
    send: send,
    pluck: pluck
  })
  
})(this);