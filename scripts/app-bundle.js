define('app',['exports', 'aurelia-framework', './services/drag-service'], function (exports, _aureliaFramework, _dragService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_dragService.DragService), _dec(_class = function App(dragService) {
        _classCallCheck(this, App);

        this.ds = dragService;
    }) || _class);
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('components/board',['exports', 'aurelia-framework', '../services/board-service'], function (exports, _aureliaFramework, _boardService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BoardCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var BoardCustomElement = exports.BoardCustomElement = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService), _dec(_class = function () {
        function BoardCustomElement(boardService) {
            _classCallCheck(this, BoardCustomElement);

            this.bs = boardService;
        }

        BoardCustomElement.prototype.getBoardSizeCSS = function getBoardSizeCSS() {
            var boardType = this.bs.boardTypes[this.bs.boardType];
            var css = {
                width: boardType.w * this.bs.partSize + 'px',
                height: boardType.h * this.bs.partSize + 'px'
            };
            return css;
        };

        return BoardCustomElement;
    }()) || _class);
});
define('components/controls',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ControlsCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ControlsCustomElement = exports.ControlsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function ControlsCustomElement(eventAggregator) {
            _classCallCheck(this, ControlsCustomElement);

            this.ea = eventAggregator;
        }

        ControlsCustomElement.prototype.addEventListeners = function addEventListeners() {};

        ControlsCustomElement.prototype.attached = function attached() {
            this.addEventListeners();
        };

        return ControlsCustomElement;
    }()) || _class);
});
define('components/menu',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MenuCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var MenuCustomElement = exports.MenuCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function MenuCustomElement(eventAggregator) {
            _classCallCheck(this, MenuCustomElement);

            this.ea = eventAggregator;
            this.settings = {
                menuVisible: false,
                submenuBoardsVisible: false,
                opaqueBlocks: false
            };
        }

        MenuCustomElement.prototype.showTheMenu = function showTheMenu() {
            this.settings.menuVisible = true;
            this.settings.submenuBoardsVisible = false;
        };

        MenuCustomElement.prototype.hideTheMenu = function hideTheMenu() {
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.showThisBoard = function showThisBoard(key) {
            var threshold = 3;
            if (this.solutions) {
                switch (key) {
                    case 'square':
                        return true;
                    case 'rectangle':
                        return this.solutions['square'].length > threshold;
                    case 'beam':
                        return this.solutions['rectangle'].length > threshold;
                    case 'stick':
                        return this.solutions['beam'].length > threshold;
                    case 'twig':
                        return this.solutions['stick'].length > threshold;
                    default:
                        return false;
                }
                console.log(this.board.boardTypes[key]);
            }
            return true;
        };

        MenuCustomElement.prototype.toggleSubmenuBoards = function toggleSubmenuBoards() {
            this.settings.submenuBoardsVisible = !this.settings.submenuBoardsVisible;
        };

        MenuCustomElement.prototype.setOpaqueBlocks = function setOpaqueBlocks() {
            this.settings.opaqueBlocks = true;
        };

        MenuCustomElement.prototype.setTransparentBlocks = function setTransparentBlocks() {
            this.settings.opaqueBlocks = false;
        };

        MenuCustomElement.prototype.screenIsLargeEnough = function screenIsLargeEnough() {
            var clw = document.querySelectorAll('html')[0].clientWidth;
            var clh = document.querySelectorAll('html')[0].clientHeight;
            return clw + clh > 1100;
        };

        MenuCustomElement.prototype.addEventListeners = function addEventListeners() {};

        MenuCustomElement.prototype.attached = function attached() {
            this.addEventListeners();
        };

        return MenuCustomElement;
    }()) || _class);
});
define('components/pentominos',['exports', 'aurelia-framework', 'aurelia-event-aggregator', '../services/pentomino-service', '../services/setting-service', '../services/drag-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _pentominoService, _settingService, _dragService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PentominosCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var PentominosCustomElement = exports.PentominosCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _pentominoService.PentominoService, _settingService.SettingService, _dragService.DragService), _dec(_class = function () {
        function PentominosCustomElement(eventAggregator, pentominoService, settingService, dragService) {
            _classCallCheck(this, PentominosCustomElement);

            this.ea = eventAggregator;
            this.ps = pentominoService;
            this.ss = settingService;
            this.ds = dragService;
        }

        PentominosCustomElement.prototype.getPentominoCSS = function getPentominoCSS(position, color) {
            if (position) {
                var css = {
                    left: position.x * this.ss.partSize + 'px',
                    top: position.y * this.ss.partSize + 'px',
                    backgroundColor: color
                };
                return css;
            }
        };

        PentominosCustomElement.prototype.getPartCSS = function getPartCSS(part) {
            var css = {
                'left': part[0] * this.ss.partSize + 'px',
                'top': part[1] * this.ss.partSize + 'px'
            };
            return css;
        };

        PentominosCustomElement.prototype.getPentominoClasses = function getPentominoClasses(pentomino) {
            var classes = ['pentomino'];
            classes.push('pentomino block_' + pentomino.name);
            pentomino.active && classes.push('active');
            return classes.join(' ');
        };

        PentominosCustomElement.prototype.getPartClasses = function getPartClasses(pentomino, partIndex) {
            var classes = ['fa', 'part'];

            var flipH = !(this.ps.pentominos.indexOf(pentomino) === 1 && pentomino.dimensions[0] > pentomino.dimensions[1] || this.ps.pentominos.indexOf(pentomino) === 6 && pentomino.face % 2 === 0);
            var flipV = !(this.ps.pentominos.indexOf(pentomino) === 1 && pentomino.dimensions[0] < pentomino.dimensions[1] || this.ps.pentominos.indexOf(pentomino) === 6 && pentomino.face % 2 === 1);
            if (partIndex === 0 && pentomino.type < 5) {
                classes.push('fa-refresh');
                classes.push('rotate');
            }
            if (partIndex === 1 && pentomino.type < 4 && flipH) {
                classes.push('fa-arrows-h');
                classes.push('flipH');
            }
            if (partIndex === 2 && pentomino.type < 4 && flipV) {
                classes.push('fa-arrows-v');
                classes.push('flipV');
            }
            return classes.join(' ');
        };

        PentominosCustomElement.prototype.addEventListeners = function addEventListeners() {};

        PentominosCustomElement.prototype.attached = function attached() {
            this.addEventListeners();
        };

        return PentominosCustomElement;
    }()) || _class);
});
define('data/colors',[], function () {
    "use strict";

    $scope.colors = [{
        "name": "b",
        "color": "midnightblue"
    }, {
        "name": "c",
        "color": "darkviolet"
    }, {
        "name": "f",
        "color": "darkorange"
    }, {
        "name": "i",
        "color": "maroon"
    }, {
        "name": "l",
        "color": "darkgreen"
    }, {
        "name": "n",
        "color": "magenta"
    }, {
        "name": "t",
        "color": "limegreen"
    }, {
        "name": "v",
        "color": "deepskyblue"
    }, {
        "name": "w",
        "color": "teal"
    }, {
        "name": "x",
        "color": "red"
    }, {
        "name": "y",
        "color": "gold"
    }, {
        "name": "z",
        "color": "mediumblue"
    }, {
        "name": "o",
        "color": "darkslategray"
    }];
});
define('data/pentominos',[], function () {
    "use strict";

    $scope.pentominos = [{
        "name": "b",
        "type": 0,
        "faces": [[[1, 0], [1, 1], [0, 0], [2, 0], [0, 1]], [[1, 1], [1, 0], [0, 1], [0, 0], [1, 2]], [[1, 1], [1, 0], [0, 1], [2, 0], [2, 1]], [[0, 1], [0, 0], [1, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [0, 0], [2, 0], [2, 1]], [[1, 1], [1, 0], [0, 1], [0, 2], [1, 2]], [[1, 1], [1, 0], [0, 1], [0, 0], [2, 1]], [[0, 1], [0, 0], [1, 1], [0, 2], [1, 0]]],
        "dimensions": [3, 2],
        "parts": 5
    }, {
        "name": "c",
        "type": 2,
        "faces": [[[1, 0], [0, 1], [0, 0], [2, 0], [2, 1]], [[1, 1], [1, 0], [0, 0], [1, 2], [0, 2]], [[1, 1], [0, 0], [0, 1], [2, 1], [2, 0]], [[0, 1], [0, 0], [1, 0], [0, 2], [1, 2]]],
        "dimensions": [3, 2],
        "parts": 5
    }, {
        "name": "f",
        "type": 0,
        "faces": [[[1, 1], [1, 0], [0, 1], [2, 0], [1, 2]], [[1, 1], [1, 0], [0, 1], [2, 1], [2, 2]], [[1, 1], [1, 0], [2, 1], [0, 2], [1, 2]], [[1, 1], [1, 2], [0, 1], [0, 0], [2, 1]], [[1, 1], [1, 0], [2, 1], [0, 0], [1, 2]], [[1, 1], [1, 2], [0, 1], [2, 0], [2, 1]], [[1, 1], [1, 0], [0, 1], [1, 2], [2, 2]], [[1, 1], [1, 0], [0, 1], [2, 1], [0, 2]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "i",
        "type": 4,
        "faces": [[[2, 0], [0, 0], [1, 0], [3, 0], [4, 0]], [[0, 2], [0, 0], [0, 1], [0, 3], [0, 4]]],
        "dimensions": [5, 1],
        "parts": 5
    }, {
        "name": "l",
        "type": 0,
        "faces": [[[0, 0], [0, 1], [1, 0], [2, 0], [3, 0]], [[1, 0], [1, 1], [0, 0], [1, 2], [1, 3]], [[3, 1], [3, 0], [2, 1], [0, 1], [1, 1]], [[0, 3], [0, 2], [1, 3], [0, 0], [0, 1]], [[3, 0], [3, 1], [2, 0], [0, 0], [1, 0]], [[1, 3], [1, 2], [0, 3], [1, 0], [1, 1]], [[0, 1], [0, 0], [1, 1], [2, 1], [3, 1]], [[0, 0], [0, 1], [1, 0], [0, 2], [0, 3]]],
        "dimensions": [4, 2],
        "parts": 5
    }, {
        "name": "n",
        "type": 0,
        "faces": [[[2, 0], [2, 1], [1, 0], [0, 0], [3, 1]], [[1, 2], [1, 1], [0, 2], [1, 0], [0, 3]], [[1, 1], [1, 0], [2, 1], [0, 0], [3, 1]], [[0, 1], [0, 2], [1, 1], [1, 0], [0, 3]], [[1, 0], [1, 1], [2, 0], [0, 1], [3, 0]], [[1, 1], [1, 2], [0, 1], [0, 0], [1, 3]], [[2, 1], [2, 0], [1, 1], [0, 1], [3, 0]], [[0, 2], [0, 1], [1, 2], [0, 0], [1, 3]]],
        "dimensions": [4, 2],
        "parts": 5
    }, {
        "name": "t",
        "type": 2,
        "faces": [[[1, 0], [1, 1], [0, 0], [2, 0], [1, 2]], [[2, 1], [2, 0], [1, 1], [0, 1], [2, 2]], [[1, 2], [1, 1], [0, 2], [1, 0], [2, 2]], [[0, 1], [0, 0], [1, 1], [2, 1], [0, 2]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "v",
        "type": 1,
        "faces": [[[0, 2], [0, 1], [1, 2], [0, 0], [2, 2]], [[0, 0], [0, 1], [1, 0], [0, 2], [2, 0]], [[2, 0], [2, 1], [1, 0], [0, 0], [2, 2]], [[2, 2], [2, 1], [1, 2], [0, 2], [2, 0]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "w",
        "type": 1,
        "faces": [[[1, 1], [1, 2], [0, 1], [0, 0], [2, 2]], [[1, 1], [1, 0], [0, 1], [0, 2], [2, 0]], [[1, 1], [1, 0], [2, 1], [0, 0], [2, 2]], [[1, 1], [1, 2], [2, 1], [0, 2], [2, 0]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "x",
        "type": 5,
        "faces": [[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "y",
        "type": 0,
        "faces": [[[0, 1], [0, 0], [1, 1], [0, 2], [0, 3]], [[2, 0], [2, 1], [1, 0], [0, 0], [3, 0]], [[1, 2], [1, 1], [0, 2], [1, 0], [1, 3]], [[1, 1], [1, 0], [0, 1], [2, 1], [3, 1]], [[1, 1], [1, 0], [0, 1], [1, 2], [1, 3]], [[2, 1], [2, 0], [1, 1], [0, 1], [3, 1]], [[0, 2], [0, 1], [1, 2], [0, 0], [0, 3]], [[1, 0], [1, 1], [0, 0], [2, 0], [3, 0]]],
        "dimensions": [2, 4],
        "parts": 5
    }, {
        "name": "z",
        "type": 3,
        "faces": [[[1, 1], [2, 2], [0, 1], [2, 1], [0, 0]], [[1, 1], [1, 2], [0, 2], [1, 0], [2, 0]], [[1, 1], [0, 2], [0, 1], [2, 0], [2, 1]], [[1, 1], [1, 2], [0, 0], [1, 0], [2, 2]]],
        "dimensions": [3, 3],
        "parts": 5
    }, {
        "name": "o",
        "type": 5,
        "faces": [[[0, 0], [1, 0], [0, 1], [1, 1]]],
        "dimensions": [2, 2],
        "parts": 4
    }];
});
define('data/start-beam',[], function () {
  "use strict";

  [{
    "name": "b",
    "face": 4,
    "position": {
      "x": 7,
      "y": 0
    }
  }, {
    "name": "c",
    "face": 0,
    "position": {
      "x": 4,
      "y": 0
    }
  }, {
    "name": "f",
    "face": 2,
    "position": {
      "x": 3,
      "y": 3
    }
  }, {
    "name": "i",
    "face": 1,
    "position": {
      "x": 3,
      "y": 0
    }
  }, {
    "name": "l",
    "face": 1,
    "position": {
      "x": 9,
      "y": 4
    }
  }, {
    "name": "n",
    "face": 6,
    "position": {
      "x": 4,
      "y": 6
    }
  }, {
    "name": "t",
    "face": 1,
    "position": {
      "x": 6,
      "y": 4
    }
  }, {
    "name": "v",
    "face": 3,
    "position": {
      "x": 7,
      "y": 5
    }
  }, {
    "name": "w",
    "face": 0,
    "position": {
      "x": 7,
      "y": 1
    }
  }, {
    "name": "x",
    "face": 0,
    "position": {
      "x": 4,
      "y": 1
    }
  }, {
    "name": "y",
    "face": 2,
    "position": {
      "x": 9,
      "y": 0
    }
  }, {
    "name": "z",
    "face": 2,
    "position": {
      "x": 3,
      "y": 5
    }
  }, {
    "name": "o",
    "face": 0,
    "position": {
      "x": 6,
      "y": 99
    }
  }];
});
define('data/start-dozen',[], function () {
  "use strict";

  [{
    "name": "b",
    "face": 4,
    "position": {
      "x": 6,
      "y": 0
    }
  }, {
    "name": "c",
    "face": 0,
    "position": {
      "x": 3,
      "y": 0
    }
  }, {
    "name": "f",
    "face": 2,
    "position": {
      "x": 2,
      "y": 3
    }
  }, {
    "name": "i",
    "face": 1,
    "position": {
      "x": 2,
      "y": 0
    }
  }, {
    "name": "l",
    "face": 1,
    "position": {
      "x": 8,
      "y": 4
    }
  }, {
    "name": "n",
    "face": 6,
    "position": {
      "x": 3,
      "y": 6
    }
  }, {
    "name": "t",
    "face": 1,
    "position": {
      "x": 5,
      "y": 4
    }
  }, {
    "name": "v",
    "face": 3,
    "position": {
      "x": 6,
      "y": 5
    }
  }, {
    "name": "w",
    "face": 0,
    "position": {
      "x": 6,
      "y": 1
    }
  }, {
    "name": "x",
    "face": 0,
    "position": {
      "x": 3,
      "y": 1
    }
  }, {
    "name": "y",
    "face": 2,
    "position": {
      "x": 8,
      "y": 0
    }
  }, {
    "name": "z",
    "face": 2,
    "position": {
      "x": 2,
      "y": 5
    }
  }, {
    "name": "o",
    "face": 0,
    "position": {
      "x": 5,
      "y": 99
    }
  }];
});
define('data/start-rectangle',[], function () {
  "use strict";

  [{
    "name": "b",
    "face": 4,
    "position": {
      "x": 3,
      "y": 1
    }
  }, {
    "name": "c",
    "face": 0,
    "position": {
      "x": 0,
      "y": 1
    }
  }, {
    "name": "f",
    "face": 2,
    "position": {
      "x": -1,
      "y": 4
    }
  }, {
    "name": "i",
    "face": 1,
    "position": {
      "x": -1,
      "y": 1
    }
  }, {
    "name": "l",
    "face": 1,
    "position": {
      "x": 5,
      "y": 5
    }
  }, {
    "name": "n",
    "face": 6,
    "position": {
      "x": 0,
      "y": 7
    }
  }, {
    "name": "t",
    "face": 1,
    "position": {
      "x": 2,
      "y": 5
    }
  }, {
    "name": "v",
    "face": 3,
    "position": {
      "x": 3,
      "y": 6
    }
  }, {
    "name": "w",
    "face": 0,
    "position": {
      "x": 3,
      "y": 2
    }
  }, {
    "name": "x",
    "face": 0,
    "position": {
      "x": 0,
      "y": 2
    }
  }, {
    "name": "y",
    "face": 2,
    "position": {
      "x": 5,
      "y": 1
    }
  }, {
    "name": "z",
    "face": 2,
    "position": {
      "x": -1,
      "y": 6
    }
  }, {
    "name": "o",
    "face": 0,
    "position": {
      "x": 2,
      "y": 99
    }
  }];
});
define('data/start-square',[], function () {
    "use strict";

    $scope.squareStart = [{
        "name": "b",
        "face": 7,
        "position": {
            "x": 1,
            "y": 0
        }
    }, {
        "name": "c",
        "face": 2,
        "position": {
            "x": 4,
            "y": 5
        }
    }, {
        "name": "f",
        "face": 1,
        "position": {
            "x": 2,
            "y": 1
        }
    }, {
        "name": "i",
        "face": 0,
        "position": {
            "x": 1,
            "y": 9
        }
    }, {
        "name": "l",
        "face": 1,
        "position": {
            "x": 5,
            "y": 0
        }
    }, {
        "name": "n",
        "face": 4,
        "position": {
            "x": 2,
            "y": 7
        }
    }, {
        "name": "t",
        "face": 1,
        "position": {
            "x": 4,
            "y": 7
        }
    }, {
        "name": "v",
        "face": 2,
        "position": {
            "x": 1,
            "y": 3
        }
    }, {
        "name": "w",
        "face": 2,
        "position": {
            "x": 3,
            "y": 0
        }
    }, {
        "name": "x",
        "face": 0,
        "position": {
            "x": 4,
            "y": 3
        }
    }, {
        "name": "y",
        "face": 6,
        "position": {
            "x": 1,
            "y": 5
        }
    }, {
        "name": "z",
        "face": 3,
        "position": {
            "x": 1,
            "y": 4
        }
    }, {
        "name": "o",
        "face": 0,
        "position": {
            "x": 3,
            "y": 10
        }
    }];
});
define('data/start-stick',[], function () {
    "use strict";

    [{
        "name": "b",
        "face": 7,
        "position": {
            "x": 5,
            "y": 0
        }
    }, {
        "name": "c",
        "face": 2,
        "position": {
            "x": 8,
            "y": 5
        }
    }, {
        "name": "f",
        "face": 1,
        "position": {
            "x": 6,
            "y": 1
        }
    }, {
        "name": "i",
        "face": 0,
        "position": {
            "x": 5,
            "y": 9
        }
    }, {
        "name": "l",
        "face": 1,
        "position": {
            "x": 9,
            "y": 0
        }
    }, {
        "name": "n",
        "face": 4,
        "position": {
            "x": 6,
            "y": 7
        }
    }, {
        "name": "t",
        "face": 1,
        "position": {
            "x": 8,
            "y": 7
        }
    }, {
        "name": "v",
        "face": 2,
        "position": {
            "x": 5,
            "y": 3
        }
    }, {
        "name": "w",
        "face": 2,
        "position": {
            "x": 7,
            "y": 0
        }
    }, {
        "name": "x",
        "face": 0,
        "position": {
            "x": 8,
            "y": 3
        }
    }, {
        "name": "y",
        "face": 6,
        "position": {
            "x": 5,
            "y": 5
        }
    }, {
        "name": "z",
        "face": 3,
        "position": {
            "x": 5,
            "y": 4
        }
    }, {
        "name": "o",
        "face": 0,
        "position": {
            "x": 7,
            "y": 10
        }
    }];
});
define('data/start-twig',[], function () {
  "use strict";

  [{
    "name": "b",
    "face": 4,
    "position": {
      "x": 10,
      "y": 0
    }
  }, {
    "name": "c",
    "face": 0,
    "position": {
      "x": 7,
      "y": 0
    }
  }, {
    "name": "f",
    "face": 2,
    "position": {
      "x": 6,
      "y": 3
    }
  }, {
    "name": "i",
    "face": 1,
    "position": {
      "x": 6,
      "y": 0
    }
  }, {
    "name": "l",
    "face": 1,
    "position": {
      "x": 12,
      "y": 4
    }
  }, {
    "name": "n",
    "face": 6,
    "position": {
      "x": 7,
      "y": 6
    }
  }, {
    "name": "t",
    "face": 1,
    "position": {
      "x": 9,
      "y": 4
    }
  }, {
    "name": "v",
    "face": 3,
    "position": {
      "x": 10,
      "y": 5
    }
  }, {
    "name": "w",
    "face": 0,
    "position": {
      "x": 10,
      "y": 1
    }
  }, {
    "name": "x",
    "face": 0,
    "position": {
      "x": 7,
      "y": 1
    }
  }, {
    "name": "y",
    "face": 2,
    "position": {
      "x": 12,
      "y": 0
    }
  }, {
    "name": "z",
    "face": 2,
    "position": {
      "x": 6,
      "y": 5
    }
  }, {
    "name": "o",
    "face": 0,
    "position": {
      "x": 9,
      "y": 99
    }
  }];
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('services/data-service',['exports', 'aurelia-framework', 'aurelia-http-client'], function (exports, _aureliaFramework, _aureliaHttpClient) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DataService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var DataService = exports.DataService = function () {
        function DataService() {
            _classCallCheck(this, DataService);

            this.client = new _aureliaHttpClient.HttpClient();
        }

        DataService.prototype.getPentominos = function getPentominos() {
            var fileName = './src/data/pentominos.json';
            return this.client.get(fileName).then(function (data) {
                var response = JSON.parse(data.response);
                return response;
            });
        };

        DataService.prototype.getColors = function getColors() {
            var fileName = './src/data/colors.json';
            return this.client.get(fileName).then(function (data) {
                var response = JSON.parse(data.response);
                return response;
            });
        };

        DataService.prototype.getStartPosition = function getStartPosition(boardShape) {
            var fileName = './src/data/start-' + boardShape + '.json';
            return this.client.get(fileName).then(function (data) {
                var response = JSON.parse(data.response);
                return response;
            });
        };

        return DataService;
    }();
});
define('services/pentomino-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator', './data-service', './board-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _dataService, _boardService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PentominoService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var PentominoService = exports.PentominoService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _dataService.DataService, _boardService.BoardService), _dec(_class = function () {
        function PentominoService(eventAggregator, dataService, boardService) {
            var _this = this;

            _classCallCheck(this, PentominoService);

            this.ea = eventAggregator;
            this.ds = dataService;
            this.bs = boardService;
            this.pentominos = [];
            this.fields = [];
            this.currentPentomino = null;
            this.part = null;
            this.getPentominoData().then(function (response) {
                _this.pentominos = response;
            }).then(function () {
                _this.getPentominoColors();
            }).then(function () {
                _this.getStartPosition('square');
            }).then(function () {
                console.log(_this.pentominos);
            });
            this.setBoardFields();
        }

        PentominoService.prototype.isSolved = function isSolved() {
            var boardIsFull = this.boardIsFull();
            var solutionResult = void 0;
            if (boardIsFull) {
                solutionResult = this.isNewSolution();
                this.solved = boardIsFull;
                if (!isNaN(solutionResult)) {
                    $scope.currentSolution = solutionResult;
                    this.newSolution = false;
                } else {
                    $scope.saveSolution(solutionResult);
                    $scope.solutions[this.boardType].push(solutionResult);
                    this.newSolution = true;
                }
            } else {
                this.solved = false;
            }
        };

        PentominoService.prototype.boardIsFull = function boardIsFull() {
            var h = this.bs.getHeight();
            var w = this.bs.getWidth();
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    if (this.fields[y][x] !== 1) {
                        return false;
                    }
                }
            }
            return true;
        };

        PentominoService.prototype.setCurrentPentomino = function setCurrentPentomino(pentomino) {
            this.currentPentomino = pentomino;
        };

        PentominoService.prototype.resetCurrentPentomino = function resetCurrentPentomino() {
            this.currentPentomino = null;
            this.part = null;
        };

        PentominoService.prototype.setCurrentPart = function setCurrentPart(part) {
            this.part = part;
        };

        PentominoService.prototype.alignCurrentPentomino = function alignCurrentPentomino(newX, newY) {
            this.currentPentomino.position.x = newX;
            this.currentPentomino.position.y = newY;
        };

        PentominoService.prototype.registerPiece = function registerPiece(i, onOff) {
            var x = void 0,
                y = void 0;
            var pentomino = this.pentominos[i];

            if (pentomino && pentomino.faces) {
                for (var j = 0; j < pentomino.faces[pentomino.face].length; j++) {
                    x = pentomino.faces[pentomino.face][j][0] + pentomino.position.x;
                    y = pentomino.faces[pentomino.face][j][1] + pentomino.position.y;
                    if (this.bs.onBoard(x, y)) {
                        this.fields[y][x] += onOff;
                    }
                }
            }
        };

        PentominoService.prototype.setBoardFields = function setBoardFields() {
            var w = this.bs.getWidth();
            var h = this.bs.getHeight();
            this.fields = [];
            for (var y = 0; y < h; y++) {
                this.fields.push([]);
                for (var x = 0; x < w; x++) {
                    this.fields[y].push(0);
                }
            }
        };

        PentominoService.prototype.getPentominoData = function getPentominoData() {
            return this.ds.getPentominos().then(function (response) {
                return response;
            });
        };

        PentominoService.prototype.getPentominoColors = function getPentominoColors() {
            var _this2 = this;

            return this.ds.getColors().then(function (response) {
                for (var i = 0; i < _this2.pentominos.length; i++) {
                    _this2.pentominos[i].color = response[i].color;
                }
            });
        };

        PentominoService.prototype.getStartPosition = function getStartPosition(shape) {
            var _this3 = this;

            return this.ds.getStartPosition(shape).then(function (response) {
                for (var i = 0; i < _this3.pentominos.length; i++) {
                    var pentomino = _this3.pentominos[i];
                    pentomino.face = response[i].face;
                    pentomino.position = response[i].position;
                    pentomino.active = false;
                    pentomino.index = i;
                }
            });
        };

        PentominoService.prototype.addEventListeners = function addEventListeners() {};

        return PentominoService;
    }()) || _class);
});
define('components/header',['exports', 'aurelia-framework', '../services/board-service'], function (exports, _aureliaFramework, _boardService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.HeaderCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var HeaderCustomElement = exports.HeaderCustomElement = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService), _dec(_class = function () {
        function HeaderCustomElement(boardService) {
            _classCallCheck(this, HeaderCustomElement);

            this.bs = boardService;
            this.title = 'Pentomino';
        }

        HeaderCustomElement.prototype.getHeaderSizeCss = function getHeaderSizeCss() {
            var boardType = this.bs.boardTypes[this.bs.boardType];
            var css = {
                width: boardType.w * this.bs.partSize + 'px'
            };
            return css;
        };

        return HeaderCustomElement;
    }()) || _class);
});
define('services/drag-service',['exports', 'aurelia-framework', './setting-service', './pentomino-service'], function (exports, _aureliaFramework, _settingService, _pentominoService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DragService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var DragService = exports.DragService = (_dec = (0, _aureliaFramework.inject)(_settingService.SettingService, _pentominoService.PentominoService), _dec(_class = function () {
        function DragService(settingService, pentominoService) {
            _classCallCheck(this, DragService);

            this.ss = settingService;
            this.ps = pentominoService;
            this.dragStartPos = {};
            this.dragEndPos = {};
        }

        DragService.prototype.getClientPos = function getClientPos(event) {
            var clientX = event.touches ? event.touches[0].clientX : event.clientX;
            var clientY = event.touches ? event.touches[0].clientY : event.clientY;
            return {
                x: clientX / this.ss.scale,
                y: clientY / this.ss.scale
            };
        };

        DragService.prototype.startDrag = function startDrag(pentomino, part, event) {
            var clientPos = this.getClientPos(event);
            this.ps.setCurrentPentomino(pentomino);
            this.ps.setCurrentPart(part);
            this.ps.registerPiece(pentomino.index, -1);
            this.container = event.target.offsetParent.offsetParent;
            this.container.style.zIndex = 100;
            this.startX = clientPos.x - this.container.offsetLeft;
            this.startY = clientPos.y - this.container.offsetTop;
            this.x = clientPos.x - this.startX;
            this.y = clientPos.y - this.startY;
            this.dragStartPos.x = this.x;
            this.dragStartPos.y = this.y;

            return false;
        };

        DragService.prototype.doDrag = function doDrag(event) {
            var clientPos = this.getClientPos(event);
            if (this.ps.currentPentomino) {
                this.x = clientPos.x - this.startX;
                this.y = clientPos.y - this.startY;
                this.container.style.left = this.x + 'px';
                this.container.style.top = this.y + 'px';
            }
        };

        DragService.prototype.stopDrag = function stopDrag(event) {
            this.dragEndPos.x = this.x;
            this.dragEndPos.y = this.y;
            if (this.ps.currentPentomino) {
                this.alignToGrid();
                if (!this.isDragged()) {
                    if (this.ps.currentPentomino.type < 4 && this.part < 3 || this.ps.currentPentomino.type == 4 && this.part < 1) {
                        this.adjustPosition();
                        this.flipRotate($scope.currentPentomino, this.part);
                    }
                }
                this.ps.registerPiece(this.ps.currentPentomino.index, 1);
                this.ps.isSolved();
            }
            this.resetVars();
        };

        DragService.prototype.resetVars = function resetVars() {
            if (this.container) {
                this.container.style.zIndex = '';
                this.container = null;
            }
            this.ps.resetCurrentPentomino();
        };

        DragService.prototype.alignToGrid = function alignToGrid() {
            var newX = Math.round(this.x / this.ss.partSize);
            var newY = Math.round(this.y / this.ss.partSize);
            this.ps.alignCurrentPentomino(newX, newY);
            this.container.style.left = newX * this.ss.partSize + 'px';
            this.container.style.top = newY * this.ss.partSize + 'px';
        };

        DragService.prototype.isDragged = function isDragged() {
            return Math.abs(this.dragEndPos.x - this.dragStartPos.x) > 19 || Math.abs(this.dragEndPos.y - this.dragStartPos.y) > 19;
        };

        return DragService;
    }()) || _class);
});
define('services/board-service',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BoardService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var BoardService = exports.BoardService = function () {
        function BoardService() {
            _classCallCheck(this, BoardService);

            this.partSize = 40;
            this.boardType = 'square';
            this.boardTypes = {
                'square': {
                    w: 8,
                    h: 8,
                    surface: 64
                },
                'rectangle': {
                    w: 6,
                    h: 10,
                    surface: 60
                },
                'dozen': {
                    w: 12,
                    h: 5,
                    surface: 60
                },
                'beam': {
                    w: 15,
                    h: 4,
                    surface: 60
                },
                'stick': {
                    w: 16,
                    h: 4,
                    surface: 64
                },
                'twig': {
                    w: 20,
                    h: 3,
                    surface: 60
                }
            };
        }

        BoardService.prototype.getWidth = function getWidth() {
            return this.boardTypes[this.boardType].w;
        };

        BoardService.prototype.getHeight = function getHeight() {
            return this.boardTypes[this.boardType].h;
        };

        BoardService.prototype.onBoard = function onBoard(x, y) {
            return x >= 0 && x < this.getWidth() && y >= 0 && y < this.getHeight();
        };

        return BoardService;
    }();
});
define('services/settings-service',["exports", "aurelia-framework"], function (exports, _aureliaFramework) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SettingsService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var SettingsService = exports.SettingsService = function () {
        function SettingsService() {
            _classCallCheck(this, SettingsService);

            this.opaqueBlocks = true;
            this.solutionsShown = false;
            this.scale = 1;
        }

        SettingsService.prototype.getScale = function getScale() {
            var screenWidth = document.querySelectorAll("html")[0].clientWidth;
            var boardWidth = document.querySelectorAll(".board")[0].clientWidth;
            var scale = Math.min(screenWidth / boardWidth, 1);
            scale = Math.floor(scale * 10) / 10;
            this.scale = scale;
            return {
                'transformOrigin': 'top',
                '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
                '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
                'transform': 'scale(' + scale + ', ' + scale + ')'
            };
        };

        return SettingsService;
    }();
});
define('services/setting-service',["exports", "aurelia-framework"], function (exports, _aureliaFramework) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SettingService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var SettingService = exports.SettingService = function () {
        function SettingService() {
            _classCallCheck(this, SettingService);

            this.opaqueBlocks = true;
            this.solutionsShown = false;
            this.scale = 1;
            this.partSize = 40;
        }

        SettingService.prototype.getScale = function getScale() {
            var screenWidth = document.querySelectorAll("html")[0].clientWidth;
            var boardWidth = document.querySelectorAll(".board")[0].clientWidth;
            var scale = Math.min(screenWidth / boardWidth, 1);
            scale = Math.floor(scale * 10) / 10;
            this.scale = scale;
            return {
                'transformOrigin': 'top',
                '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
                '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
                'transform': 'scale(' + scale + ', ' + scale + ')'
            };
        };

        return SettingService;
    }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/header\"></require>\n    <require from=\"components/board\"></require>\n    <require from=\"components/footer.html\"></require>\n    <div class=\"dragArea\"\n         mousemove.delegate=\"ds.doDrag($event)\"\n         touchmove.delegate=\"ds.doDrag($event)\"\n         mouseup.delegate=\"ds.stopDrag($event)\"\n         touchend.delegate=\"ds.stopDrag($event)\">\n        <header></header>\n        <board></board>\n        <footer></footer>\n    </div>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = ".dragArea, body, html {\n    width                : 100%;\n    height               : 100%;\n    background-color     : #222;\n    font-family          : TrebuchetMS, sans-serif;\n    color                : #fff;\n    -webkit-touch-callout: none;\n    -webkit-user-select  : none;\n    -khtml-user-select   : none;\n    -moz-user-select     : none;\n    -ms-user-select      : none;\n    user-select          : none;\n}\n\n.dragArea {\n    flex           : 1 0 auto;\n    display        : flex;\n    flex-direction : column;\n    justify-content: flex-start;\n    align-items    : center;\n}\n@media (min-height: 700px) {\n    .dragArea {\n        justify-content: center;\n    }\n}\n\n.r {\n    float: right;\n}\n\n.l {\n    float: left;\n}\n\n.relContainer {\n    position: relative;\n}\n\n.rounded {\n    border-radius: 100px;\n}\n\n.clearFix {\n    clear: both;\n}\n\n.hidden {\n    display: none;\n}\n\n.invisible {\n    visibility: hidden;\n}\n\n.pushTop {\n    margin-top: 12px;\n}\n\n.pushLeft {\n    margin-left: 12px;\n}\n\n.pushBottom {\n    margin-bottom: 12px;\n}\n\n.pushBottomMore {\n    margin-bottom: 24px;\n}\n\n.textAlignLeft {\n    text-align: left;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template class=\"board\"\n          css.bind=\"getBoardSizeCSS()\">\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/pentominos\"></require>\n    <require from=\"components/controls\"></require>\n    <pentominos></pentominos>\n    <controls></controls>\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n"; });
define('text!components/controls.html', ['module'], function(module) { module.exports = "<template>\n    <!-- <button class=\"small r\"\n            title=\"Show next solution\"\n            if.bind=\"settings.solutionsShown\"\n            disabled.bind=\"(currentSolution == solutions[board.boardType].length - 1)\"\n            click.delegate=\"showNextSolution(board.boardType)\"\n            touchstart.delegate=\"showNextSolution(board.boardType)\">\n            <icon class=\"fa fa-step-forward fa-lg\"></icon>\n        </button>\n    <button class=\"small l\"\n            title=\"Show previous solution\"\n            if.bind=\"settings.solutionsShown\"\n            disabled.bind=\"(currentSolution == 0)\"\n            click.delegate=\"showPreviousSolution(board.boardType)\"\n            touchstart.delegate=\"showPreviousSolution(board.boardType)\">\n            <icon class=\"fa fa-step-backward fa-lg\"></icon>\n        </button>\n    <button class=\"rounded\"\n            if.bind=\"!settings.solutionsShown\"\n            ng-class=\"{'solved' : (board.solved && !board.newSolution)}\"\n            click.delegate=\"showSolution()\"\n            touchstart.delegate=\"showSolution()\">Show solution\n            {{currentSolution + 1}} / {{solutions[board.boardType].length}}\n        </button>\n    <span class=\"rounded\"\n          if.bind=\"settings.solutionsShown\"\n          ng-class=\"{'solved' : (board.solved && !board.newSolution)}\">\n            Solution {{currentSolution + 1}} / {{solutions[board.boardType].length}}\n        </span> -->\n\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = ".board {\n    position        : relative;\n    /*margin: 40px auto;*/\n    background-color: lightgray;\n    border          : 5px solid darkgray;\n}\n\n.board.solved, .solved {\n    border-color      : lime;\n    -webkit-box-shadow: 0 0 30px 0 rgba(0, 255, 0, .5);\n    box-shadow        : 0 0 30px 0 rgba(0, 255, 0, .5);\n}\n"; });
define('text!components/footer.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/footer.css\"></require>\n    <a href=\"http://www.ashware.nl\"\n       target=\"_blank\"\n       class=\"r\">&copy;&nbsp;ashWare</a>\n    <!-- <span class='st_sharethis' displayText='ShareThis'></span> -->\n</template>"; });
define('text!components/controls.css', ['module'], function(module) { module.exports = "#controls {\n    margin-top: 5px;\n    text-align: center;\n}\n\n#controls button, #controls span {\n    display         : inline-block;\n    height          : 30px;\n    line-height     : 30px;\n    font-family     : inherit;\n    background-color: transparent;\n    border          : none;\n    outline         : none;\n    text-align      : center;\n    color           : white;\n    font-size       : 14px;\n    margin-top      : 10px;\n    padding         : 0 10px;\n}\n\n#controls span.solved {\n    border: 1px dotted lime;\n}\n\n#controls button {\n    cursor: pointer;\n}\n\n#controls button.small {\n    width      : 40px;\n    height     : 40px;\n    line-height: 40px;\n    margin-top : 5px;\n}\n\n#controls button+icon {\n    margin     : 0 10px;\n    line-height: 30px;\n}\n\n#controls button[disabled='disabled'] {\n    visibility: hidden;\n}\n"; });
define('text!components/menu.html', ['module'], function(module) { module.exports = "<template class=\"hamburger\">\n    <require from=\"components/menu.css\"></require>\n    <i class=\"fa fa-bars\"\n       click.delegate=\"showTheMenu()\"\n       touchstart.delegate=\"showTheMenu()\"></i>\n\n    <!-- <ul id=\"menu\"\n        if.bind=\"settings.menuVisible\">\n\n        <li click.delegate=\"hideTheMenu()\"\n            touchstart.delegate=\"hideTheMenu()\">\n            <i class=\"fa fa-times\"></i></li>\n\n        <li if.bind=\"solutions['square'].length > 1\"\n            mouseenter.delegate=\"toggleSubmenuBoards()\"\n            mouseleave.delegate=\"toggleSubmenuBoards()\"\n            touchend.delegate=\"toggleSubmenuBoards()\">\n            Board sizes&nbsp;&nbsp;\n            <i class=\"fa fa-angle-right\"></i>\n            <ul if.bind=\"settings.submenuBoardsVisible\"\n                class=\"subMenu\">\n                <li repeat.for=\"(key, val) in board.boardTypes track by $index\"\n                    if.bind=\"showThisBoard(key)\"\n                    class.bind=\"{'active' : board.boardType == key}\"\n                    click.delegate=\"getStartPosition(key)\"\n                    touchstart.delegate=\"getStartPosition(key)\">{{val.w}}&nbsp;&times;&nbsp;{{val.h}}</li>\n            </ul>\n        </li>\n\n        <li click.delegate=\"setOpaqueBlocks()\"\n            if.bind=\"settings.opaqueBlocks == false\"\n            touchstart.delegate=\"setOpaqueBlocks()\">Opaque</li>\n\n        <li click.delegate=\"setTransparentBlocks()\"\n            if.bind=\"settings.opaqueBlocks == true\"\n            touchstart.delegate=\"setTransparentBlocks()\">Transparent</li>\n\n        <li click.delegate=\"methods.rotateBoard()\"\n            touchstart.delegate=\"methods.rotateBoard()\">Rotate&nbsp;Blocks</li>\n\n        <li click.delegate=\"methods.flipBoardYAxis()\"\n            touchstart.delegate=\"methods.flipBoardYAxis()\">Flip Blocks</li>\n\n        <li if.bind=\"screenIsLargeEnough()\"\n            click.delegate=\"methods.mixBoard()\"\n            touchstart.delegate=\"methods.mixBoard()\">Shuffle</li>\n\n        <li if.bind=\"solutions[board.boardType].length > 20\"\n            click.delegate=\"board.autoSolve()\"\n            touchstart.delegate=\"board.autoSolve()\">Spoiler</li>\n    </ul> -->\n\n</template>"; });
define('text!components/footer.css', ['module'], function(module) { module.exports = "footer {\n    display   : block;\n    width     : 100%;\n    position  : absolute;\n    padding   : 0 10px;\n    bottom    : 10px;\n    box-sizing: border-box;\n}\n\nfooter span {\n    color: #fff !important;\n}\n\nfooter a {\n    color          : #f2f2f2;\n    text-decoration: none;\n    font-size      : 12px;\n}\n"; });
define('text!components/pentominos.html', ['module'], function(module) { module.exports = "<template class=\"relContainer\">\n    <require from=\"components/pentominos.css\"></require>\n    <div repeat.for=\"pentomino of ps.pentominos\"\n         class.bind=\"getPentominoClasses(pentomino)\"\n         css.bind=\"getPentominoCSS(pentomino.position, pentomino.color)\">\n        <div class=\"relContainer inheritBgColor\">\n            <div repeat.for=\"part of pentomino.faces[pentomino.face]\"\n                 class.bind=\"getPartClasses(pentomino, $index)\"\n                 css.bind=\"getPartCSS(part)\"\n                 mousedown.delegate=\"ds.startDrag(pentomino, $index, $event)\"\n                 touchstart.delegate=\"ds.startDrag(pentomino, $index, $event)\">\n            </div>\n        </div>\n    </div>\n</template>"; });
define('text!components/menu.css', ['module'], function(module) { module.exports = ".hamburger {\n    position: absolute;\n    left    : 2px;\n    top     : 2px;\n    z-index : 100;\n}\n\n.hamburger .fa-bars {\n    height     : 40px;\n    line-height: 40px;\n    padding    : 0 10px;\n    margin-top : -1px;\n    cursor     : pointer;\n}\n\nmenu ul#menu {\n    position: absolute;\n    left    : -5px;\n    top     : 0;\n}\n\nmenu ul {\n    background-color: rgba(34, 34, 34, .7);\n    border          : 1px solid rgba(34, 34, 34, .7);\n}\n\nmenu ul li {\n    position        : relative;\n    font-size       : 14px;\n    color           : #333;\n    background-color: ghostwhite;\n    line-height     : 20px;\n    padding         : 10px 20px 10px 15px;\n    margin          : 1px;\n    cursor          : pointer;\n}\n\nmenu ul li:hover {\n    background-color: gainsboro;\n}\n\nmenu ul li.active {\n    background-color: silver;\n}\n\nmenu ul.subMenu {\n    position: absolute;\n    left    : 99%;\n    top     : -2px;\n    z-index : 1;\n}\n"; });
define('text!components/pentominos.css', ['module'], function(module) { module.exports = ".pentomino {\n    position      : absolute;\n    left          : 0;\n    top           : 0;\n    pointer-events: none;\n}\n\n.inheritBgColor {\n    background-color: inherit;\n}\n\n.part {\n    position          : absolute;\n    left              : 0;\n    top               : 0;\n    width             : 40px;\n    height            : 40px;\n    text-align        : center;\n    color             : white;\n    background-color  : inherit;\n    border            : 1px solid rgba(211, 211, 211, .2);\n    -webkit-box-sizing: border-box;\n    box-sizing        : border-box;\n    pointer-events    : auto;\n    cursor            : move;\n    cursor            : -webkit-grab;\n    cursor            : grab;\n}\n\n.part > span {\n    line-height: 40px;\n}\n\n.part:active {\n    cursor: -webkit-grabbing;\n    cursor: grabbing;\n}\n\n.part::before {\n    line-height: 38px;\n    opacity    : .2;\n    /*display: none;*/\n}\n\n.block_n .part::before, .block_y .part::before {\n    opacity: .4;\n}\n\n.block_t .part::before, .block_v .part::before {\n    opacity: .3;\n}\n\n.pentomino.active .part::before, .pentomino:hover .part::before {\n    opacity: 1;\n    /*display: inline;*/\n}\n\n.pentomino.transparent .part {\n    opacity: .7;\n}\n"; });
define('text!components/header.html', ['module'], function(module) { module.exports = "<template css.bind=\"getHeaderSizeCss()\">\n    <require from=\"components/header.css\"></require>\n    <require from=\"components/menu\"></require>\n    <menu></menu>\n    <h1>${title}</h1>\n</template>"; });
define('text!components/header.css', ['module'], function(module) { module.exports = "header {\n    position: relative;\n    height  : 40px;\n}\n\nh1 {\n    font-family   : inherit;\n    font-size     : 21px;\n    letter-spacing: 1px;\n    text-align    : center;\n    line-height   : 0;\n    margin        : 20px 0 -20px;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map