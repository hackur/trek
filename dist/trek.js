'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _http = require('http');

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

var _engine = require('./engine');

var _engine2 = _interopRequireDefault(_engine);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

var _paths = require('./paths');

var _paths2 = _interopRequireDefault(_paths);

var _plugins = require('./plugins');

var _plugins2 = _interopRequireDefault(_plugins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

// lifecycle:
//    created
//    beforeRun
//    running
//    ran

class Trek extends _engine2.default {

  constructor(root = (0, _path.dirname)(require.main.filename)) {
    super();

    this.root = root;
    this.paths = new _paths2.default(root);
    this.loader = new _loader2.default(this);
    this.hooks = Object.create(null);
    this.plugins = new Map();
  }

  // rewrite
  _init() {}

  // rewrite
  initialize(all = true) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.initialized) return _this;

      _this.usePlugin(..._plugins2.default);

      if (all) {
        const plugins = yield _this.paths.get('app/plugins');
        _this.usePlugin(...plugins);
      }

      yield _this.callHook('created');

      _this.initialized = true;

      return _this;
    })();
  }

  // rewrite
  run() {
    var _this2 = this,
        _arguments = arguments;

    return _asyncToGenerator(function* () {
      yield _this2.callHook('beforeRun');

      const server = new _http.Server(function (req, res) {
        (0, _onFinished2.default)(res, function (err) {
          // handle err
          if (err) {
            console.log(err);
          }
        });

        _this2.callHook('running', req, res);
      });

      return yield server.listen(..._arguments);
    })();
  }

  usePlugin(...args) {
    for (const Plugin of args) {
      if (Plugin.install && !Plugin.installed) {
        const plugin = Plugin.install(this);
        this.plugins.set(Plugin.name, plugin);
      }
    }
  }

  callHook(hook, ...args) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let handlers = _this3.hooks[hook] || [];

      handlers = handlers.concat(_this3.findHandlersByHook(hook));
      for (const handle of handlers) {
        yield handle(_this3, ...args); // eslint-disable-line babel/no-await-in-loop
      }
    })();
  }

  findHandlersByHook(hook) {
    return Array.from(this.plugins.values()).filter(plugin => plugin[hook]).map(plugin => plugin[hook].bind(plugin));
  }

}
exports.default = Trek;