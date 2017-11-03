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

        BoardCustomElement.prototype.getBoardSizeCSS = function getBoardSizeCSS(shape) {
            var boardType = this.bs.boardTypes[shape];
            var css = {
                width: boardType.w * this.bs.partSize + 'px',
                height: boardType.h * this.bs.partSize + 'px'
            };
            return css;
        };

        BoardCustomElement.prototype.getBoardClasses = function getBoardClasses(newSolution) {
            var classes = ['board'];
            var solvedClass = newSolution ? 'solved' : '';
            classes.push(solvedClass);
            return classes.join(' ');
        };

        return BoardCustomElement;
    }()) || _class);
});
define('components/controls',['exports', 'aurelia-framework', '../services/board-service', '../services/setting-service', '../services/pentomino-service', '../services/solution-service'], function (exports, _aureliaFramework, _boardService, _settingService, _pentominoService, _solutionService) {
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

    var ControlsCustomElement = exports.ControlsCustomElement = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService, _settingService.SettingService, _pentominoService.PentominoService, _solutionService.SolutionService), _dec(_class = function () {
        function ControlsCustomElement(boardService, settingService, pentominoService, solutionService) {
            _classCallCheck(this, ControlsCustomElement);

            this.bs = boardService;
            this.ss = settingService;
            this.ps = pentominoService;
            this.sls = solutionService;
            this.pentominoCount = this.bs.pentominosLength();
            this.solutionCount = this.sls.solutions[this.sls.boardType].length;
        }

        ControlsCustomElement.prototype.getIndicatorClass = function getIndicatorClass() {
            var classes = ['indicator', 'rounded'];
            var solvedClass = this.bs.solved && !this.bs.newSolution ? 'solved' : '';
            classes.push(solvedClass);
            return classes.join(' ');
        };

        ControlsCustomElement.prototype.getIndicatorText = function getIndicatorText(currentSolution, solutionCount) {
            var current = currentSolution >= 0 ? 'Solution&nbsp;&nbsp;' + (currentSolution + 1) + ' / ' : 'Solutions: ';
            var text = current + solutionCount;
            return text;
        };

        ControlsCustomElement.prototype.showSolutions = function showSolutions(count) {
            return count > 0;
        };

        ControlsCustomElement.prototype.showSolution = function showSolution() {
            var pentominos = this.ps.pentominos;
            var solutionString = this.sls.solutions[this.bs.boardType][this.sls.currentSolution];
            var splitString = solutionString.substr(1).split('#');
            for (var i = 0; i < splitString.length; i++) {
                var pentomino = this.ps.pentominos[i];
                var props = splitString[i].split('_');
                pentomino.face = parseInt(props[1], 10);
                pentomino.position.x = parseInt(props[2], 10);
                pentomino.position.y = parseInt(props[3], 10);
            }
            this.ps.registerPieces();
            this.bs.unsetNewSolution();
        };

        ControlsCustomElement.prototype.showButton = function showButton() {
            return this.solutionCount > 0;
        };

        ControlsCustomElement.prototype.disableNextButton = function disableNextButton(current, count) {
            return current + 1 == count;
        };

        ControlsCustomElement.prototype.disablePreviousButton = function disablePreviousButton(current) {
            return current == 0;
        };

        ControlsCustomElement.prototype.showFirstSolution = function showFirstSolution() {
            this.sls.currentSolution = 0;
            this.showSolution();
        };

        ControlsCustomElement.prototype.showPreviousSolution = function showPreviousSolution() {
            if (this.sls.currentSolution > 0) {
                this.sls.currentSolution--;
                this.showSolution();
            }
        };

        ControlsCustomElement.prototype.showNextSolution = function showNextSolution() {
            if (!this.disableNextButton(this.sls.currentSolution, this.sls.solutions[this.bs.boardType].length)) {
                this.sls.currentSolution++;
                this.showSolution();
            }
        };

        return ControlsCustomElement;
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

        HeaderCustomElement.prototype.getHeaderSizeCss = function getHeaderSizeCss(shape) {
            var boardType = this.bs.boardTypes[shape];
            var css = {
                width: boardType.w * this.bs.partSize + 'px'
            };
            return css;
        };

        return HeaderCustomElement;
    }()) || _class);
});
define('components/menu',['exports', 'aurelia-framework', '../services/board-service', '../services/solution-service', '../services/pentomino-service', '../services/permutation-service'], function (exports, _aureliaFramework, _boardService, _solutionService, _pentominoService, _permutationService) {
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

    var MenuCustomElement = exports.MenuCustomElement = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService, _solutionService.SolutionService, _pentominoService.PentominoService, _permutationService.PermutationService), _dec(_class = function () {
        function MenuCustomElement(boardService, solutionService, pentominoService, permutationService) {
            _classCallCheck(this, MenuCustomElement);

            this.bs = boardService;
            this.sls = solutionService;
            this.ps = pentominoService;
            this.prms = permutationService;
            this.boardTypes = Object.keys(this.bs.boardTypes);
            this.settings = {
                menuVisible: false,
                submenuBoardsVisible: false
            };
        }

        MenuCustomElement.prototype.rotateBoard = function rotateBoard() {
            this.prms.rotateBoard(this.ps.pentominos);
            this.ps.registerPieces();
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.flipBoardYAxis = function flipBoardYAxis() {
            this.prms.flipBoardYAxis(this.ps.pentominos);
            this.ps.registerPieces();
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.showTheMenu = function showTheMenu() {
            this.settings.menuVisible = true;
            this.settings.submenuBoardsVisible = false;
        };

        MenuCustomElement.prototype.mixBoard = function mixBoard() {
            this.prms.mixBoard(this.ps.pentominos);
            this.ps.registerPieces();
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.hideTheMenu = function hideTheMenu() {
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.showThisBoard = function showThisBoard(key) {
            var threshold = 3;
            if (this.sls.solutions) {
                switch (key) {
                    case 'square':
                        return true;
                    case 'rectangle':
                        return this.sls.solutions['square'].length > threshold;
                    case 'beam':
                        return this.sls.solutions['rectangle'].length > threshold;
                    case 'stick':
                        return this.sls.solutions['beam'].length > threshold;
                    case 'twig':
                        return this.sls.solutions['stick'].length > threshold;
                    default:
                        return false;
                }
            }
            return true;
        };

        MenuCustomElement.prototype.toggleSubmenuBoards = function toggleSubmenuBoards() {
            this.settings.submenuBoardsVisible = !this.settings.submenuBoardsVisible;
            return false;
        };

        MenuCustomElement.prototype.getBoardDimensions = function getBoardDimensions(boardType) {
            var text = '' + this.bs.boardTypes[boardType].w + '&nbsp;&times;&nbsp;' + this.bs.boardTypes[boardType].h;
            return text;
        };

        MenuCustomElement.prototype.getActiveBoardClass = function getActiveBoardClass(boardType) {
            return this.bs.boardType == boardType ? 'active' : '';
        };

        MenuCustomElement.prototype.screenIsLargeEnough = function screenIsLargeEnough() {
            var clw = document.querySelectorAll('html')[0].clientWidth;
            var clh = document.querySelectorAll('html')[0].clientHeight;
            return clw + clh > 1100;
        };

        MenuCustomElement.prototype.getStartPosition = function getStartPosition(shape) {
            this.ps.getStartPosition(shape);
            this.ps.registerPieces();
            this.bs.unsetSolved();
            this.bs.unsetNewSolution();
            this.settings.submenuBoardsVisible = false;
            this.settings.menuVisible = false;
        };

        return MenuCustomElement;
    }()) || _class);
});
define('components/pentominos',['exports', 'aurelia-framework', '../services/pentomino-service', '../services/setting-service', '../services/drag-service'], function (exports, _aureliaFramework, _pentominoService, _settingService, _dragService) {
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

    var PentominosCustomElement = exports.PentominosCustomElement = (_dec = (0, _aureliaFramework.inject)(_pentominoService.PentominoService, _settingService.SettingService, _dragService.DragService), _dec(_class = function () {
        function PentominosCustomElement(pentominoService, settingService, dragService) {
            _classCallCheck(this, PentominosCustomElement);

            this.ps = pentominoService;
            this.ss = settingService;
            this.ds = dragService;
        }

        PentominosCustomElement.prototype.getPentominoCSS = function getPentominoCSS(x, y, color) {
            var css = {
                left: x * this.ss.partSize + 'px',
                top: y * this.ss.partSize + 'px',
                backgroundColor: color
            };
            return css;
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

        PentominosCustomElement.prototype.getPartClasses = function getPartClasses(pentomino, partIndex, face) {
            var classes = ['fa', 'part'];

            var flipH = !(pentomino.index === 1 && pentomino.dimensions[0] > pentomino.dimensions[1] || pentomino.index === 6 && pentomino.face % 2 === 0);
            var flipV = !(pentomino.index === 1 && pentomino.dimensions[0] < pentomino.dimensions[1] || pentomino.index === 6 && pentomino.face % 2 === 1);
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

        return PentominosCustomElement;
    }()) || _class);
});
define('data/colors',[], function () {
    "use strict";

    colors = [{
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

    pentominos = [{
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

    squareStart = [{
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
            this.solved = false;
            this.newSolution = false;
        }

        BoardService.prototype.setSolved = function setSolved() {
            this.solved = true;
        };

        BoardService.prototype.unsetSolved = function unsetSolved() {
            this.solved = false;
        };

        BoardService.prototype.setNewSolution = function setNewSolution() {
            this.newSolution = true;
        };

        BoardService.prototype.unsetNewSolution = function unsetNewSolution() {
            this.newSolution = false;
        };

        BoardService.prototype.setBoardType = function setBoardType(shape) {
            this.boardType = shape;
        };

        BoardService.prototype.getWidth = function getWidth() {
            return this.boardTypes[this.boardType].w;
        };

        BoardService.prototype.getHeight = function getHeight() {
            return this.boardTypes[this.boardType].h;
        };

        BoardService.prototype.pentominosLength = function pentominosLength() {
            var blockCount = this.boardType == 'square' ? 13 : 12;
            return blockCount;
        };

        BoardService.prototype.boardsCount = function boardsCount() {
            var count = 0;
            for (var k in this.boardTypes) {
                if (this.boardTypes.hasOwnProperty(k)) count++;
            }return count;
        };

        BoardService.prototype.onBoard = function onBoard(x, y) {
            return x >= 0 && x < this.getWidth() && y >= 0 && y < this.getHeight();
        };

        BoardService.prototype.touchesBoard = function touchesBoard(pentomino) {
            var isTouching = false;
            for (var i = 0; i < pentomino.faces[pentomino.face].length; i++) {
                var part = pentomino.faces[pentomino.face][i];
                var x = pentomino.position.x + part[0];
                var y = pentomino.position.y + part[1];
                if (x >= 0 && x <= this.getWidth() && y >= 0 && y <= this.getHeight()) {
                    isTouching = true;
                    break;
                }
            }
            return isTouching;
        };

        return BoardService;
    }();
});
define('services/data-service',['exports', 'aurelia-framework', 'aurelia-http-client', './board-service'], function (exports, _aureliaFramework, _aureliaHttpClient, _boardService) {
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

    var _dec, _class;

    var DataService = exports.DataService = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService), _dec(_class = function () {
        function DataService(boardService) {
            _classCallCheck(this, DataService);

            this.bs = boardService;
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

        DataService.prototype.getSolutions = function getSolutions() {
            var convert = function convert(solutions) {
                var convertedSolutions = {};
                for (var boardType in solutions) {
                    if (solutions.hasOwnProperty(boardType)) {
                        if (solutions[boardType].length) {
                            for (var i = 0; i < solutions[boardType].length; i++) {
                                solutions[boardType][i] = solutions[boardType][i].split('#');
                                solutions[boardType][i].shift();
                                for (var j = 0; j < solutions[boardType][i].length; j++) {
                                    solutions[boardType][i][j] = solutions[boardType][i][j].split('');
                                    solutions[boardType][i][j] = solutions[boardType][i][j].join('_');
                                }
                                solutions[boardType][i] = '#' + solutions[boardType][i].join('#');
                            }
                        }
                    }
                    convertedSolutions[boardType] = solutions[boardType];
                }
                return convertedSolutions;
            };

            var solutions = void 0;

            if (localStorage.getItem("pentominos2")) {
                solutions = JSON.parse(localStorage.getItem("pentominos2"));
            } else {
                if (localStorage.getItem("pentominos")) {
                    solutions = JSON.parse(localStorage.getItem("pentominos"));
                    solutions = convert(solutions);
                    localStorage.setItem("pentominos2", JSON.stringify(solutions));
                    localStorage.removeItem("pentominos");
                } else {
                    solutions = {};
                    var boardTypes = this.bs.boardTypes;
                    for (var type in boardTypes) {
                        if (boardTypes.hasOwnProperty(type)) {
                            solutions[type] = [];
                        }
                    }
                }
            }
            return solutions;
        };

        DataService.prototype.saveSolution = function saveSolution(solutionString) {
            var solutions = this.getSolutions(this.bs.boardTypes);
            solutions[this.bs.boardType].push(solutionString);
            localStorage.setItem("pentominos2", JSON.stringify(solutions));
        };

        return DataService;
    }()) || _class);
});
define('services/drag-service',['exports', 'aurelia-framework', './setting-service', './pentomino-service', './permutation-service'], function (exports, _aureliaFramework, _settingService, _pentominoService, _permutationService) {
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

    var DragService = exports.DragService = (_dec = (0, _aureliaFramework.inject)(_settingService.SettingService, _pentominoService.PentominoService, _permutationService.PermutationService), _dec(_class = function () {
        function DragService(settingService, pentominoService, permutationService) {
            _classCallCheck(this, DragService);

            this.ss = settingService;
            this.ps = pentominoService;
            this.prms = permutationService;
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

        DragService.prototype.startDrag = function startDrag(pentomino, partIndex, event) {
            if (this.container == null) {
                var clientPos = this.getClientPos(event);
                this.ps.setCurrentPentomino(pentomino, partIndex);
                this.ps.registerPiece(pentomino, -1);
                this.container = event.target.offsetParent.offsetParent;
                this.container.style.zIndex = 100;
                this.startX = clientPos.x - this.container.offsetLeft;
                this.startY = clientPos.y - this.container.offsetTop;
                this.x = clientPos.x - this.startX;
                this.y = clientPos.y - this.startY;
                this.dragStartPos.x = this.x;
                this.dragStartPos.y = this.y;
            }
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
                    if (this.ps.currentPentomino.type < 4 && this.ps.currentPentomino.activePart < 3 || this.ps.currentPentomino.type == 4 && this.ps.currentPentomino.activePart < 1) {
                        this.ps.adjustPosition();
                        this.prms.flipRotate(this.ps.currentPentomino);
                    }
                }
                this.ps.registerPiece(this.ps.currentPentomino, 1);
                this.ps.isSolved();
            }

            this.releasePentomino();
        };

        DragService.prototype.releasePentomino = function releasePentomino() {
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
define('services/pentomino-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator', './data-service', './board-service', './solution-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _dataService, _boardService, _solutionService) {
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

    var PentominoService = exports.PentominoService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _dataService.DataService, _boardService.BoardService, _solutionService.SolutionService), _dec(_class = function () {
        function PentominoService(eventAggregator, dataService, boardService, solutionService) {
            _classCallCheck(this, PentominoService);

            this.ea = eventAggregator;
            this.ds = dataService;
            this.bs = boardService;
            this.sls = solutionService;
            this.pentominos = [];
            this.fields = [];
            this.currentPentomino = null;
            this.start();
        }

        PentominoService.prototype.pentominoCount = function pentominoCount() {
            return this.pentominos.length;
        };

        PentominoService.prototype.isSolved = function isSolved() {
            var boardIsFull = this.boardIsFull();
            if (boardIsFull) {
                this.bs.setSolved();
                this.sls.saveSolution(this.pentominos);
            } else {
                this.bs.unsetNewSolution();
                this.bs.unsetSolved();
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

        PentominoService.prototype.setCurrentPentomino = function setCurrentPentomino(pentomino, index) {
            this.currentPentomino = pentomino;
            this.currentPentomino.activePart = index;
        };

        PentominoService.prototype.resetCurrentPentomino = function resetCurrentPentomino() {
            if (this.currentPentomino) {
                this.currentPentomino.activePart = null;
                this.currentPentomino = null;
            }
        };

        PentominoService.prototype.alignCurrentPentomino = function alignCurrentPentomino(newX, newY) {
            this.currentPentomino.position.x = newX;
            this.currentPentomino.position.y = newY;
        };

        PentominoService.prototype.adjustPosition = function adjustPosition() {
            var pentomino = this.currentPentomino;
            var partRelPosition = pentomino.faces[pentomino.face][pentomino.activePart];
            var partAbsPosition = [pentomino.position.x + partRelPosition[0], pentomino.position.y + partRelPosition[1]];
            var partToBottom = pentomino.dimensions[1] - partRelPosition[1] - 1;
            var partToRight = pentomino.dimensions[0] - partRelPosition[0] - 1;
            switch (pentomino.activePart) {
                case 0:
                    pentomino.position.x = partAbsPosition[0] - partToBottom;
                    pentomino.position.y = partAbsPosition[1] - partRelPosition[0];
                    break;
                case 1:
                    pentomino.position.x = partAbsPosition[0] - partToRight;
                    break;
                case 2:
                    pentomino.position.y = partAbsPosition[1] - partToBottom;
                    break;
            }
        };

        PentominoService.prototype.registerPiece = function registerPiece(pentomino, onOff) {
            if (pentomino && pentomino.faces) {
                for (var j = 0; j < pentomino.faces[pentomino.face].length; j++) {
                    var x = pentomino.faces[pentomino.face][j][0] + pentomino.position.x;
                    var y = pentomino.faces[pentomino.face][j][1] + pentomino.position.y;
                    if (this.bs.onBoard(x, y)) {
                        this.fields[y][x] += onOff;
                    }
                }
            }
        };

        PentominoService.prototype.registerPieces = function registerPieces() {
            this.setBoardFields(0);
            for (var i = 0; i < this.pentominos.length; i++) {
                var pentomino = this.pentominos[i];
                this.registerPiece(pentomino, 1);
                this.adjustDimensions(pentomino);
            }
        };

        PentominoService.prototype.setBoardFields = function setBoardFields(content) {
            var w = this.bs.getWidth();
            var h = this.bs.getHeight();
            this.fields = [];
            for (var y = 0; y < h; y++) {
                this.fields.push([]);
                for (var x = 0; x < w; x++) {
                    this.fields[y].push(content);
                }
            }
        };

        PentominoService.prototype.start = function start() {
            var _this = this;

            this.getPentominoData().then(function (response) {
                _this.pentominos = response;
                _this.getPentominoColors().then(function () {
                    _this.getStartPosition(_this.bs.boardType).then(function () {
                        _this.setBoardFields(0);
                        _this.registerPieces();
                        _this.solved = false;

                        console.log(_this.pentominos);
                    });
                });
            });
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

        PentominoService.prototype.adjustDimensions = function adjustDimensions(pentomino) {
            if (pentomino && pentomino.initialDimensions) {
                pentomino.dimensions = pentomino.initialDimensions.slice();
            }
            if (pentomino && pentomino.face % 2 == 1) {
                pentomino.dimensions.reverse();
            }
        };

        PentominoService.prototype.getStartPosition = function getStartPosition(shape) {
            var _this3 = this;

            return this.ds.getStartPosition(shape).then(function (response) {
                _this3.bs.boardType = shape;
                _this3.sls.currentSolution = -1;
                _this3.sls.setShowSolutions();
                for (var i = 0; i < _this3.pentominos.length; i++) {
                    var pentomino = _this3.pentominos[i];
                    pentomino.face = response[i].face;
                    pentomino.position = response[i].position;
                    pentomino.active = false;
                    pentomino.index = i;
                    if (!pentomino.initialDimensions) {
                        pentomino.initialDimensions = pentomino.dimensions.slice();
                    } else {
                        pentomino.dimensions = pentomino.initialDimensions.slice();
                    }
                    if (pentomino.face % 2 == 1) {
                        pentomino.dimensions.reverse();
                    }
                }
                _this3.registerPieces();
            });
        };

        return PentominoService;
    }()) || _class);
});
define('services/permutation-service',['exports', 'aurelia-framework', './board-service'], function (exports, _aureliaFramework, _boardService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PermutationService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var PermutationService = exports.PermutationService = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService), _dec(_class = function () {
        function PermutationService(boardService) {
            _classCallCheck(this, PermutationService);

            this.bs = boardService;
            this.rotable = [[[1, 2, 3, 0, 5, 6, 7, 4], [1, 2, 3, 0], [1, 2, 3, 0], [1, 0, 3, 2], [1, 0], [0]], [[4, 7, 6, 5, 0, 3, 2, 1], [3, 2, 1, 0], [0, 3, 2, 1], [2, 3, 0, 1], [0, 1], [0]], [[6, 5, 4, 7, 2, 1, 0, 3], [1, 0, 3, 2], [2, 1, 0, 3], [2, 3, 0, 1], [0, 1], [0]]];
        }

        PermutationService.prototype.flipRotate = function flipRotate(pentomino, part) {
            if (part == undefined) {
                part = pentomino.activePart;
            };
            pentomino.face = this.rotable[part][pentomino.type][pentomino.face];

            if (part === 0) {
                pentomino.dimensions.reverse();
            }
        };

        PermutationService.prototype.flipBoardYAxis = function flipBoardYAxis(pentominos) {
            var pentomino = void 0;
            for (var i = 0; i < pentominos.length; i++) {
                pentomino = pentominos[i];
                this.flipRotate(pentomino, 1);
                pentomino.position.x = this.bs.getWidth() - pentomino.position.x - pentomino.dimensions[0];
            }
        };

        PermutationService.prototype.rotateSquareBoard = function rotateSquareBoard(pentominos) {
            var pentomino = void 0;
            var origin = {};
            for (var i = 0; i < pentominos.length; i++) {
                pentomino = pentominos[i];

                origin.x = pentomino.position.x;
                origin.y = pentomino.position.y + pentomino.dimensions[1];

                pentomino.position.x = this.bs.getWidth() - origin.y;
                pentomino.position.y = origin.x;

                this.flipRotate(pentomino, 0);
            }
        };

        PermutationService.prototype.shiftPieces = function shiftPieces(pentominos, dx, dy) {
            for (var i = 0; i < pentominos.length; i++) {
                pentominos[i].position.y += 4;
            }
        };

        PermutationService.prototype.rotateBoard = function rotateBoard(pentominos) {
            if (this.bs.boardType == 'square') {
                this.rotateSquareBoard(pentominos);
            } else {
                for (var i = 0; i < 2; i++) {
                    this.rotateSquareBoard(pentominos);
                }this.shiftPieces(pentominos, 0, 4);
            }
        };

        PermutationService.prototype.mixBoard = function mixBoard(pentominos) {
            var theLength = this.bs.pentominosLength();
            var clw = Math.floor(document.querySelectorAll('.dragArea')[0].clientWidth / this.bs.partSize);
            var clh = Math.floor(document.querySelectorAll('.dragArea')[0].clientHeight / this.bs.partSize);
            var maxX = clw - 4;
            var maxY = clh - 4;

            var offsetX = Math.floor((clw - this.bs.getWidth()) / 2);
            var offsetY = Math.floor((clh - this.bs.getHeight()) / 2);

            for (var i = 0; i < theLength; i++) {
                var pentomino = pentominos[i];

                do {
                    var xPos = Math.floor(Math.random() * maxX);
                    xPos -= offsetX;
                    var yPos = Math.floor(Math.random() * maxY);

                    pentomino.position.x = xPos;
                    pentomino.position.y = yPos;
                } while (this.bs.touchesBoard(pentomino));

                var face = Math.floor(Math.random() * pentomino.faces.length);
                pentomino.face = face;
            }
        };

        return PermutationService;
    }()) || _class);
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
            this.showSolutions = false;
            this.scale = 1;
            this.partSize = 40;
            this.opaqueBlocks = false;
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

        SettingService.prototype.setShowSolutions = function setShowSolutions() {
            this.showSolutions = true;
        };

        return SettingService;
    }();
});
define('services/solution-service',['exports', 'aurelia-framework', './board-service', './permutation-service', './data-service', '../services/setting-service'], function (exports, _aureliaFramework, _boardService, _permutationService, _dataService, _settingService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SolutionService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var SolutionService = exports.SolutionService = (_dec = (0, _aureliaFramework.inject)(_boardService.BoardService, _permutationService.PermutationService, _dataService.DataService, _settingService.SettingService), _dec(_class = function () {
        function SolutionService(boardService, permutationService, dataService, settingService) {
            _classCallCheck(this, SolutionService);

            this.bs = boardService;
            this.ds = dataService;
            this.ss = settingService;
            this.prms = permutationService;
            this.boardType = this.bs.boardType;
            this.currentSolution = -1;
            this.getSolutions();
        }

        SolutionService.prototype.getSolutions = function getSolutions() {
            this.solutions = this.ds.getSolutions();
            this.setShowSolutions();
        };

        SolutionService.prototype.setShowSolutions = function setShowSolutions() {
            this.currentSolution = -1;
            if (this.solutions[this.bs.boardType].length > 0) {
                this.ss.setShowSolutions();
            }
        };

        SolutionService.prototype.saveSolution = function saveSolution(pentominos) {
            var solutionResult = this.isNewSolution(pentominos);

            if (!isNaN(solutionResult)) {
                this.currentSolution = solutionResult;
                this.bs.unsetNewSolution();
            } else {
                this.ds.saveSolution(solutionResult);
                this.solutions[this.boardType].push(solutionResult);
                this.currentSolution = this.solutions[this.boardType].length - 1;
                this.bs.setNewSolution();
            }
        };

        SolutionService.prototype.isNewSolution = function isNewSolution(pentominos) {
            var isNewSolution = true;
            var rotations = this.boardType == 'square' ? 4 : 2;
            var solutionString = this.solution2String(pentominos);
            var foundSolStr = solutionString;
            var theLength = this.solutions[this.boardType].length;

            for (var flip = 0; flip < 2; flip++) {
                for (var rotation = 0; rotation < rotations; rotation++) {
                    for (var i = 0; i < theLength; i++) {
                        solutionString = this.solution2String(pentominos);
                        isNewSolution = isNewSolution && this.solutions[this.bs.boardType][i] !== solutionString;
                        if (!isNewSolution) return i;
                    }

                    this.prms.rotateBoard(pentominos);
                }
                this.prms.flipBoardYAxis(pentominos);
            }
            return foundSolStr;
        };

        SolutionService.prototype.solution2String = function solution2String(pentominos) {
            var solutionString = "";
            var theLength = this.bs.pentominosLength();
            for (var i = 0; i < theLength; i++) {
                solutionString += this.pentomino2string(pentominos[i]);
            }
            return solutionString;
        };

        SolutionService.prototype.pentomino2string = function pentomino2string(pentomino) {
            var parts = [];
            if (pentomino) {
                parts.push('#' + pentomino.name);
                parts.push(pentomino.face);
                parts.push(pentomino.position.x);
                parts.push(pentomino.position.y);
                return parts.join('_');
            }
        };

        return SolutionService;
    }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/header\"></require>\n    <require from=\"components/board\"></require>\n    <require from=\"components/controls\"></require>\n    <require from=\"components/footer.html\"></require>\n    <div class=\"dragArea\"\n         mousemove.delegate=\"ds.doDrag($event)\"\n         touchmove.delegate=\"ds.doDrag($event)\"\n         mouseup.delegate=\"ds.stopDrag($event)\"\n         touchend.delegate=\"ds.stopDrag($event)\">\n        <header></header>\n        <board></board>\n        <controls></controls>\n        <footer></footer>\n    </div>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = ".dragArea, body, html {\n    width                : 100%;\n    height               : 100%;\n    background-color     : #222;\n    font-family          : TrebuchetMS, sans-serif;\n    color                : #fff;\n    -webkit-touch-callout: none;\n    -webkit-user-select  : none;\n    -khtml-user-select   : none;\n    -moz-user-select     : none;\n    -ms-user-select      : none;\n    user-select          : none;\n}\n\n.dragArea {\n    flex           : 1 0 auto;\n    display        : flex;\n    flex-direction : column;\n    justify-content: flex-start;\n    align-items    : center;\n    overflow       : hidden;\n}\n@media (min-height: 700px) {\n    .dragArea {\n        justify-content: center;\n    }\n}\n\n.r {\n    float: right;\n}\n\n.l {\n    float: left;\n}\n\n.relContainer {\n    position: relative;\n}\n\n.rounded {\n    border-radius: 100px;\n}\n\n.clearFix {\n    clear: both;\n}\n\n.hidden {\n    display: none;\n}\n\n.invisible {\n    visibility: hidden;\n}\n\n.pushTop {\n    margin-top: 12px;\n}\n\n.pushLeft {\n    margin-left: 12px;\n}\n\n.pushBottom {\n    margin-bottom: 12px;\n}\n\n.pushBottomMore {\n    margin-bottom: 24px;\n}\n\n.textAlignLeft {\n    text-align: left;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template class.bind=\"getBoardClasses(bs.newSolution)\"\n          css.bind=\"getBoardSizeCSS(bs.boardType)\">\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/pentominos\"></require>\n    <pentominos></pentominos>\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n"; });
define('text!components/controls.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/controls.css\"></require>\n    <div class=\"controls\"\n         if.bind=\"showSolutions(sls.solutions[bs.boardType].length)\">\n        <button class.bind=\"small\"\n                title=\"Show previous solution\"\n                if.bind=\"showButton()\"\n                disabled.bind=\"disablePreviousButton(sls.currentSolution)\"\n                click.delegate=\"showPreviousSolution()\"\n                touchstart.delegate=\"showPreviousSolution()\">\n         <icon class=\"fa fa-step-backward fa-lg\"></icon>\n        </button>\n        <div class.bind=\"getIndicatorClass(bs.solved)\"\n             innerhtml.bind=\"getIndicatorText(sls.currentSolution, sls.solutions[bs.boardType].length)\"\n             click.delegate=\"showFirstSolution()\"\n             touchstart.delegate=\"showFirstSolution()\">\n        </div>\n        <button class=\"small\"\n                title=\"Show next solution\"\n                if.bind=\"showButton()\"\n                disabled.bind=\"disableNextButton(sls.currentSolution, sls.solutions[bs.boardType].length)\"\n                click.delegate=\"showNextSolution()\"\n                touchstart.delegate=\"showNextSolution()\">\n            <icon class=\"fa fa-step-forward fa-lg\"></icon>\n        </button>\n    </div>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = ".board {\n    display         : flex;\n    flex-direction  : column;\n    position        : relative;\n    background-color: lightgray;\n    border          : 5px solid darkgray;\n    transition      : all .3s ease;\n}\n\n.board.solved, .solved {\n    border-color      : lime;\n    -webkit-box-shadow: 0 0 30px 0 rgba(0, 255, 0, .5);\n    box-shadow        : 0 0 30px 0 rgba(0, 255, 0, .5);\n}\n"; });
define('text!components/footer.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/footer.css\"></require>\n    <a href=\"http://www.ashware.nl\"\n       target=\"_blank\"\n       class=\"r\">&copy;&nbsp;ashWare</a>\n    <!-- <span class='st_sharethis' displayText='ShareThis'></span> -->\n</template>"; });
define('text!components/controls.css', ['module'], function(module) { module.exports = ".controls {\n    width          : 320px;\n    height         : 40px;\n    display        : flex;\n    justify-content: center;\n    align-items    : center;\n}\n\n.controls .indicator, .controls button {\n    height          : 30px;\n    line-height     : 30px;\n    font-family     : inherit;\n    background-color: transparent;\n    border          : none;\n    outline         : none;\n    color           : white;\n    font-size       : 14px;\n    padding         : 0 10px;\n    transition      : all .3s ease;\n    cursor          : pointer;\n}\n\n.controls .indicator {\n    margin-left: 5px;\n}\n\n.controls indicator.solved {\n    border: 1px dotted lime;\n}\n\n.controls button.small {\n    width      : 40px;\n    height     : 30px;\n    line-height: 30px;\n}\n\n.controls button icon {\n    line-height: 30px;\n}\n\n.controls button:disabled {\n    cursor : not-allowed;\n    opacity: .2;\n}\n\n[class*='fa-step-'] {\n    vertical-align: 0;\n}\n"; });
define('text!components/header.html', ['module'], function(module) { module.exports = "<template css.bind=\"getHeaderSizeCss(bs.boardType)\">\n    <require from=\"components/header.css\"></require>\n    <require from=\"components/menu\"></require>\n    <menu></menu>\n    <h1>${title}</h1>\n</template>"; });
define('text!components/footer.css', ['module'], function(module) { module.exports = "footer {\n    display   : block;\n    width     : 100%;\n    position  : absolute;\n    padding   : 0 10px;\n    bottom    : 10px;\n    box-sizing: border-box;\n}\n\nfooter span {\n    color: #fff !important;\n}\n\nfooter a {\n    color          : #f2f2f2;\n    text-decoration: none;\n    font-size      : 12px;\n}\n"; });
define('text!components/menu.html', ['module'], function(module) { module.exports = "<template class=\"hamburger\">\n    <require from=\"components/menu.css\"></require>\n    <i class=\"fa fa-bars\"\n       click.delegate=\"showTheMenu()\"\n       touchstart.delegate=\"showTheMenu()\"></i>\n\n    <ul id=\"menu\"\n        if.bind=\"settings.menuVisible\">\n\n        <li click.delegate=\"hideTheMenu()\"\n            touchstart.delegate=\"hideTheMenu()\">\n            <i class=\"fa fa-times\"></i></li>\n\n        <li if.bind=\"sls.solutions['square'].length > 1\"\n            mouseenter.trigger=\"toggleSubmenuBoards()\"\n            mouseleave.trigger=\"toggleSubmenuBoards()\"\n            touchend.delegate=\"toggleSubmenuBoards()\">\n            Board sizes&nbsp;&nbsp;<i class=\"fa fa-angle-right\"></i>\n            <ul if.bind=\"settings.submenuBoardsVisible\"\n                class=\"subMenu\">\n                <li repeat.for=\"boardType of boardTypes\"\n                    if.bind=\"showThisBoard(boardType)\"\n                    class.bind=\"getActiveBoardClass(boardType)\"\n                    click.delegate=\"getStartPosition(boardType)\"\n                    touchstart.delegate=\"getStartPosition(boardType)\"\n                    innerhtml.bind=\"getBoardDimensions(boardType)\"></li>\n            </ul>\n        </li>\n\n        <li click.delegate=\"rotateBoard()\"\n            touchstart.delegate=\"rotateBoard()\">Rotate&nbsp;Blocks</li>\n\n        <li click.delegate=\"flipBoardYAxis()\"\n            touchstart.delegate=\"flipBoardYAxis()\">Flip Blocks</li>\n\n        <li if.bind=\"screenIsLargeEnough()\"\n            click.delegate=\"mixBoard()\"\n            touchstart.delegate=\"mixBoard()\">Shuffle</li>\n\n        <li if.bind=\"sls.solutions[bs.boardType].length > 20\"\n            click.delegate=\"board.autoSolve()\"\n            touchstart.delegate=\"board.autoSolve()\">Spoiler</li>\n    </ul>\n\n</template>"; });
define('text!components/header.css', ['module'], function(module) { module.exports = "header {\n    position: relative;\n    height  : 40px;\n}\n\nh1 {\n    font-family   : inherit;\n    font-size     : 21px;\n    letter-spacing: 1px;\n    text-align    : center;\n    line-height   : 0;\n    margin        : 20px 0 -20px;\n}\n"; });
define('text!components/pentominos.html', ['module'], function(module) { module.exports = "<template class=\"pentominosWrapper\">\n    <require from=\"components/pentominos.css\"></require>\n    <div repeat.for=\"pentomino of ps.pentominos\"\n         class.bind=\"getPentominoClasses(pentomino)\"\n         css.bind=\"getPentominoCSS(pentomino.position.x, pentomino.position.y, pentomino.color)\">\n        <div class=\"relContainer inheritBgColor\">\n            <div repeat.for=\"part of pentomino.faces[pentomino.face]\"\n                 class.bind=\"getPartClasses(pentomino, $index, pentomino.face)\"\n                 css.bind=\"getPartCSS(part)\"\n                 mousedown.delegate=\"ds.startDrag(pentomino, $index, $event)\"\n                 touchstart.delegate=\"ds.startDrag(pentomino, $index, $event)\">\n            </div>\n        </div>\n    </div>\n</template>"; });
define('text!components/menu.css', ['module'], function(module) { module.exports = ".hamburger {\n    position: absolute;\n    left    : 2px;\n    top     : 2px;\n    z-index : 100;\n}\n\n.hamburger .fa-bars {\n    height     : 40px;\n    line-height: 40px;\n    padding    : 0 10px;\n    margin-top : -1px;\n    cursor     : pointer;\n}\n\nmenu ul#menu {\n    position: absolute;\n    left    : -5px;\n    top     : 0;\n}\n\nmenu ul {\n    background-color: rgba(34, 34, 34, .7);\n    border          : 1px solid rgba(34, 34, 34, .7);\n}\n\nmenu ul li {\n    position        : relative;\n    font-size       : 14px;\n    color           : #333;\n    background-color: ghostwhite;\n    line-height     : 20px;\n    padding         : 10px 20px 10px 15px;\n    margin          : 1px;\n    cursor          : pointer;\n}\n\nmenu ul li:hover {\n    background-color: gainsboro;\n}\n\nmenu ul li.active {\n    background-color: silver;\n}\n\nmenu ul.subMenu {\n    position: absolute;\n    left    : 99%;\n    top     : -2px;\n    z-index : 1;\n}\n"; });
define('text!components/pentominos.css', ['module'], function(module) { module.exports = ".pentominosWrapper {\n    position: absolute;\n    left    : 0;\n    right   : 0;\n    top     : 0;\n    bottom  : 0;\n}\n\n.pentomino {\n    position      : absolute;\n    left          : 0;\n    top           : 0;\n    pointer-events: none;\n}\n\n.inheritBgColor {\n    background-color: inherit;\n}\n\n.part {\n    position          : absolute;\n    left              : 0;\n    top               : 0;\n    width             : 40px;\n    height            : 40px;\n    text-align        : center;\n    color             : white;\n    background-color  : inherit;\n    border            : 1px solid rgba(211, 211, 211, .2);\n    -webkit-box-sizing: border-box;\n    box-sizing        : border-box;\n    pointer-events    : auto;\n    cursor            : move;\n    cursor            : -webkit-grab;\n    cursor            : grab;\n}\n\n.part > span {\n    line-height: 40px;\n}\n\n.part:active {\n    cursor: -webkit-grabbing;\n    cursor: grabbing;\n}\n\n.part::before {\n    line-height: 38px;\n    opacity    : .2;\n    /*display: none;*/\n}\n\n.block_n .part::before, .block_y .part::before {\n    opacity: .4;\n}\n\n.block_t .part::before, .block_v .part::before {\n    opacity: .3;\n}\n\n.pentomino.active .part::before, .pentomino:hover .part::before {\n    opacity: 1;\n    /*display: inline;*/\n}\n\n.pentomino.transparent .part {\n    opacity: .7;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map