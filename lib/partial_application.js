(function (root) {
  var CORE = require('./core');
  var functionalize = CORE.functionalize,
      extend = CORE.extend,
      variadic = CORE.variadic,
      __slice = [].slice;

  // ### Partial Application and Currying
  
  // this can be done with composition, but speed matters
  function flip (fn) {
    fn = functionalize(fn);
    
    return function (a, b) {
      if (b == null) {
        return function (b) {
          return fn.call(this, b, a);
        }
      }
      else return fn.call(this, b, a);
    };
  }

  // Applies the first argument, returns a variadic function taking the rest
  function applyFirst (fn, first) {
    if (first == null) return function (first) { return applyFirst(fn, first); };
    
    fn = functionalize(fn);
    var fnLength = fn.length;
    
    if (fnLength === 1) {
      return fn(first);
    }
    else if (fnLength === 2) {
      return function (a) {
        return fn(first, a);
      }
    }
    else if (fnLength === 3) {
      return function (a, b) {
        return fn(first, a, b);
      }
    }
    else return variadic( function (args) {
      return fn.apply(this, [first].concat(args))
    })
  };
  
  var applyThisFirst = flip(applyFirst);

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

  // applies one or more arguments in the leftmost positions,
  // returns a variadic function taking the rest
  var applyLeft = variadic( function (fn, args) {
    fn = functionalize(fn);
    return variadic( function (remainingArgs) {
      return fn.apply(this, args.concat(remainingArgs))
    })
  });

  // applies one or more arguments in the rightmost positions,
  // returns a variadic function taking the rest
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

  // transforms a polyadic function into a chain of unary
  // functions. Named after Haskell Curry, although it
  // is now known to have been first discovered by Moses
  // Schoöenfinkel
  //
  //    curry(function (x, y) { return x })
  //      //=> function (x) {
  //             return function (y) { return x }
  //           }
  function curry (fn) {
    fn = functionalize(fn);
    var arity = fn.length;

    return given([]);

    function given (argsSoFar) {
      return function curried () {
        var updatedArgsSoFar = argsSoFar.concat(__slice.call(arguments, 0));

        if (updatedArgsSoFar.length >= arity) {
          return fn.apply(this, updatedArgsSoFar)
        }
        else return given(updatedArgsSoFar)
      }
    }

  };
  
  extend(root, {
    flip: flip,
    applyFirst: applyFirst,
    applyLast: applyLast,
    applyThisFirst: applyThisFirst,
    applyThisLast: applyThisLast,
    applyLeft: applyLeft,
    applyRight: applyRight,
    bound: bound,
    curry: curry
  });
      
  
})(this);
