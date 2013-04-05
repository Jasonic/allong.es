(function (root) {
  var CORE = require('./core'),
      call = CORE.call,
      binary = CORE.binary,
      compose = CORE.compose;

  var COMPOSITION = require('./composition'),
      compose = COMPOSITION.compose;

  var FLIP = require('./call_flipped'),
      callFlipped = FLIP.callFlipped,
      flip = FLIP.flip;
      
  var PLUMBING = require('./internal/plumbing'),
      functionalize = PLUMBING.functionalize,
      extend = PLUMBING.extend;

  var ARITY = require('./arity'),
      variadic = ARITY.variadic;
      
  var __slice = [].slice;
  
  // JS "apply" semantics if you need them
  var apply = call.binary( function (fn, args) {
    return call.apply(this, ( args ? [fn].concat(args) : [fn] ));
  });
  
  // synonym
  var curry = call;
  
  // synonym
  var applyLeft = call;
  
  // synonym
  var callLeft = call;

  // Like callLeft, but it is binary so it can be (and is) curried 
  var callFirst = binary(call);
  var callThisFirst = callFlipped.binary(call);

  // applies one or more arguments in the rightmost positions,
  // returns a variadic function taking the rest
  //
  // TODO: This is the next frontier! It needs its own polyadic.
  var applyRight = variadic( function (fn, args) {
    fn = functionalize(fn);
    var fnLength = fn.length;

    if (fnLength < 1) {
      return variadic( function (precedingArgs) {
        return fn.apply(this, precedingArgs.concat(args))
      })
    }
    else if (fnLength > args.length) {
      return variadic( function (precedingArgs) {
        return fn.apply(this, __slice.call(precedingArgs, 0, fnLength - args.length).concat(args));
      })
    }
    else return function () { return fn.apply(this, args); }

  });

  // Applies the last argument, returns a variadic function taking the rest
  function applyLast (fn, last) {
    if (last == null) return function (last) { return applyLast(fn, last); };
    
    fn = functionalize(fn);
    var fnLength = fn.length;

    if (fnLength < 1) {
      return variadic( function (args) {
        return fn.apply(this, args.concat([last]));
      })
    }
    else if (fnLength === 1) {
      return fn(last);
    }
    else if (fnLength === 2) {
      return function (a) {
        return fn(a, last);
      }
    }
    else if (fnLength === 3) {
      return function (a, b) {
        return fn(a, b, last);
      }
    }
    else if (fnLength > 1) {
      return variadic( function (args) {
        return fn.apply(this, __slice.call(args, 0, fnLength - 1).concat([last]));
      })
    }
    else return function () { return fn.call(this, last); }
  };
  
  var applyThisLast = flip(applyLast);

  // ### Partial applications that bind

  // A partially applied binding function
  //
  // roughly equivalent to applyRight
  //
  // var fn = function (...) { ... }
  //
  // bound(fn)(x)
  //   //=> fn.bind(x)
  //
  // bound(fn, foo)(x)
  //   //=> fn.bind(x, foo)
  //
  // bound(fn, foo, bar)(x)
  //   //=> fn.bind(x, foo, bar)
  var bound = variadic( function (messageName, args) {
    if (args === []) {
      return function (instance) {
        return instance[messageName].bind(instance)
      }
    }
    else {
      return function (instance) {
        return Function.prototype.bind.apply(
          instance[messageName], [instance].concat(args)
        )
      }
    }
  });
  
  var defaults = variadic( function (fn, values) {
    var fln = fn.length,
        vln = values.length;
    return variadic( function (args) {
      var aln = args.length,
          mln = Math.max(fln - aln, 0);
      args = args.concat(values.slice(vln-mln));
      return fn.apply(this, args);
    })
  });
  
  // collects arguments
  function args (arity) {
    if (arity === 1) {
      return function (a) {
        return [a];
      };
    }
    else if (arity === 2) {
      return function (a, b) {
        return [a, b];
      };
    }
    else if (arity === 3) {
      return function (a, b, c) {
        return [a, b, c];
      };
    }
    else return variadic( function (args) {
      return args;
    });
  };
  
  extend(root, {
    curry: curry,
    apply: apply,
    applyLeft: applyLeft,
    callLeft: callLeft,
    callFirst: callFirst,
    applyLast: applyLast,
    callThisFirst: callThisFirst,
    applyThisLast: applyThisLast,
    applyLeft: applyLeft,
    applyRight: applyRight,
    bound: bound,
    defaults: defaults,
    args: args
  });
      
  
})(this);
