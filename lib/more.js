(function (root) {
  var APPLICATION = require('./apply')
      FOLDING = require('./folding');
      PLUMBING = require('./internal/plumbing'),
      COMPOSITION = require('./composition'),
      FLIP = require('./call_flipped'),
      functionalize = PLUMBING.functionalize,
      extend = PLUMBING.extend;
      compose = COMPOSITION.compose,
      flip = APPLICATION.flip,
      mapWith = FOLDING.mapWith,
      flip = FLIP.flip;

  var ARITY = require('./arity'),
      variadic = ARITY.variadic;

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

  function attr (object, attrName) {
    if (attrName == null) {
      return function (attrName) { return object[attrName]; };
    }
    else return object[attrName];
  };

  function attrWith (attrName, object) {
    if (object == null) {
      return function (object) { return object[attrName]; };
    }
    else return object[attrName];
  };

  var pluckWith = compose(mapWith, attrWith),
      pluck = flip(pluckWith);

  // Send a message/invoke a method on the receiver.
  // TODO: Think about what it has in common with callLeft
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
    attr: attr,
    attrWith: attrWith,
    send: send,
    pluckWith: pluckWith,
    pluck: pluck
  })
  
})(this);