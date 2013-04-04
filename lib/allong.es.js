(function (root) {
  var extend = require('./internal/plumbing').extend;

  extend(root,
    require('./core'),
    require('./arity'),
    require('./function_application'),
    require('./folding'),
    require('./decorators'),
    require('./mixin'),
    require('./more'),
    require('./trampoline'),
    {
      iterators: require('./iterators')
    }
  );
  
})(this);