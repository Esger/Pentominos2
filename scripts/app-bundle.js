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
                    w: 3,
                    h: 20,
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
            var count = pentomino.faces[pentomino.face].length;
            for (var i = 0; i < count; i++) {
                var part = pentomino.faces[pentomino.face][i];
                var x = pentomino.position.x + part[0];
                var y = pentomino.position.y + part[1];
                var partIsOnBoard = this.onBoard(x, y);
                if (partIsOnBoard) {
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

            var solutions = void 0;

            if (localStorage.getItem("pentominos2")) {
                solutions = JSON.parse(localStorage.getItem("pentominos2"));
            } else {
                solutions = {};
                var boardTypes = this.bs.boardTypes;
                for (var type in boardTypes) {
                    if (boardTypes.hasOwnProperty(type)) {
                        solutions[type] = [];
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
define('services/drag-service',['exports', 'aurelia-framework', 'aurelia-templating-resources', './setting-service', './pentomino-service', './permutation-service'], function (exports, _aureliaFramework, _aureliaTemplatingResources, _settingService, _pentominoService, _permutationService) {
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

    var DragService = exports.DragService = (_dec = (0, _aureliaFramework.inject)(_aureliaTemplatingResources.BindingSignaler, _settingService.SettingService, _pentominoService.PentominoService, _permutationService.PermutationService), _dec(_class = function () {
        function DragService(bindingSignaler, settingService, pentominoService, permutationService) {
            _classCallCheck(this, DragService);

            this.bnds = bindingSignaler;
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
                this.ps.setActivePentomino(pentomino, partIndex);
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
            if (this.ps.getActivePentomino()) {
                this.x = clientPos.x - this.startX;
                this.y = clientPos.y - this.startY;
                this.container.style.left = this.x + 'px';
                this.container.style.top = this.y + 'px';
            }
        };

        DragService.prototype.stopDrag = function stopDrag(event) {
            this.dragEndPos.x = this.x;
            this.dragEndPos.y = this.y;
            var pentomino = this.ps.getActivePentomino();
            if (pentomino) {
                this.alignToGrid();
                if (!this.isDragged()) {
                    if (pentomino.type < 4 && pentomino.activePart < 3 || pentomino.type == 4 && pentomino.activePart < 1) {
                        this.ps.adjustPosition();
                        this.prms.flipRotate(pentomino);
                        this.bnds.signal('position-signal');
                    }
                }
                this.ps.registerPiece(pentomino, 1);
                this.ps.isSolved();
            }
            this.releasePentomino();
        };

        DragService.prototype.releasePentomino = function releasePentomino() {
            if (this.container) {
                this.container.style.zIndex = '';
                this.container = null;
            }
            this.ps.resetActivePentomino();
        };

        DragService.prototype.alignToGrid = function alignToGrid() {
            var newX = Math.round(this.x / this.ss.partSize);
            var newY = Math.round(this.y / this.ss.partSize);
            this.ps.setActivePentominoPosition(newX, newY);
            this.container.style.left = newX * this.ss.partSize + 'px';
            this.container.style.top = newY * this.ss.partSize + 'px';
        };

        DragService.prototype.isDragged = function isDragged() {
            return Math.abs(this.dragEndPos.x - this.dragStartPos.x) > 19 || Math.abs(this.dragEndPos.y - this.dragStartPos.y) > 19;
        };

        return DragService;
    }()) || _class);
});
define('services/pentomino-service',['exports', 'aurelia-framework', 'aurelia-templating-resources', './data-service', './board-service', './solution-service'], function (exports, _aureliaFramework, _aureliaTemplatingResources, _dataService, _boardService, _solutionService) {
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

    var PentominoService = exports.PentominoService = (_dec = (0, _aureliaFramework.inject)(_aureliaTemplatingResources.BindingSignaler, _dataService.DataService, _boardService.BoardService, _solutionService.SolutionService), _dec(_class = function () {
        function PentominoService(bindingSignaler, dataService, boardService, solutionService) {
            _classCallCheck(this, PentominoService);

            this.bnds = bindingSignaler;
            this.ds = dataService;
            this.bs = boardService;
            this.sls = solutionService;

            this.pentominos = [];
            this.offBoardPentominos = [];
            this.fields = [];
            this.activePentomino = null;
            this.oBlock = null;
            this.start();
        }

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

        PentominoService.prototype.getActivePentomino = function getActivePentomino() {
            return this.activePentomino;
        };

        PentominoService.prototype.getFields = function getFields() {
            return this.fields;
        };

        PentominoService.prototype.setActivePentomino = function setActivePentomino(pentomino, index) {
            this.activePentomino = pentomino;
            this.activePentomino.activePart = index;
        };

        PentominoService.prototype.resetActivePentomino = function resetActivePentomino() {
            if (this.activePentomino) {
                this.activePentomino.activePart = null;
            }
            this.activePentomino = null;
        };

        PentominoService.prototype.setActivePentominoPosition = function setActivePentominoPosition(newX, newY) {
            this.activePentomino.position.x = newX;
            this.activePentomino.position.y = newY;
        };

        PentominoService.prototype.setAllOnboard = function setAllOnboard(onBoards, offBoards) {
            this.pentominos = onBoards.concat(offBoards);
            this.pentominos = this.sortPentominos(this.pentominos);
            this.registerPieces();
        };

        PentominoService.prototype.signalViewUpdate = function signalViewUpdate() {
            this.bnds.signal('position-signal');
        };

        PentominoService.prototype.sortPentominos = function sortPentominos(pentos) {
            pentos.sort(function (a, b) {
                return a.index - b.index;
            });
            return pentos;
        };

        PentominoService.prototype.setPentominosOffboard = function setPentominosOffboard() {
            this.registerPieces();
            this.offBoardPentominos = this.pentominos.filter(function (pento) {
                return pento.onBoard === false;
            });
            this.pentominos = this.pentominos.filter(function (pento) {
                return pento.onBoard === true;
            });
            this.registerPieces();
            return this.offBoardPentominos;
        };

        PentominoService.prototype.adjustPosition = function adjustPosition() {
            var pentomino = this.activePentomino;
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
            if (pentomino) {
                var onBoardParts = 0;
                var partsCount = pentomino.faces[pentomino.face].length;
                for (var i = 0; i < partsCount; i++) {
                    var x = pentomino.faces[pentomino.face][i][0] + pentomino.position.x;
                    var y = pentomino.faces[pentomino.face][i][1] + pentomino.position.y;
                    if (this.bs.onBoard(x, y)) {
                        this.fields[y][x] += onOff;
                        onBoardParts += 1;
                    }
                    pentomino.onBoard = onBoardParts == partsCount;
                }
            }
        };

        PentominoService.prototype.registerPieces = function registerPieces() {
            this.fields = this.setBoardFields(0);
            for (var i = 0; i < this.pentominos.length; i++) {
                var pentomino = this.pentominos[i];
                this.registerPiece(pentomino, 1);
                this.adjustDimensions(pentomino);
            }
            this.signalViewUpdate();
        };

        PentominoService.prototype.setBoardFields = function setBoardFields(content) {
            var w = this.bs.getWidth();
            var h = this.bs.getHeight();
            var fields = [];
            for (var y = 0; y < h; y++) {
                fields.push([]);
                for (var x = 0; x < w; x++) {
                    fields[y].push(content);
                }
            }
            return fields;
        };

        PentominoService.prototype.setPentominos = function setPentominos(pentos) {
            this.pentominos = pentos;
        };

        PentominoService.prototype.setOffBoardPentominos = function setOffBoardPentominos(pentos) {
            this.offBoardPentominos = pentos;
        };

        PentominoService.prototype.start = function start() {
            var _this = this;

            this.getPentominoData().then(function (response) {
                _this.pentominos = response;
                _this.getPentominoColors().then(function () {
                    _this.getStartPosition(_this.bs.boardType).then(function () {
                        _this.registerPieces();
                        _this.solved = false;
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

        PentominoService.prototype.toggleOblock = function toggleOblock(count) {
            if (this.pentominos.length > count) {
                this.oBlock = this.pentominos.pop();
            } else {
                if (this.oBlock) {
                    this.pentominos.push(this.oBlock);
                    this.oBlock = null;
                }
            }
        };

        PentominoService.prototype.getStartPosition = function getStartPosition(shape) {
            var _this3 = this;

            return this.ds.getStartPosition(shape).then(function (response) {
                _this3.bs.boardType = shape;
                _this3.sls.currentSolution = -1;
                _this3.sls.setShowSolutions();
                var count = response.length;
                _this3.toggleOblock(count);
                for (var i = 0; i < count; i++) {
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
            }
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
                pentominos[i].position.x += dx;
                pentominos[i].position.y += dy;
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
            var clientWidth = Math.floor(document.querySelectorAll('.dragArea')[0].clientWidth / this.bs.partSize);
            var clientHeight = Math.floor(document.querySelectorAll('.dragArea')[0].clientHeight / this.bs.partSize);
            var maxX = clientWidth - 4;
            var maxY = clientHeight - 4;

            var offsetX = Math.floor((clientWidth - this.bs.getWidth()) / 2);

            var count = pentominos.length;
            for (var i = 0; i < count; i++) {
                var pentomino = pentominos[i];
                var face = Math.floor(Math.random() * pentomino.faces.length);
                pentomino.face = face;

                do {
                    var xPos = Math.floor(Math.random() * maxX);
                    xPos -= offsetX;
                    var yPos = Math.floor(Math.random() * maxY);

                    pentomino.position.x = xPos;
                    pentomino.position.y = yPos;
                } while (this.bs.touchesBoard(pentomino));
                pentomino.onBoard = false;
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
            var solutionsCount = this.solutions[this.boardType].length;

            for (var flip = 0; flip < 2; flip++) {
                for (var rotation = 0; rotation < rotations; rotation++) {
                    for (var i = 0; i < solutionsCount; i++) {
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
            var count = pentominos.length;
            for (var i = 0; i < count; i++) {
                var pentomino = pentominos[i];
                solutionString += this.pentomino2string(pentomino);
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
define('services/solver-worker',[], function () {
    'use strict';

    var boardType = '';
    var boardWidth = void 0;
    var boardHeight = void 0;
    var fields = [];
    var pentominos = [];
    var offBoardPentominos = [];
    var startPositionsXblock = {
        'square': [[1, 0], [1, 1], [2, 0], [2, 1], [2, 2]],
        'rectangle': [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3]],
        'dozen': [],
        'beam': [],
        'stick': [],
        'twig': [[0, 1], [0, 6]]
    };
    var xPentomino = function xPentomino() {
        return getPentomino('x');
    };
    var startPosXBlock = 0;
    var positionsTried = 0;
    var proceed = true;

    var adjustDimensions = function adjustDimensions(pentomino) {
        if (pentomino && pentomino.initialDimensions) {
            pentomino.dimensions = pentomino.initialDimensions.slice();
        }
        if (pentomino && pentomino.face % 2 === 1) {
            pentomino.dimensions.reverse();
        }
    };

    var autoSolve = function autoSolve(offBoards) {
        if (allOffBoard()) {
            setOnboard(xPentomino(), false);
            var xPosition = getXBlockPosition();
            while (xPosition) {
                movePentomino(xPentomino(), 0, xPosition, false);
                sendFeedBack('draw');
                positionsTried++;
                offBoards = findNextFit(offBoards);
                xPosition = getXBlockPosition();
            }
        } else {
            offBoards = findNextFit(offBoards);
        }
        return offBoards;
    };

    var allOffBoard = function allOffBoard() {
        var emptyBoard = pentominos.length === 0;
        return emptyBoard;
    };

    var copyBoardFields = function copyBoardFields() {
        var flds = [];
        for (var y = 0; y < boardHeight; y++) {
            flds.push([]);
            for (var x = 0; x < boardWidth; x++) {
                flds[y].push(fields[y][x]);
            }
        }
        return flds;
    };

    var discard = function discard(misFits) {
        var pentomino = pentominos.pop();
        pentomino.onBoard = false;
        misFits.push(pentomino);
        registerPiece(pentomino, -1);
        return misFits;
    };

    var findFirstEmptyPosition = function findFirstEmptyPosition() {
        for (var y = 0; y < boardHeight; y++) {
            for (var x = 0; x < boardWidth; x++) {
                if (fields[y][x] === 0) return [x, y];
            }
        }
        return false;
    };

    var findFirstPartRight = function findFirstPartRight(pentomino) {
        var offsetRight = pentomino.dimensions[0];
        var part = pentomino.faces[pentomino.face][0];
        for (var j = 0; j < pentomino.faces[pentomino.face].length; j++) {
            part = pentomino.faces[pentomino.face][j];
            offsetRight = part[1] === 0 && part[0] < offsetRight ? part[0] : offsetRight;
        }
        return offsetRight;
    };

    var findNextFit = function findNextFit(offBoards) {
        var misFits = [];
        var firstEmptyPosition = findFirstEmptyPosition();
        if (firstEmptyPosition) {
            if (holeFitsXPieces(firstEmptyPosition)) {
                while (offBoards.length) {
                    var pentomino = nextOnboard(offBoards);
                    if (pentomino) {
                        var count = pentomino.faces.length;
                        for (var face = 0; face < count; face++) {
                            positionsTried++;
                            movePentomino(pentomino, face, firstEmptyPosition, true);
                            if (isFitting() && proceed) {
                                sendFeedBack('draw');
                                findNextFit(sortPentominos(misFits.concat(offBoards)));
                            }
                        }
                        discard(misFits);
                        sendFeedBack('draw');
                    }
                }
            }
        } else {
            sendFeedBack('solution');
        }
        return misFits.concat(offBoards);
    };

    var findPentominoByName = function findPentominoByName(set, name) {
        return set.find(function (pento) {
            return pento.name === name;
        });
    };

    var getPentomino = function getPentomino(name) {
        var pentomino = findPentominoByName(pentominos.concat(offBoardPentominos), name);
        return pentomino;
    };

    var getXBlockPosition = function getXBlockPosition() {
        if (startPosXBlock < startPositionsXblock[boardType].length) {
            var position = startPositionsXblock[boardType][startPosXBlock].slice();
            startPosXBlock += 1;
            return position;
        } else {
            return false;
        }
    };

    var holeFitsXPieces = function holeFitsXPieces(xy) {
        var holeSize = 0;
        var oPentoOnboard = oPentominoOnboard();
        var label = 'a';
        var board = copyBoardFields();
        var y = xy[1];

        var countDown = function countDown(xy) {
            var y = xy[1];
            var x = xy[0];
            while (y < boardHeight && board[y][x] === 0) {
                board[y][x] = label;
                holeSize++;

                countLeft([x - 1, y]);
                countRight([x + 1, y]);
                y++;
            }
        };

        var countUp = function countUp(xy) {
            var y = xy[1];
            var x = xy[0];
            while (y >= 0 && board[y][x] === 0) {
                board[y][x] = label;
                holeSize++;

                countRight([x + 1, y]);
                countLeft([x - 1, y]);
                y--;
            }
        };

        var countRight = function countRight(xy) {
            var x = xy[0];
            var y = xy[1];
            while (x < boardWidth && board[y][x] === 0) {
                board[y][x] = label;
                holeSize++;

                countDown([x, y + 1]);
                countUp([x, y - 1]);
                x++;
            }
        };

        var countLeft = function countLeft(xy) {
            var x = xy[0];
            var y = xy[1];
            while (x >= 0 && board[y][x] === 0) {
                board[y][x] = label;
                holeSize++;

                countDown([x, y + 1]);
                countUp([x, y - 1]);
                x--;
            }
        };

        countRight(xy);
        return holeFits(holeSize);
    };

    var boardHas60Squares = function boardHas60Squares() {
        return !(boardType === 'square' || boardType === 'stick');
    };

    var holeFits = function holeFits(sum) {
        var compensation = oPentominoOnboard() || boardHas60Squares() ? 0 : 4;
        return (sum - compensation) % 5 === 0;
    };

    var initVariables = function initVariables(data) {
        boardType = data.boardType;
        boardWidth = data.boardWidth;
        boardHeight = data.boardHeight;
        fields = data.fields;
        pentominos = data.onBoards;
        offBoardPentominos = data.offBoards;
    };

    var isFitting = function isFitting() {
        var sum = 0;
        var h = fields.length;
        for (var y = 0; y < h; y++) {
            var w = fields[y].length;
            for (var x = 0; x < w; x++) {
                if (fields[y][x] > 1) {
                    return false;
                } else {
                    sum += fields[y][x];
                }
            }
        }
        return noneStickingOut(sum);
    };

    var logBoard = function logBoard() {
        var flds = setBoardFields('');
        var blockCount = pentominos.length;
        for (var i = 0; i < blockCount; i++) {
            var pentomino = pentominos[i];
            var face = pentomino.faces[pentomino.face];
            var partCount = face.length;
            for (var j = 0; j < partCount; j++) {
                var x = face[j][0] + pentomino.position.x;
                var y = face[j][1] + pentomino.position.y;
                if (y < boardHeight && x < boardWidth) {
                    flds[y][x] += pentomino.name;
                }
            }
        }
        console.clear();
        console.table(flds);
    };

    var movePentomino = function movePentomino(pentomino, face, position, shiftLeft) {
        var newPosition = void 0;
        registerPiece(pentomino, -1);
        setFace(pentomino, face);

        if (shiftLeft && position[0] > 0) {
            var xShift = findFirstPartRight(pentomino);
            newPosition = [position[0] - xShift, position[1]];
        } else {
            newPosition = position;
        }
        setPosition(pentomino, newPosition);
        registerPiece(pentomino, 1);
    };

    var nextOnboard = function nextOnboard(offBoards) {
        var pentomino = offBoards.shift();
        pentomino.onBoard = true;
        pentominos.push(pentomino);
        registerPiece(pentomino, 1);
        return pentomino;
    };

    var noneStickingOut = function noneStickingOut(sum) {
        var compensation = oPentominoOnboard() || boardType === 'rectangle' ? 4 : 0;
        return (sum - compensation) % 5 === 0;
    };

    var onBoard = function onBoard(x, y) {
        return x >= 0 && x < boardWidth && y >= 0 && y < boardHeight;
    };

    var oPentominoOnboard = function oPentominoOnboard() {
        return pentominos.filter(function (pento) {
            return pento.name === 'o';
        }).length > 0;
    };

    var registerPiece = function registerPiece(pentomino, onOff) {
        if (pentomino) {
            var onBoardParts = 0;
            var face = pentomino.faces[pentomino.face];
            var partsCount = face.length;
            for (var i = 0; i < partsCount; i++) {
                var part = face[i];
                var x = part[0] + pentomino.position.x;
                var y = part[1] + pentomino.position.y;
                if (onBoard(x, y)) {
                    fields[y][x] += onOff;
                    onBoardParts += 1;
                }
                pentomino.onBoard = onBoardParts == partsCount;
            }
        }
    };

    var sendFeedBack = function sendFeedBack(message) {
        var workerData = {
            message: message || 'solution',
            onBoards: []
        };
        switch (message) {
            case 'draw':
                workerData.onBoards = pentominos;
                break;
            case 'solution':
                workerData.onBoards = pentominos;
                break;
            case 'finish':
                workerData.onBoards = pentominos.concat(offBoardPentominos);
                postMessage(workerData);
                close();
            default:
                close();
                break;
        }
        postMessage(workerData);
    };

    var setFace = function setFace(pentomino, face) {
        pentomino.face = face;
        adjustDimensions(pentomino);
    };

    var setPosition = function setPosition(pentomino, position) {
        pentomino.position.x = position[0];
        pentomino.position.y = position[1];
    };

    var setBoardFields = function setBoardFields(content) {
        var w = boardWidth;
        var h = boardHeight;
        var fields = [];
        for (var y = 0; y < h; y++) {
            fields.push([]);
            for (var x = 0; x < w; x++) {
                fields[y].push(content);
            }
        }
        return fields;
    };

    var setOnboard = function setOnboard(pentomino) {
        pentominos.push(pentomino);
        var index = offBoardPentominos.indexOf(pentomino);
        offBoardPentominos.splice(index, 1);
    };

    var sortPentominos = function sortPentominos(pentos) {
        pentos.sort(function (a, b) {
            return a.index - b.index;
        });
        return pentos;
    };

    onmessage = function onmessage(e) {
        var message = e.data.message;
        switch (message) {
            case 'solve':
                proceed = true;
                initVariables(e.data);
                offBoardPentominos = autoSolve(offBoardPentominos, pentominos);
                break;
            case 'stop':
                proceed = false;
                break;
            default:
                break;
        }
        sendFeedBack('finish');
    };
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
define('components/controls',['exports', 'aurelia-framework', 'aurelia-templating-resources', '../services/board-service', '../services/setting-service', '../services/pentomino-service', '../services/solution-service'], function (exports, _aureliaFramework, _aureliaTemplatingResources, _boardService, _settingService, _pentominoService, _solutionService) {
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

    var ControlsCustomElement = exports.ControlsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaTemplatingResources.BindingSignaler, _boardService.BoardService, _settingService.SettingService, _pentominoService.PentominoService, _solutionService.SolutionService), _dec(_class = function () {
        function ControlsCustomElement(bindingSignaler, boardService, settingService, pentominoService, solutionService) {
            _classCallCheck(this, ControlsCustomElement);

            this.bnds = bindingSignaler;
            this.bs = boardService;
            this.ss = settingService;
            this.ps = pentominoService;
            this.sls = solutionService;
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
            this.bnds.signal('position-signal');
            this.ps.registerPieces();
            this.bs.unsetNewSolution();
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
define('components/menu',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-templating-resources', '../services/board-service', '../services/solution-service', '../services/pentomino-service', '../services/permutation-service', '../services/setting-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _aureliaTemplatingResources, _boardService, _solutionService, _pentominoService, _permutationService, _settingService) {
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

    var MenuCustomElement = exports.MenuCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaTemplatingResources.BindingSignaler, _boardService.BoardService, _aureliaEventAggregator.EventAggregator, _solutionService.SolutionService, _pentominoService.PentominoService, _permutationService.PermutationService, _settingService.SettingService), _dec(_class = function () {
        function MenuCustomElement(bindingSignaler, boardService, eventAggregator, solutionService, pentominoService, permutationService, settingService) {
            _classCallCheck(this, MenuCustomElement);

            this.bnds = bindingSignaler;
            this.bs = boardService;
            this.ea = eventAggregator;
            this.sls = solutionService;
            this.ps = pentominoService;
            this.prms = permutationService;
            this.ss = settingService;
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
            this.bnds.signal('position-signal');
        };

        MenuCustomElement.prototype.flipBoardYAxis = function flipBoardYAxis() {
            this.prms.flipBoardYAxis(this.ps.pentominos);
            this.ps.registerPieces();
            this.settings.menuVisible = false;
            this.bnds.signal('position-signal');
        };

        MenuCustomElement.prototype.showTheMenu = function showTheMenu() {
            this.settings.menuVisible = true;
            this.settings.submenuBoardsVisible = false;
        };

        MenuCustomElement.prototype.mixBoard = function mixBoard() {
            this.prms.mixBoard(this.ps.pentominos);
            this.ps.registerPieces();
            this.settings.menuVisible = false;
            this.bnds.signal('position-signal');
        };

        MenuCustomElement.prototype.hideTheMenu = function hideTheMenu() {
            this.settings.menuVisible = false;
        };

        MenuCustomElement.prototype.showThisBoard = function showThisBoard(key) {
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

        MenuCustomElement.prototype.workersSupported = function workersSupported() {
            if (window.Worker) {
                return true;
            }
            return false;
        };

        MenuCustomElement.prototype.showSolvingPanel = function showSolvingPanel() {
            this.ea.publish('showSolvingPanel', true);
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

        PentominosCustomElement.prototype.getPentominoClasses = function getPentominoClasses(pentomino) {
            var classes = ['pentomino'];
            classes.push('pentomino block_' + pentomino.name);
            if (pentomino.active) {
                classes.push('active');
            }
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

        PentominosCustomElement.prototype.attached = function attached() {};

        return PentominosCustomElement;
    }()) || _class);
});
define('components/solving',['exports', 'aurelia-framework', 'aurelia-event-aggregator', '../services/board-service', '../services/pentomino-service', '../services/solution-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _boardService, _pentominoService, _solutionService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SolvingCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var SolvingCustomElement = exports.SolvingCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _boardService.BoardService, _pentominoService.PentominoService, _solutionService.SolutionService), _dec(_class = function () {
        function SolvingCustomElement(eventAggregator, boardService, pentominoService, solutionService) {
            var _this = this;

            _classCallCheck(this, SolvingCustomElement);

            this.ea = eventAggregator;
            this.bs = boardService;
            this.ps = pentominoService;
            this.sls = solutionService;
            this.solvingPanelVisible = false;
            this.backupPentominos = this.ps.pentominos.slice();
            this.slvrWrkr = null;
            this.ea.subscribe('showSolvingPanel', function (response) {
                _this.solvingPanelVisible = response;
            });
        }

        SolvingCustomElement.prototype.autoSolve = function autoSolve() {
            var _this2 = this;

            this.slvrWrkr = new Worker('./src/services/solver-worker.js');
            this.boardWidth = this.bs.getWidth();
            this.boardHeight = this.bs.getHeight();
            this.startPosXBlock = 0;
            this.positionsTried = 0;
            var workerData = {
                message: 'solve',
                boardType: this.bs.boardType,
                boardWidth: this.bs.getWidth(),
                boardHeight: this.bs.getHeight(),
                offBoards: this.ps.setPentominosOffboard(),
                fields: this.ps.getFields(),
                onBoards: this.ps.pentominos
            };

            this.slvrWrkr.postMessage(workerData);

            this.slvrWrkr.onmessage = function (e) {
                var pentominos = _this2.ps.sortPentominos(e.data.onBoards);
                var offBoards = e.data.offBoards;
                var message = e.data.message;
                switch (message) {
                    case 'draw':
                        _this2.ps.setPentominos(pentominos);
                        break;
                    case 'solution':
                        _this2.ps.setPentominos(pentominos);
                        _this2.sls.saveSolution(pentominos);
                        break;
                    case 'finish':
                        _this2.ps.setPentominos(pentominos);
                        console.log('No more solutions found!');
                        break;
                    default:
                        _this2.ps.setPentominos(pentominos);
                        _this2.ps.setAllOnboard(pentominos, offBoards);
                        break;
                }
            };
        };

        SolvingCustomElement.prototype.stop = function stop() {
            this.slvrWrkr.terminate();
            this.ps.setPentominos(this.backupPentominos);
        };

        return SolvingCustomElement;
    }()) || _class);
});
define('resources/value-converters/part-pos-value-converter',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var PartPosValueConverter = exports.PartPosValueConverter = function () {
        function PartPosValueConverter() {
            _classCallCheck(this, PartPosValueConverter);
        }

        PartPosValueConverter.prototype.toView = function toView(css, config) {
            css = {
                left: config.x * config.partSize + 'px',
                top: config.y * config.partSize + 'px'
            };
            return css;
        };

        return PartPosValueConverter;
    }();
});
define('resources/value-converters/pento-face-value-converter',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var PentoFaceValueConverter = exports.PentoFaceValueConverter = function () {
        function PentoFaceValueConverter() {
            _classCallCheck(this, PentoFaceValueConverter);
        }

        PentoFaceValueConverter.prototype.toView = function toView(array, config) {
            array = config.faces[config.face];
            return array;
        };

        return PentoFaceValueConverter;
    }();
});
define('resources/value-converters/pento-pos-value-converter',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var PentoPosValueConverter = exports.PentoPosValueConverter = function () {
        function PentoPosValueConverter() {
            _classCallCheck(this, PentoPosValueConverter);
        }

        PentoPosValueConverter.prototype.toView = function toView(css, config) {
            css = {
                left: config.x * config.partSize + 'px',
                top: config.y * config.partSize + 'px',
                backgroundColor: config.color
            };
            return css;
        };

        return PentoPosValueConverter;
    }();
});
define('aurelia-templating-resources/compose',['exports', 'aurelia-dependency-injection', 'aurelia-logging', 'aurelia-task-queue', 'aurelia-templating', 'aurelia-pal'], function (exports, _aureliaDependencyInjection, _aureliaLogging, _aureliaTaskQueue, _aureliaTemplating, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Compose = undefined;

  var LogManager = _interopRequireWildcard(_aureliaLogging);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var logger = LogManager.getLogger('templating-resources');

  var Compose = exports.Compose = (_dec = (0, _aureliaTemplating.customElement)('compose'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaDependencyInjection.Container, _aureliaTemplating.CompositionEngine, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaTaskQueue.TaskQueue), _dec(_class = (0, _aureliaTemplating.noView)(_class = _dec2(_class = (_class2 = function () {
    function Compose(element, container, compositionEngine, viewSlot, viewResources, taskQueue) {
      

      _initDefineProp(this, 'model', _descriptor, this);

      _initDefineProp(this, 'view', _descriptor2, this);

      _initDefineProp(this, 'viewModel', _descriptor3, this);

      _initDefineProp(this, 'swapOrder', _descriptor4, this);

      this.element = element;
      this.container = container;
      this.compositionEngine = compositionEngine;
      this.viewSlot = viewSlot;
      this.viewResources = viewResources;
      this.taskQueue = taskQueue;
      this.currentController = null;
      this.currentViewModel = null;
      this.changes = Object.create(null);
    }

    Compose.prototype.created = function created(owningView) {
      this.owningView = owningView;
    };

    Compose.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      this.changes.view = this.view;
      this.changes.viewModel = this.viewModel;
      this.changes.model = this.model;
      processChanges(this);
    };

    Compose.prototype.unbind = function unbind() {
      this.changes = Object.create(null);
      this.pendingTask = null;
      this.bindingContext = null;
      this.overrideContext = null;
      var returnToCache = true;
      var skipAnimation = true;
      this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Compose.prototype.modelChanged = function modelChanged(newValue, oldValue) {
      this.changes.model = newValue;
      requestUpdate(this);
    };

    Compose.prototype.viewChanged = function viewChanged(newValue, oldValue) {
      this.changes.view = newValue;
      requestUpdate(this);
    };

    Compose.prototype.viewModelChanged = function viewModelChanged(newValue, oldValue) {
      this.changes.viewModel = newValue;
      requestUpdate(this);
    };

    return Compose;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'model', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'view', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'viewModel', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'swapOrder', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);


  function isEmpty(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  }

  function tryActivateViewModel(vm, model) {
    if (vm && typeof vm.activate === 'function') {
      return Promise.resolve(vm.activate(model));
    }
  }

  function createInstruction(composer, instruction) {
    return Object.assign(instruction, {
      bindingContext: composer.bindingContext,
      overrideContext: composer.overrideContext,
      owningView: composer.owningView,
      container: composer.container,
      viewSlot: composer.viewSlot,
      viewResources: composer.viewResources,
      currentController: composer.currentController,
      host: composer.element,
      swapOrder: composer.swapOrder
    });
  }

  function processChanges(composer) {
    var changes = composer.changes;
    composer.changes = Object.create(null);

    if (!('view' in changes) && !('viewModel' in changes) && 'model' in changes) {
      composer.pendingTask = tryActivateViewModel(composer.currentViewModel, changes.model);
      if (!composer.pendingTask) {
        return;
      }
    } else {
      var instruction = {
        view: composer.view,
        viewModel: composer.currentViewModel || composer.viewModel,
        model: composer.model
      };

      instruction = Object.assign(instruction, changes);

      instruction = createInstruction(composer, instruction);
      composer.pendingTask = composer.compositionEngine.compose(instruction).then(function (controller) {
        composer.currentController = controller;
        composer.currentViewModel = controller ? controller.viewModel : null;
      });
    }

    composer.pendingTask = composer.pendingTask.catch(function (e) {
      logger.error(e);
    }).then(function () {
      if (!composer.pendingTask) {
        return;
      }

      composer.pendingTask = null;
      if (!isEmpty(composer.changes)) {
        processChanges(composer);
      }
    });
  }

  function requestUpdate(composer) {
    if (composer.pendingTask || composer.updateRequested) {
      return;
    }
    composer.updateRequested = true;
    composer.taskQueue.queueMicroTask(function () {
      composer.updateRequested = false;
      processChanges(composer);
    });
  }
});
define('aurelia-templating-resources/if',['exports', 'aurelia-templating', 'aurelia-dependency-injection', './if-core'], function (exports, _aureliaTemplating, _aureliaDependencyInjection, _ifCore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.If = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _dec3, _class, _desc, _value, _class2, _descriptor, _descriptor2;

  var If = exports.If = (_dec = (0, _aureliaTemplating.customAttribute)('if'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec3 = (0, _aureliaTemplating.bindable)({ primaryProperty: true }), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = (_class2 = function (_IfCore) {
    _inherits(If, _IfCore);

    function If() {
      var _temp, _this, _ret;

      

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, _IfCore.call.apply(_IfCore, [this].concat(args))), _this), _initDefineProp(_this, 'condition', _descriptor, _this), _initDefineProp(_this, 'swapOrder', _descriptor2, _this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    If.prototype.bind = function bind(bindingContext, overrideContext) {
      _IfCore.prototype.bind.call(this, bindingContext, overrideContext);
      if (this.condition) {
        this._show();
      }
    };

    If.prototype.conditionChanged = function conditionChanged(newValue) {
      this._update(newValue);
    };

    If.prototype._update = function _update(show) {
      var _this2 = this;

      if (this.animating) {
        return;
      }

      var promise = void 0;
      if (this.elseVm) {
        promise = show ? this._swap(this.elseVm, this) : this._swap(this, this.elseVm);
      } else {
        promise = show ? this._show() : this._hide();
      }

      if (promise) {
        this.animating = true;
        promise.then(function () {
          _this2.animating = false;
          if (_this2.condition !== _this2.showing) {
            _this2._update(_this2.condition);
          }
        });
      }
    };

    If.prototype._swap = function _swap(remove, add) {
      switch (this.swapOrder) {
        case 'before':
          return Promise.resolve(add._show()).then(function () {
            return remove._hide();
          });
        case 'with':
          return Promise.all([remove._hide(), add._show()]);
        default:
          var promise = remove._hide();
          return promise ? promise.then(function () {
            return add._show();
          }) : add._show();
      }
    };

    return If;
  }(_ifCore.IfCore), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'condition', [_dec3], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'swapOrder', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/if-core',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var IfCore = exports.IfCore = function () {
    function IfCore(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.view = null;
      this.bindingContext = null;
      this.overrideContext = null;

      this.showing = false;
    }

    IfCore.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
    };

    IfCore.prototype.unbind = function unbind() {
      if (this.view === null) {
        return;
      }

      this.view.unbind();

      if (!this.viewFactory.isCaching) {
        this.showing = false;
        return;
      }

      if (this.showing) {
        this.showing = false;
        this.viewSlot.remove(this.view, true, true);
      } else {
        this.view.returnToCache();
      }

      this.view = null;
    };

    IfCore.prototype._show = function _show() {
      if (this.showing) {
        return;
      }

      if (this.view === null) {
        this.view = this.viewFactory.create();
      }

      if (!this.view.isBound) {
        this.view.bind(this.bindingContext, this.overrideContext);
      }

      this.showing = true;
      return this.viewSlot.add(this.view);
    };

    IfCore.prototype._hide = function _hide() {
      var _this = this;

      if (!this.showing) {
        return;
      }

      this.showing = false;
      var removed = this.viewSlot.remove(this.view);

      if (removed instanceof Promise) {
        return removed.then(function () {
          return _this.view.unbind();
        });
      }

      this.view.unbind();
    };

    return IfCore;
  }();
});
define('aurelia-templating-resources/else',['exports', 'aurelia-templating', 'aurelia-dependency-injection', './if-core'], function (exports, _aureliaTemplating, _aureliaDependencyInjection, _ifCore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Else = undefined;

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _dec, _dec2, _class;

  var Else = exports.Else = (_dec = (0, _aureliaTemplating.customAttribute)('else'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function (_IfCore) {
    _inherits(Else, _IfCore);

    function Else(viewFactory, viewSlot) {
      

      var _this = _possibleConstructorReturn(this, _IfCore.call(this, viewFactory, viewSlot));

      _this._registerInIf();
      return _this;
    }

    Else.prototype.bind = function bind(bindingContext, overrideContext) {
      _IfCore.prototype.bind.call(this, bindingContext, overrideContext);

      if (!this.ifVm.condition) {
        this._show();
      }
    };

    Else.prototype._registerInIf = function _registerInIf() {
      var previous = this.viewSlot.anchor.previousSibling;
      while (previous && !previous.au) {
        previous = previous.previousSibling;
      }
      if (!previous || !previous.au.if) {
        throw new Error("Can't find matching If for Else custom attribute.");
      }
      this.ifVm = previous.au.if.viewModel;
      this.ifVm.elseVm = this;
    };

    return Else;
  }(_ifCore.IfCore)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/with',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-binding'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.With = undefined;

  

  var _dec, _dec2, _class;

  var With = exports.With = (_dec = (0, _aureliaTemplating.customAttribute)('with'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function With(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.parentOverrideContext = null;
      this.view = null;
    }

    With.prototype.bind = function bind(bindingContext, overrideContext) {
      this.parentOverrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    With.prototype.valueChanged = function valueChanged(newValue) {
      var overrideContext = (0, _aureliaBinding.createOverrideContext)(newValue, this.parentOverrideContext);
      if (!this.view) {
        this.view = this.viewFactory.create();
        this.view.bind(newValue, overrideContext);
        this.viewSlot.add(this.view);
      } else {
        this.view.bind(newValue, overrideContext);
      }
    };

    With.prototype.unbind = function unbind() {
      this.parentOverrideContext = null;

      if (this.view) {
        this.view.unbind();
      }
    };

    return With;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat',['exports', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-templating', './repeat-strategy-locator', './repeat-utilities', './analyze-view-factory', './abstract-repeater'], function (exports, _aureliaDependencyInjection, _aureliaBinding, _aureliaTemplating, _repeatStrategyLocator, _repeatUtilities, _analyzeViewFactory, _abstractRepeater) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Repeat = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var Repeat = exports.Repeat = (_dec = (0, _aureliaTemplating.customAttribute)('repeat'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.TargetInstruction, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaBinding.ObserverLocator, _repeatStrategyLocator.RepeatStrategyLocator), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = (_class2 = function (_AbstractRepeater) {
    _inherits(Repeat, _AbstractRepeater);

    function Repeat(viewFactory, instruction, viewSlot, viewResources, observerLocator, strategyLocator) {
      

      var _this = _possibleConstructorReturn(this, _AbstractRepeater.call(this, {
        local: 'item',
        viewsRequireLifecycle: (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory)
      }));

      _initDefineProp(_this, 'items', _descriptor, _this);

      _initDefineProp(_this, 'local', _descriptor2, _this);

      _initDefineProp(_this, 'key', _descriptor3, _this);

      _initDefineProp(_this, 'value', _descriptor4, _this);

      _this.viewFactory = viewFactory;
      _this.instruction = instruction;
      _this.viewSlot = viewSlot;
      _this.lookupFunctions = viewResources.lookupFunctions;
      _this.observerLocator = observerLocator;
      _this.key = 'key';
      _this.value = 'value';
      _this.strategyLocator = strategyLocator;
      _this.ignoreMutation = false;
      _this.sourceExpression = (0, _repeatUtilities.getItemsSourceExpression)(_this.instruction, 'repeat.for');
      _this.isOneTime = (0, _repeatUtilities.isOneTime)(_this.sourceExpression);
      _this.viewsRequireLifecycle = (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory);
      return _this;
    }

    Repeat.prototype.call = function call(context, changes) {
      this[context](this.items, changes);
    };

    Repeat.prototype.bind = function bind(bindingContext, overrideContext) {
      this.scope = { bindingContext: bindingContext, overrideContext: overrideContext };
      this.matcherBinding = this._captureAndRemoveMatcherBinding();
      this.itemsChanged();
    };

    Repeat.prototype.unbind = function unbind() {
      this.scope = null;
      this.items = null;
      this.matcherBinding = null;
      this.viewSlot.removeAll(true, true);
      this._unsubscribeCollection();
    };

    Repeat.prototype._unsubscribeCollection = function _unsubscribeCollection() {
      if (this.collectionObserver) {
        this.collectionObserver.unsubscribe(this.callContext, this);
        this.collectionObserver = null;
        this.callContext = null;
      }
    };

    Repeat.prototype.itemsChanged = function itemsChanged() {
      this._unsubscribeCollection();

      if (!this.scope) {
        return;
      }

      var items = this.items;
      this.strategy = this.strategyLocator.getStrategy(items);
      if (!this.strategy) {
        throw new Error('Value for \'' + this.sourceExpression + '\' is non-repeatable');
      }

      if (!this.isOneTime && !this._observeInnerCollection()) {
        this._observeCollection();
      }
      this.strategy.instanceChanged(this, items);
    };

    Repeat.prototype._getInnerCollection = function _getInnerCollection() {
      var expression = (0, _repeatUtilities.unwrapExpression)(this.sourceExpression);
      if (!expression) {
        return null;
      }
      return expression.evaluate(this.scope, null);
    };

    Repeat.prototype.handleCollectionMutated = function handleCollectionMutated(collection, changes) {
      if (!this.collectionObserver) {
        return;
      }
      this.strategy.instanceMutated(this, collection, changes);
    };

    Repeat.prototype.handleInnerCollectionMutated = function handleInnerCollectionMutated(collection, changes) {
      var _this2 = this;

      if (!this.collectionObserver) {
        return;
      }

      if (this.ignoreMutation) {
        return;
      }
      this.ignoreMutation = true;
      var newItems = this.sourceExpression.evaluate(this.scope, this.lookupFunctions);
      this.observerLocator.taskQueue.queueMicroTask(function () {
        return _this2.ignoreMutation = false;
      });

      if (newItems === this.items) {
        this.itemsChanged();
      } else {
        this.items = newItems;
      }
    };

    Repeat.prototype._observeInnerCollection = function _observeInnerCollection() {
      var items = this._getInnerCollection();
      var strategy = this.strategyLocator.getStrategy(items);
      if (!strategy) {
        return false;
      }
      this.collectionObserver = strategy.getCollectionObserver(this.observerLocator, items);
      if (!this.collectionObserver) {
        return false;
      }
      this.callContext = 'handleInnerCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
      return true;
    };

    Repeat.prototype._observeCollection = function _observeCollection() {
      var items = this.items;
      this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, items);
      if (this.collectionObserver) {
        this.callContext = 'handleCollectionMutated';
        this.collectionObserver.subscribe(this.callContext, this);
      }
    };

    Repeat.prototype._captureAndRemoveMatcherBinding = function _captureAndRemoveMatcherBinding() {
      if (this.viewFactory.viewFactory) {
        var instructions = this.viewFactory.viewFactory.instructions;
        var instructionIds = Object.keys(instructions);
        for (var i = 0; i < instructionIds.length; i++) {
          var expressions = instructions[instructionIds[i]].expressions;
          if (expressions) {
            for (var ii = 0; i < expressions.length; i++) {
              if (expressions[ii].targetProperty === 'matcher') {
                var matcherBinding = expressions[ii];
                expressions.splice(ii, 1);
                return matcherBinding;
              }
            }
          }
        }
      }

      return undefined;
    };

    Repeat.prototype.viewCount = function viewCount() {
      return this.viewSlot.children.length;
    };

    Repeat.prototype.views = function views() {
      return this.viewSlot.children;
    };

    Repeat.prototype.view = function view(index) {
      return this.viewSlot.children[index];
    };

    Repeat.prototype.matcher = function matcher() {
      return this.matcherBinding ? this.matcherBinding.sourceExpression.evaluate(this.scope, this.matcherBinding.lookupFunctions) : null;
    };

    Repeat.prototype.addView = function addView(bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.add(view);
    };

    Repeat.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.insert(index, view);
    };

    Repeat.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      this.viewSlot.move(sourceIndex, targetIndex);
    };

    Repeat.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      return this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Repeat.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
    };

    Repeat.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
    };

    Repeat.prototype.updateBindings = function updateBindings(view) {
      var j = view.bindings.length;
      while (j--) {
        (0, _repeatUtilities.updateOneTimeBinding)(view.bindings[j]);
      }
      j = view.controllers.length;
      while (j--) {
        var k = view.controllers[j].boundProperties.length;
        while (k--) {
          var binding = view.controllers[j].boundProperties[k].binding;
          (0, _repeatUtilities.updateOneTimeBinding)(binding);
        }
      }
    };

    return Repeat;
  }(_abstractRepeater.AbstractRepeater), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'items', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'local', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'key', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat-strategy-locator',['exports', './null-repeat-strategy', './array-repeat-strategy', './map-repeat-strategy', './set-repeat-strategy', './number-repeat-strategy'], function (exports, _nullRepeatStrategy, _arrayRepeatStrategy, _mapRepeatStrategy, _setRepeatStrategy, _numberRepeatStrategy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RepeatStrategyLocator = undefined;

  

  var RepeatStrategyLocator = exports.RepeatStrategyLocator = function () {
    function RepeatStrategyLocator() {
      

      this.matchers = [];
      this.strategies = [];

      this.addStrategy(function (items) {
        return items === null || items === undefined;
      }, new _nullRepeatStrategy.NullRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Array;
      }, new _arrayRepeatStrategy.ArrayRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Map;
      }, new _mapRepeatStrategy.MapRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Set;
      }, new _setRepeatStrategy.SetRepeatStrategy());
      this.addStrategy(function (items) {
        return typeof items === 'number';
      }, new _numberRepeatStrategy.NumberRepeatStrategy());
    }

    RepeatStrategyLocator.prototype.addStrategy = function addStrategy(matcher, strategy) {
      this.matchers.push(matcher);
      this.strategies.push(strategy);
    };

    RepeatStrategyLocator.prototype.getStrategy = function getStrategy(items) {
      var matchers = this.matchers;

      for (var i = 0, ii = matchers.length; i < ii; ++i) {
        if (matchers[i](items)) {
          return this.strategies[i];
        }
      }

      return null;
    };

    return RepeatStrategyLocator;
  }();
});
define('aurelia-templating-resources/null-repeat-strategy',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var NullRepeatStrategy = exports.NullRepeatStrategy = function () {
    function NullRepeatStrategy() {
      
    }

    NullRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      repeat.removeAllViews(true);
    };

    NullRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {};

    return NullRepeatStrategy;
  }();
});
define('aurelia-templating-resources/array-repeat-strategy',['exports', './repeat-utilities', 'aurelia-binding'], function (exports, _repeatUtilities, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ArrayRepeatStrategy = undefined;

  

  var ArrayRepeatStrategy = exports.ArrayRepeatStrategy = function () {
    function ArrayRepeatStrategy() {
      
    }

    ArrayRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getArrayObserver(items);
    };

    ArrayRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var itemsLength = items.length;

      if (!items || itemsLength === 0) {
        repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        return;
      }

      var children = repeat.views();
      var viewsLength = children.length;

      if (viewsLength === 0) {
        this._standardProcessInstanceChanged(repeat, items);
        return;
      }

      if (repeat.viewsRequireLifecycle) {
        var childrenSnapshot = children.slice(0);
        var itemNameInBindingContext = repeat.local;
        var matcher = repeat.matcher();

        var itemsPreviouslyInViews = [];
        var viewsToRemove = [];

        for (var index = 0; index < viewsLength; index++) {
          var view = childrenSnapshot[index];
          var oldItem = view.bindingContext[itemNameInBindingContext];

          if ((0, _repeatUtilities.indexOf)(items, oldItem, matcher) === -1) {
            viewsToRemove.push(view);
          } else {
            itemsPreviouslyInViews.push(oldItem);
          }
        }

        var updateViews = void 0;
        var removePromise = void 0;

        if (itemsPreviouslyInViews.length > 0) {
          removePromise = repeat.removeViews(viewsToRemove, true, !repeat.viewsRequireLifecycle);
          updateViews = function updateViews() {
            for (var _index = 0; _index < itemsLength; _index++) {
              var item = items[_index];
              var indexOfView = (0, _repeatUtilities.indexOf)(itemsPreviouslyInViews, item, matcher, _index);
              var _view = void 0;

              if (indexOfView === -1) {
                var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_index], _index, itemsLength);
                repeat.insertView(_index, overrideContext.bindingContext, overrideContext);

                itemsPreviouslyInViews.splice(_index, 0, undefined);
              } else if (indexOfView === _index) {
                _view = children[indexOfView];
                itemsPreviouslyInViews[indexOfView] = undefined;
              } else {
                _view = children[indexOfView];
                repeat.moveView(indexOfView, _index);
                itemsPreviouslyInViews.splice(indexOfView, 1);
                itemsPreviouslyInViews.splice(_index, 0, undefined);
              }

              if (_view) {
                (0, _repeatUtilities.updateOverrideContext)(_view.overrideContext, _index, itemsLength);
              }
            }

            _this._inPlaceProcessItems(repeat, items);
          };
        } else {
          removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
          updateViews = function updateViews() {
            return _this._standardProcessInstanceChanged(repeat, items);
          };
        }

        if (removePromise instanceof Promise) {
          removePromise.then(updateViews);
        } else {
          updateViews();
        }
      } else {
        this._inPlaceProcessItems(repeat, items);
      }
    };

    ArrayRepeatStrategy.prototype._standardProcessInstanceChanged = function _standardProcessInstanceChanged(repeat, items) {
      for (var i = 0, ii = items.length; i < ii; i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[i], i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype._inPlaceProcessItems = function _inPlaceProcessItems(repeat, items) {
      var itemsLength = items.length;
      var viewsLength = repeat.viewCount();

      while (viewsLength > itemsLength) {
        viewsLength--;
        repeat.removeView(viewsLength, true, !repeat.viewsRequireLifecycle);
      }

      var local = repeat.local;

      for (var i = 0; i < viewsLength; i++) {
        var view = repeat.view(i);
        var last = i === itemsLength - 1;
        var middle = i !== 0 && !last;

        if (view.bindingContext[local] === items[i] && view.overrideContext.$middle === middle && view.overrideContext.$last === last) {
          continue;
        }

        view.bindingContext[local] = items[i];
        view.overrideContext.$middle = middle;
        view.overrideContext.$last = last;
        repeat.updateBindings(view);
      }

      for (var _i = viewsLength; _i < itemsLength; _i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_i], _i, itemsLength);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, array, splices) {
      var _this2 = this;

      if (repeat.__queuedSplices) {
        for (var i = 0, ii = splices.length; i < ii; ++i) {
          var _splices$i = splices[i],
              index = _splices$i.index,
              removed = _splices$i.removed,
              addedCount = _splices$i.addedCount;

          (0, _aureliaBinding.mergeSplice)(repeat.__queuedSplices, index, removed, addedCount);
        }

        repeat.__array = array.slice(0);
        return;
      }

      var maybePromise = this._runSplices(repeat, array.slice(0), splices);
      if (maybePromise instanceof Promise) {
        var queuedSplices = repeat.__queuedSplices = [];

        var runQueuedSplices = function runQueuedSplices() {
          if (!queuedSplices.length) {
            repeat.__queuedSplices = undefined;
            repeat.__array = undefined;
            return;
          }

          var nextPromise = _this2._runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
          queuedSplices = repeat.__queuedSplices = [];
          nextPromise.then(runQueuedSplices);
        };

        maybePromise.then(runQueuedSplices);
      }
    };

    ArrayRepeatStrategy.prototype._runSplices = function _runSplices(repeat, array, splices) {
      var _this3 = this;

      var removeDelta = 0;
      var rmPromises = [];

      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var removed = splice.removed;

        for (var j = 0, jj = removed.length; j < jj; ++j) {
          var viewOrPromise = repeat.removeView(splice.index + removeDelta + rmPromises.length, true);
          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }
        }
        removeDelta -= splice.addedCount;
      }

      if (rmPromises.length > 0) {
        return Promise.all(rmPromises).then(function () {
          var spliceIndexLow = _this3._handleAddedSplices(repeat, array, splices);
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);
        });
      }

      var spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);

      return undefined;
    };

    ArrayRepeatStrategy.prototype._handleAddedSplices = function _handleAddedSplices(repeat, array, splices) {
      var spliceIndex = void 0;
      var spliceIndexLow = void 0;
      var arrayLength = array.length;
      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var addIndex = spliceIndex = splice.index;
        var end = splice.index + splice.addedCount;

        if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
          spliceIndexLow = spliceIndex;
        }

        for (; addIndex < end; ++addIndex) {
          var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, array[addIndex], addIndex, arrayLength);
          repeat.insertView(addIndex, overrideContext.bindingContext, overrideContext);
        }
      }

      return spliceIndexLow;
    };

    return ArrayRepeatStrategy;
  }();
});
define('aurelia-templating-resources/repeat-utilities',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.updateOverrideContexts = updateOverrideContexts;
  exports.createFullOverrideContext = createFullOverrideContext;
  exports.updateOverrideContext = updateOverrideContext;
  exports.getItemsSourceExpression = getItemsSourceExpression;
  exports.unwrapExpression = unwrapExpression;
  exports.isOneTime = isOneTime;
  exports.updateOneTimeBinding = updateOneTimeBinding;
  exports.indexOf = indexOf;


  var oneTime = _aureliaBinding.bindingMode.oneTime;

  function updateOverrideContexts(views, startIndex) {
    var length = views.length;

    if (startIndex > 0) {
      startIndex = startIndex - 1;
    }

    for (; startIndex < length; ++startIndex) {
      updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
    }
  }

  function createFullOverrideContext(repeat, data, index, length, key) {
    var bindingContext = {};
    var overrideContext = (0, _aureliaBinding.createOverrideContext)(bindingContext, repeat.scope.overrideContext);

    if (typeof key !== 'undefined') {
      bindingContext[repeat.key] = key;
      bindingContext[repeat.value] = data;
    } else {
      bindingContext[repeat.local] = data;
    }
    updateOverrideContext(overrideContext, index, length);
    return overrideContext;
  }

  function updateOverrideContext(overrideContext, index, length) {
    var first = index === 0;
    var last = index === length - 1;
    var even = index % 2 === 0;

    overrideContext.$index = index;
    overrideContext.$first = first;
    overrideContext.$last = last;
    overrideContext.$middle = !(first || last);
    overrideContext.$odd = !even;
    overrideContext.$even = even;
  }

  function getItemsSourceExpression(instruction, attrName) {
    return instruction.behaviorInstructions.filter(function (bi) {
      return bi.originalAttrName === attrName;
    })[0].attributes.items.sourceExpression;
  }

  function unwrapExpression(expression) {
    var unwrapped = false;
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      expression = expression.expression;
    }
    while (expression instanceof _aureliaBinding.ValueConverter) {
      expression = expression.expression;
      unwrapped = true;
    }
    return unwrapped ? expression : null;
  }

  function isOneTime(expression) {
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      if (expression.name === 'oneTime') {
        return true;
      }
      expression = expression.expression;
    }
    return false;
  }

  function updateOneTimeBinding(binding) {
    if (binding.call && binding.mode === oneTime) {
      binding.call(_aureliaBinding.sourceContext);
    } else if (binding.updateOneTimeBindings) {
      binding.updateOneTimeBindings();
    }
  }

  function indexOf(array, item, matcher, startIndex) {
    if (!matcher) {
      return array.indexOf(item);
    }
    var length = array.length;
    for (var index = startIndex || 0; index < length; index++) {
      if (matcher(array[index], item)) {
        return index;
      }
    }
    return -1;
  }
});
define('aurelia-templating-resources/map-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MapRepeatStrategy = undefined;

  

  var MapRepeatStrategy = exports.MapRepeatStrategy = function () {
    function MapRepeatStrategy() {
      
    }

    MapRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getMapObserver(items);
    };

    MapRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    MapRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value, key) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size, key);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    MapRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, map, records) {
      var key = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var addIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        key = record.key;
        switch (record.type) {
          case 'update':
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), removeIndex, map.size, key);
            repeat.insertView(removeIndex, overrideContext.bindingContext, overrideContext);
            break;
          case 'add':
            addIndex = repeat.viewCount() <= map.size - 1 ? repeat.viewCount() : map.size - 1;
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), addIndex, map.size, key);
            repeat.insertView(map.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            if (record.oldValue === undefined) {
              return;
            }
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    MapRepeatStrategy.prototype._getViewIndexByKey = function _getViewIndexByKey(repeat, key) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.key] === key) {
          return i;
        }
      }

      return undefined;
    };

    return MapRepeatStrategy;
  }();
});
define('aurelia-templating-resources/set-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SetRepeatStrategy = undefined;

  

  var SetRepeatStrategy = exports.SetRepeatStrategy = function () {
    function SetRepeatStrategy() {
      
    }

    SetRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getSetObserver(items);
    };

    SetRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    SetRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    SetRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, set, records) {
      var value = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        value = record.value;
        switch (record.type) {
          case 'add':
            var size = Math.max(set.size - 1, 0);
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, size, set.size);
            repeat.insertView(size, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            removeIndex = this._getViewIndexByValue(repeat, value);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    SetRepeatStrategy.prototype._getViewIndexByValue = function _getViewIndexByValue(repeat, value) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.local] === value) {
          return i;
        }
      }

      return undefined;
    };

    return SetRepeatStrategy;
  }();
});
define('aurelia-templating-resources/number-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NumberRepeatStrategy = undefined;

  

  var NumberRepeatStrategy = exports.NumberRepeatStrategy = function () {
    function NumberRepeatStrategy() {
      
    }

    NumberRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver() {
      return null;
    };

    NumberRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, value) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, value);
        });
        return;
      }
      this._standardProcessItems(repeat, value);
    };

    NumberRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, value) {
      var childrenLength = repeat.viewCount();
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var viewsToRemove = void 0;

      value = Math.floor(value);
      viewsToRemove = childrenLength - value;

      if (viewsToRemove > 0) {
        if (viewsToRemove > childrenLength) {
          viewsToRemove = childrenLength;
        }

        for (i = 0, ii = viewsToRemove; i < ii; ++i) {
          repeat.removeView(childrenLength - (i + 1), true, !repeat.viewsRequireLifecycle);
        }

        return;
      }

      for (i = childrenLength, ii = value; i < ii; ++i) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, i, i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }

      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
    };

    return NumberRepeatStrategy;
  }();
});
define('aurelia-templating-resources/analyze-view-factory',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.viewsRequireLifecycle = viewsRequireLifecycle;
  var lifecycleOptionalBehaviors = exports.lifecycleOptionalBehaviors = ['focus', 'if', 'repeat', 'show', 'with'];

  function behaviorRequiresLifecycle(instruction) {
    var t = instruction.type;
    var name = t.elementName !== null ? t.elementName : t.attributeName;
    return lifecycleOptionalBehaviors.indexOf(name) === -1 && (t.handlesAttached || t.handlesBind || t.handlesCreated || t.handlesDetached || t.handlesUnbind) || t.viewFactory && viewsRequireLifecycle(t.viewFactory) || instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function targetRequiresLifecycle(instruction) {
    var behaviors = instruction.behaviorInstructions;
    if (behaviors) {
      var i = behaviors.length;
      while (i--) {
        if (behaviorRequiresLifecycle(behaviors[i])) {
          return true;
        }
      }
    }

    return instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function viewsRequireLifecycle(viewFactory) {
    if ('_viewsRequireLifecycle' in viewFactory) {
      return viewFactory._viewsRequireLifecycle;
    }

    viewFactory._viewsRequireLifecycle = false;

    if (viewFactory.viewFactory) {
      viewFactory._viewsRequireLifecycle = viewsRequireLifecycle(viewFactory.viewFactory);
      return viewFactory._viewsRequireLifecycle;
    }

    if (viewFactory.template.querySelector('.au-animate')) {
      viewFactory._viewsRequireLifecycle = true;
      return true;
    }

    for (var id in viewFactory.instructions) {
      if (targetRequiresLifecycle(viewFactory.instructions[id])) {
        viewFactory._viewsRequireLifecycle = true;
        return true;
      }
    }

    viewFactory._viewsRequireLifecycle = false;
    return false;
  }
});
define('aurelia-templating-resources/abstract-repeater',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var AbstractRepeater = exports.AbstractRepeater = function () {
    function AbstractRepeater(options) {
      

      Object.assign(this, {
        local: 'items',
        viewsRequireLifecycle: true
      }, options);
    }

    AbstractRepeater.prototype.viewCount = function viewCount() {
      throw new Error('subclass must implement `viewCount`');
    };

    AbstractRepeater.prototype.views = function views() {
      throw new Error('subclass must implement `views`');
    };

    AbstractRepeater.prototype.view = function view(index) {
      throw new Error('subclass must implement `view`');
    };

    AbstractRepeater.prototype.matcher = function matcher() {
      throw new Error('subclass must implement `matcher`');
    };

    AbstractRepeater.prototype.addView = function addView(bindingContext, overrideContext) {
      throw new Error('subclass must implement `addView`');
    };

    AbstractRepeater.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      throw new Error('subclass must implement `insertView`');
    };

    AbstractRepeater.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      throw new Error('subclass must implement `moveView`');
    };

    AbstractRepeater.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeAllViews`');
    };

    AbstractRepeater.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.updateBindings = function updateBindings(view) {
      throw new Error('subclass must implement `updateBindings`');
    };

    return AbstractRepeater;
  }();
});
define('aurelia-templating-resources/show',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Show = undefined;

  

  var _dec, _dec2, _class;

  var Show = exports.Show = (_dec = (0, _aureliaTemplating.customAttribute)('show'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Show(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Show.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Show.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Show.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Show;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/aurelia-hide-style',['exports', 'aurelia-pal'], function (exports, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.aureliaHideClassName = undefined;
  exports.injectAureliaHideStyleAtHead = injectAureliaHideStyleAtHead;
  exports.injectAureliaHideStyleAtBoundary = injectAureliaHideStyleAtBoundary;
  var aureliaHideClassName = exports.aureliaHideClassName = 'aurelia-hide';

  var aureliaHideClass = '.' + aureliaHideClassName + ' { display:none !important; }';

  function injectAureliaHideStyleAtHead() {
    _aureliaPal.DOM.injectStyles(aureliaHideClass);
  }

  function injectAureliaHideStyleAtBoundary(domBoundary) {
    if (_aureliaPal.FEATURE.shadowDOM && domBoundary && !domBoundary.hasAureliaHideStyle) {
      domBoundary.hasAureliaHideStyle = true;
      _aureliaPal.DOM.injectStyles(aureliaHideClass, domBoundary);
    }
  }
});
define('aurelia-templating-resources/hide',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Hide = undefined;

  

  var _dec, _dec2, _class;

  var Hide = exports.Hide = (_dec = (0, _aureliaTemplating.customAttribute)('hide'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Hide(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Hide.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Hide.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Hide.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Hide;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/sanitize-html',['exports', 'aurelia-binding', 'aurelia-dependency-injection', './html-sanitizer'], function (exports, _aureliaBinding, _aureliaDependencyInjection, _htmlSanitizer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SanitizeHTMLValueConverter = undefined;

  

  var _dec, _dec2, _class;

  var SanitizeHTMLValueConverter = exports.SanitizeHTMLValueConverter = (_dec = (0, _aureliaBinding.valueConverter)('sanitizeHTML'), _dec2 = (0, _aureliaDependencyInjection.inject)(_htmlSanitizer.HTMLSanitizer), _dec(_class = _dec2(_class = function () {
    function SanitizeHTMLValueConverter(sanitizer) {
      

      this.sanitizer = sanitizer;
    }

    SanitizeHTMLValueConverter.prototype.toView = function toView(untrustedMarkup) {
      if (untrustedMarkup === null || untrustedMarkup === undefined) {
        return null;
      }

      return this.sanitizer.sanitize(untrustedMarkup);
    };

    return SanitizeHTMLValueConverter;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/html-sanitizer',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  var HTMLSanitizer = exports.HTMLSanitizer = function () {
    function HTMLSanitizer() {
      
    }

    HTMLSanitizer.prototype.sanitize = function sanitize(input) {
      return input.replace(SCRIPT_REGEX, '');
    };

    return HTMLSanitizer;
  }();
});
define('aurelia-templating-resources/replaceable',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Replaceable = undefined;

  

  var _dec, _dec2, _class;

  var Replaceable = exports.Replaceable = (_dec = (0, _aureliaTemplating.customAttribute)('replaceable'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function Replaceable(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.view = null;
    }

    Replaceable.prototype.bind = function bind(bindingContext, overrideContext) {
      if (this.view === null) {
        this.view = this.viewFactory.create();
        this.viewSlot.add(this.view);
      }

      this.view.bind(bindingContext, overrideContext);
    };

    Replaceable.prototype.unbind = function unbind() {
      this.view.unbind();
    };

    return Replaceable;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/focus',['exports', 'aurelia-templating', 'aurelia-binding', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaBinding, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Focus = undefined;

  

  var _dec, _dec2, _class;

  var Focus = exports.Focus = (_dec = (0, _aureliaTemplating.customAttribute)('focus', _aureliaBinding.bindingMode.twoWay), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTaskQueue.TaskQueue), _dec(_class = _dec2(_class = function () {
    function Focus(element, taskQueue) {
      

      this.element = element;
      this.taskQueue = taskQueue;
      this.isAttached = false;
      this.needsApply = false;
    }

    Focus.prototype.valueChanged = function valueChanged(newValue) {
      if (this.isAttached) {
        this._apply();
      } else {
        this.needsApply = true;
      }
    };

    Focus.prototype._apply = function _apply() {
      var _this = this;

      if (this.value) {
        this.taskQueue.queueMicroTask(function () {
          if (_this.value) {
            _this.element.focus();
          }
        });
      } else {
        this.element.blur();
      }
    };

    Focus.prototype.attached = function attached() {
      this.isAttached = true;
      if (this.needsApply) {
        this.needsApply = false;
        this._apply();
      }
      this.element.addEventListener('focus', this);
      this.element.addEventListener('blur', this);
    };

    Focus.prototype.detached = function detached() {
      this.isAttached = false;
      this.element.removeEventListener('focus', this);
      this.element.removeEventListener('blur', this);
    };

    Focus.prototype.handleEvent = function handleEvent(e) {
      if (e.type === 'focus') {
        this.value = true;
      } else if (_aureliaPal.DOM.activeElement !== this.element) {
        this.value = false;
      }
    };

    return Focus;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/css-resource',['exports', 'aurelia-templating', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-path', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaLoader, _aureliaDependencyInjection, _aureliaPath, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createCSSResource = _createCSSResource;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  var cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

  function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
      throw new Error('Failed loading required CSS file: ' + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
      var quote = p1.charAt(0);
      if (quote === '\'' || quote === '"') {
        p1 = p1.substr(1, p1.length - 2);
      }
      return 'url(\'' + (0, _aureliaPath.relativeToFile)(p1, address) + '\')';
    });
  }

  var CSSResource = function () {
    function CSSResource(address) {
      

      this.address = address;
      this._scoped = null;
      this._global = false;
      this._alreadyGloballyInjected = false;
    }

    CSSResource.prototype.initialize = function initialize(container, target) {
      this._scoped = new target(this);
    };

    CSSResource.prototype.register = function register(registry, name) {
      if (name === 'scoped') {
        registry.registerViewEngineHooks(this._scoped);
      } else {
        this._global = true;
      }
    };

    CSSResource.prototype.load = function load(container) {
      var _this = this;

      return container.get(_aureliaLoader.Loader).loadText(this.address).catch(function (err) {
        return null;
      }).then(function (text) {
        text = fixupCSSUrls(_this.address, text);
        _this._scoped.css = text;
        if (_this._global) {
          _this._alreadyGloballyInjected = true;
          _aureliaPal.DOM.injectStyles(text);
        }
      });
    };

    return CSSResource;
  }();

  var CSSViewEngineHooks = function () {
    function CSSViewEngineHooks(owner) {
      

      this.owner = owner;
      this.css = null;
    }

    CSSViewEngineHooks.prototype.beforeCompile = function beforeCompile(content, resources, instruction) {
      if (instruction.targetShadowDOM) {
        _aureliaPal.DOM.injectStyles(this.css, content, true);
      } else if (_aureliaPal.FEATURE.scopedCSS) {
        var styleNode = _aureliaPal.DOM.injectStyles(this.css, content, true);
        styleNode.setAttribute('scoped', 'scoped');
      } else if (this._global && !this.owner._alreadyGloballyInjected) {
        _aureliaPal.DOM.injectStyles(this.css);
        this.owner._alreadyGloballyInjected = true;
      }
    };

    return CSSViewEngineHooks;
  }();

  function _createCSSResource(address) {
    var _dec, _class;

    var ViewCSS = (_dec = (0, _aureliaTemplating.resource)(new CSSResource(address)), _dec(_class = function (_CSSViewEngineHooks) {
      _inherits(ViewCSS, _CSSViewEngineHooks);

      function ViewCSS() {
        

        return _possibleConstructorReturn(this, _CSSViewEngineHooks.apply(this, arguments));
      }

      return ViewCSS;
    }(CSSViewEngineHooks)) || _class);

    return ViewCSS;
  }
});
define('aurelia-templating-resources/attr-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AttrBindingBehavior = undefined;

  

  var AttrBindingBehavior = exports.AttrBindingBehavior = function () {
    function AttrBindingBehavior() {
      
    }

    AttrBindingBehavior.prototype.bind = function bind(binding, source) {
      binding.targetObserver = new _aureliaBinding.DataAttributeObserver(binding.target, binding.targetProperty);
    };

    AttrBindingBehavior.prototype.unbind = function unbind(binding, source) {};

    return AttrBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-mode-behaviors',['exports', 'aurelia-binding', 'aurelia-metadata'], function (exports, _aureliaBinding, _aureliaMetadata) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TwoWayBindingBehavior = exports.OneWayBindingBehavior = exports.OneTimeBindingBehavior = undefined;

  

  var _dec, _class, _dec2, _class2, _dec3, _class3;

  var modeBindingBehavior = {
    bind: function bind(binding, source, lookupFunctions) {
      binding.originalMode = binding.mode;
      binding.mode = this.mode;
    },
    unbind: function unbind(binding, source) {
      binding.mode = binding.originalMode;
      binding.originalMode = null;
    }
  };

  var OneTimeBindingBehavior = exports.OneTimeBindingBehavior = (_dec = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec(_class = function OneTimeBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneTime;
  }) || _class);
  var OneWayBindingBehavior = exports.OneWayBindingBehavior = (_dec2 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec2(_class2 = function OneWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneWay;
  }) || _class2);
  var TwoWayBindingBehavior = exports.TwoWayBindingBehavior = (_dec3 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec3(_class3 = function TwoWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.twoWay;
  }) || _class3);
});
define('aurelia-templating-resources/throttle-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ThrottleBindingBehavior = undefined;

  

  function throttle(newValue) {
    var _this = this;

    var state = this.throttleState;
    var elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
      state.last = +new Date();
      this.throttledMethod(newValue);
      return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
      state.timeoutId = setTimeout(function () {
        state.timeoutId = null;
        state.last = +new Date();
        _this.throttledMethod(state.newValue);
      }, state.delay - elapsed);
    }
  }

  var ThrottleBindingBehavior = exports.ThrottleBindingBehavior = function () {
    function ThrottleBindingBehavior() {
      
    }

    ThrottleBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToThrottle = 'updateTarget';
      if (binding.callSource) {
        methodToThrottle = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToThrottle = 'updateSource';
      }

      binding.throttledMethod = binding[methodToThrottle];
      binding.throttledMethod.originalName = methodToThrottle;

      binding[methodToThrottle] = throttle;

      binding.throttleState = {
        delay: delay,
        last: 0,
        timeoutId: null
      };
    };

    ThrottleBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.throttledMethod.originalName;
      binding[methodToRestore] = binding.throttledMethod;
      binding.throttledMethod = null;
      clearTimeout(binding.throttleState.timeoutId);
      binding.throttleState = null;
    };

    return ThrottleBindingBehavior;
  }();
});
define('aurelia-templating-resources/debounce-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DebounceBindingBehavior = undefined;

  

  function debounce(newValue) {
    var _this = this;

    var state = this.debounceState;
    if (state.immediate) {
      state.immediate = false;
      this.debouncedMethod(newValue);
      return;
    }
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(function () {
      return _this.debouncedMethod(newValue);
    }, state.delay);
  }

  var DebounceBindingBehavior = exports.DebounceBindingBehavior = function () {
    function DebounceBindingBehavior() {
      
    }

    DebounceBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToDebounce = 'updateTarget';
      if (binding.callSource) {
        methodToDebounce = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToDebounce = 'updateSource';
      }

      binding.debouncedMethod = binding[methodToDebounce];
      binding.debouncedMethod.originalName = methodToDebounce;

      binding[methodToDebounce] = debounce;

      binding.debounceState = {
        delay: delay,
        timeoutId: null,
        immediate: methodToDebounce === 'updateTarget' };
    };

    DebounceBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.debouncedMethod.originalName;
      binding[methodToRestore] = binding.debouncedMethod;
      binding.debouncedMethod = null;
      clearTimeout(binding.debounceState.timeoutId);
      binding.debounceState = null;
    };

    return DebounceBindingBehavior;
  }();
});
define('aurelia-templating-resources/self-binding-behavior',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  function findOriginalEventTarget(event) {
    return event.path && event.path[0] || event.deepPath && event.deepPath[0] || event.target;
  }

  function handleSelfEvent(event) {
    var target = findOriginalEventTarget(event);
    if (this.target !== target) return;
    this.selfEventCallSource(event);
  }

  var SelfBindingBehavior = exports.SelfBindingBehavior = function () {
    function SelfBindingBehavior() {
      
    }

    SelfBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.callSource || !binding.targetEvent) throw new Error('Self binding behavior only supports event.');
      binding.selfEventCallSource = binding.callSource;
      binding.callSource = handleSelfEvent;
    };

    SelfBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.callSource = binding.selfEventCallSource;
      binding.selfEventCallSource = null;
    };

    return SelfBindingBehavior;
  }();
});
define('aurelia-templating-resources/signal-binding-behavior',['exports', './binding-signaler'], function (exports, _bindingSignaler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SignalBindingBehavior = undefined;

  

  var SignalBindingBehavior = exports.SignalBindingBehavior = function () {
    SignalBindingBehavior.inject = function inject() {
      return [_bindingSignaler.BindingSignaler];
    };

    function SignalBindingBehavior(bindingSignaler) {
      

      this.signals = bindingSignaler.signals;
    }

    SignalBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.updateTarget) {
        throw new Error('Only property bindings and string interpolation bindings can be signaled.  Trigger, delegate and call bindings cannot be signaled.');
      }
      if (arguments.length === 3) {
        var name = arguments[2];
        var bindings = this.signals[name] || (this.signals[name] = []);
        bindings.push(binding);
        binding.signalName = name;
      } else if (arguments.length > 3) {
        var names = Array.prototype.slice.call(arguments, 2);
        var i = names.length;
        while (i--) {
          var _name = names[i];
          var _bindings = this.signals[_name] || (this.signals[_name] = []);
          _bindings.push(binding);
        }
        binding.signalName = names;
      } else {
        throw new Error('Signal name is required.');
      }
    };

    SignalBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var name = binding.signalName;
      binding.signalName = null;
      if (Array.isArray(name)) {
        var names = name;
        var i = names.length;
        while (i--) {
          var n = names[i];
          var bindings = this.signals[n];
          bindings.splice(bindings.indexOf(binding), 1);
        }
      } else {
        var _bindings2 = this.signals[name];
        _bindings2.splice(_bindings2.indexOf(binding), 1);
      }
    };

    return SignalBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-signaler',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BindingSignaler = undefined;

  

  var BindingSignaler = exports.BindingSignaler = function () {
    function BindingSignaler() {
      

      this.signals = {};
    }

    BindingSignaler.prototype.signal = function signal(name) {
      var bindings = this.signals[name];
      if (!bindings) {
        return;
      }
      var i = bindings.length;
      while (i--) {
        bindings[i].call(_aureliaBinding.sourceContext);
      }
    };

    return BindingSignaler;
  }();
});
define('aurelia-templating-resources/update-trigger-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UpdateTriggerBindingBehavior = undefined;

  

  var _class, _temp;

  var eventNamesRequired = 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">';
  var notApplicableMessage = 'The updateTrigger binding behavior can only be applied to two-way bindings on input/select elements.';

  var UpdateTriggerBindingBehavior = exports.UpdateTriggerBindingBehavior = (_temp = _class = function () {
    function UpdateTriggerBindingBehavior(eventManager) {
      

      this.eventManager = eventManager;
    }

    UpdateTriggerBindingBehavior.prototype.bind = function bind(binding, source) {
      for (var _len = arguments.length, events = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        events[_key - 2] = arguments[_key];
      }

      if (events.length === 0) {
        throw new Error(eventNamesRequired);
      }
      if (binding.mode !== _aureliaBinding.bindingMode.twoWay) {
        throw new Error(notApplicableMessage);
      }

      var targetObserver = binding.observerLocator.getObserver(binding.target, binding.targetProperty);
      if (!targetObserver.handler) {
        throw new Error(notApplicableMessage);
      }
      binding.targetObserver = targetObserver;

      targetObserver.originalHandler = binding.targetObserver.handler;

      var handler = this.eventManager.createElementHandler(events);
      targetObserver.handler = handler;
    };

    UpdateTriggerBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.targetObserver.handler = binding.targetObserver.originalHandler;
      binding.targetObserver.originalHandler = null;
    };

    return UpdateTriggerBindingBehavior;
  }(), _class.inject = [_aureliaBinding.EventManager], _temp);
});
define('aurelia-templating-resources/html-resource-plugin',['exports', 'aurelia-templating', './dynamic-element'], function (exports, _aureliaTemplating, _dynamicElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getElementName = getElementName;
  exports.configure = configure;
  function getElementName(address) {
    return (/([^\/^\?]+)\.html/i.exec(address)[1].toLowerCase()
    );
  }

  function configure(config) {
    var viewEngine = config.container.get(_aureliaTemplating.ViewEngine);
    var loader = config.aurelia.loader;

    viewEngine.addResourcePlugin('.html', {
      'fetch': function fetch(address) {
        return loader.loadTemplate(address).then(function (registryEntry) {
          var _ref;

          var bindable = registryEntry.template.getAttribute('bindable');
          var elementName = getElementName(address);

          if (bindable) {
            bindable = bindable.split(',').map(function (x) {
              return x.trim();
            });
            registryEntry.template.removeAttribute('bindable');
          } else {
            bindable = [];
          }

          return _ref = {}, _ref[elementName] = (0, _dynamicElement._createDynamicElement)(elementName, address, bindable), _ref;
        });
      }
    });
  }
});
define('aurelia-templating-resources/dynamic-element',['exports', 'aurelia-templating'], function (exports, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createDynamicElement = _createDynamicElement;

  

  function _createDynamicElement(name, viewUrl, bindableNames) {
    var _dec, _dec2, _class;

    var DynamicElement = (_dec = (0, _aureliaTemplating.customElement)(name), _dec2 = (0, _aureliaTemplating.useView)(viewUrl), _dec(_class = _dec2(_class = function () {
      function DynamicElement() {
        
      }

      DynamicElement.prototype.bind = function bind(bindingContext) {
        this.$parent = bindingContext;
      };

      return DynamicElement;
    }()) || _class) || _class);

    for (var i = 0, ii = bindableNames.length; i < ii; ++i) {
      (0, _aureliaTemplating.bindable)(bindableNames[i])(DynamicElement);
    }
    return DynamicElement;
  }
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/header\"></require>\n    <require from=\"components/board\"></require>\n    <require from=\"components/controls\"></require>\n    <require from=\"components/solving\"></require>\n    <require from=\"components/footer.html\"></require>\n    <div class=\"dragArea\"\n         mousemove.delegate=\"ds.doDrag($event)\"\n         touchmove.delegate=\"ds.doDrag($event)\"\n         mouseup.delegate=\"ds.stopDrag($event)\"\n         touchend.delegate=\"ds.stopDrag($event)\">\n        <header></header>\n        <board></board>\n        <controls></controls>\n        <solving></solving>\n        <footer></footer>\n    </div>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = ".dragArea, body, html {\n    width                : 100%;\n    height               : 100%;\n    background-color     : #222;\n    font-family          : TrebuchetMS, sans-serif;\n    color                : #fff;\n    -webkit-touch-callout: none;\n    -webkit-user-select  : none;\n    -khtml-user-select   : none;\n    -moz-user-select     : none;\n    -ms-user-select      : none;\n    user-select          : none;\n}\n\n.dragArea {\n    flex           : 1 0 auto;\n    display        : flex;\n    flex-direction : column;\n    justify-content: flex-start;\n    align-items    : center;\n    overflow       : hidden;\n}\n@media (min-height: 700px) {\n    .dragArea {\n        justify-content: center;\n    }\n}\n\n.r {\n    float: right;\n}\n\n.l {\n    float: left;\n}\n\n.relContainer {\n    position: relative;\n}\n\n.rounded {\n    border-radius: 100px;\n}\n\n.clearFix {\n    clear: both;\n}\n\n.hidden {\n    display: none;\n}\n\n.invisible {\n    visibility: hidden;\n}\n\n.pushTop {\n    margin-top: 12px;\n}\n\n.pushLeft {\n    margin-left: 12px;\n}\n\n.pushBottom {\n    margin-bottom: 12px;\n}\n\n.pushBottomMore {\n    margin-bottom: 24px;\n}\n\n.textAlignLeft {\n    text-align: left;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template class.bind=\"getBoardClasses(bs.newSolution)\"\n          css.bind=\"getBoardSizeCSS(bs.boardType)\">\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/pentominos\"></require>\n    <pentominos></pentominos>\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n"; });
define('text!components/controls.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/controls.css\"></require>\n    <div class=\"controls\"\n         if.bind=\"showSolutions(sls.solutions[bs.boardType].length)\">\n        <button class=\"button small\"\n                title=\"Show previous solution\"\n                disabled.bind=\"disablePreviousButton(sls.currentSolution)\"\n                click.delegate=\"showPreviousSolution()\"\n                touchstart.delegate=\"showPreviousSolution()\">\n         <icon class=\"fa fa-step-backward fa-lg\"></icon>\n        </button>\n        <div class.bind=\"getIndicatorClass(bs.solved)\"\n             innerhtml.bind=\"getIndicatorText(sls.currentSolution, sls.solutions[bs.boardType].length)\"\n             click.delegate=\"showFirstSolution()\"\n             touchstart.delegate=\"showFirstSolution()\">\n        </div>\n        <button class=\"button small\"\n                title=\"Show next solution\"\n                disabled.bind=\"disableNextButton(sls.currentSolution, sls.solutions[bs.boardType].length)\"\n                click.delegate=\"showNextSolution()\"\n                touchstart.delegate=\"showNextSolution()\">\n            <icon class=\"fa fa-step-forward fa-lg\"></icon>\n        </button>\n    </div>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = ".board {\n    display         : flex;\n    flex-direction  : column;\n    position        : relative;\n    background-color: lightgray;\n    border          : 5px solid darkgray;\n    transition      : all .3s ease;\n}\n\n.board.solved, .solved {\n    border-color      : lime;\n    -webkit-box-shadow: 0 0 30px 0 rgba(0, 255, 0, .5);\n    box-shadow        : 0 0 30px 0 rgba(0, 255, 0, .5);\n}\n"; });
define('text!components/footer.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/footer.css\"></require>\n    <a href=\"http://www.ashware.nl\"\n       target=\"_blank\"\n       class=\"r\">&copy;&nbsp;ashWare</a>\n    <!-- <span class='st_sharethis' displayText='ShareThis'></span> -->\n</template>"; });
define('text!components/controls.css', ['module'], function(module) { module.exports = ".controls {\n    width          : 320px;\n    height         : 40px;\n    display        : flex;\n    justify-content: center;\n    align-items    : center;\n}\n\n.button, .indicator {\n    height          : 30px;\n    line-height     : 30px;\n    font-family     : inherit;\n    background-color: transparent;\n    border          : none;\n    outline         : none;\n    color           : white;\n    font-size       : 14px;\n    padding         : 0 10px;\n    transition      : all .3s ease;\n    cursor          : pointer;\n}\n\n.indicator {\n    margin-left: 5px;\n}\n\n.indicator.solved {\n    border: 1px dotted lime;\n}\n\n.button.small {\n    width      : 40px;\n    height     : 30px;\n    line-height: 30px;\n}\n\n.button icon {\n    line-height: 30px;\n}\n\n.button:disabled {\n    cursor : not-allowed;\n    opacity: .2;\n}\n\n[class*='fa-step-'] {\n    vertical-align: 0;\n}\n"; });
define('text!components/header.html', ['module'], function(module) { module.exports = "<template css.bind=\"getHeaderSizeCss(bs.boardType)\">\n    <require from=\"components/header.css\"></require>\n    <require from=\"components/menu\"></require>\n    <menu></menu>\n    <h1>${title}</h1>\n</template>"; });
define('text!components/footer.css', ['module'], function(module) { module.exports = "footer {\n    display   : block;\n    width     : 100%;\n    position  : absolute;\n    padding   : 0 10px;\n    bottom    : 10px;\n    box-sizing: border-box;\n}\n\nfooter span {\n    color: #fff !important;\n}\n\nfooter a {\n    color          : #f2f2f2;\n    text-decoration: none;\n    font-size      : 12px;\n}\n"; });
define('text!components/header.css', ['module'], function(module) { module.exports = "header {\n    position: relative;\n    height  : 40px;\n}\n\nh1 {\n    font-family   : inherit;\n    font-size     : 21px;\n    letter-spacing: 1px;\n    text-align    : center;\n    line-height   : 0;\n    margin        : 20px 0 -20px;\n}\n"; });
define('text!components/menu.css', ['module'], function(module) { module.exports = ".hamburger {\n    position: absolute;\n    left    : 2px;\n    top     : 2px;\n    z-index : 100;\n}\n\n.hamburger .fa-bars {\n    height     : 40px;\n    line-height: 40px;\n    padding    : 0 10px;\n    margin-top : -1px;\n    cursor     : pointer;\n}\n\nmenu ul#menu {\n    position: absolute;\n    left    : -5px;\n    top     : 0;\n}\n\nmenu ul {\n    background-color: rgba(34, 34, 34, .7);\n    border          : 1px solid rgba(34, 34, 34, .7);\n}\n\nmenu ul li {\n    position        : relative;\n    font-size       : 14px;\n    color           : #333;\n    background-color: ghostwhite;\n    line-height     : 20px;\n    padding         : 10px 20px 10px 15px;\n    margin          : 1px;\n    cursor          : pointer;\n}\n\nmenu ul li li {\n    text-align: center;\n}\n\nmenu ul li:hover {\n    background-color: gainsboro;\n}\n\nmenu ul li.active {\n    background-color: silver;\n}\n\nmenu ul.subMenu {\n    position: absolute;\n    left    : 99%;\n    top     : -2px;\n    z-index : 1;\n}\n"; });
define('text!components/pentominos.css', ['module'], function(module) { module.exports = ".pentominosWrapper {\n    position: absolute;\n    left    : 0;\n    right   : 0;\n    top     : 0;\n    bottom  : 0;\n}\n\n.pentomino {\n    position      : absolute;\n    left          : 0;\n    top           : 0;\n    pointer-events: none;\n}\n\n.inheritBgColor {\n    background-color: inherit;\n}\n\n.part {\n    position          : absolute;\n    left              : 0;\n    top               : 0;\n    width             : 40px;\n    height            : 40px;\n    text-align        : center;\n    color             : white;\n    background-color  : inherit;\n    border            : 1px solid rgba(211, 211, 211, .2);\n    -webkit-box-sizing: border-box;\n    box-sizing        : border-box;\n    pointer-events    : auto;\n    cursor            : move;\n    cursor            : -webkit-grab;\n    cursor            : grab;\n}\n\n.part > span {\n    line-height: 40px;\n}\n\n.part:active {\n    cursor: -webkit-grabbing;\n    cursor: grabbing;\n}\n\n.part::before {\n    line-height: 38px;\n    opacity    : .2;\n    /*display: none;*/\n}\n\n.block_n .part::before, .block_y .part::before {\n    opacity: .4;\n}\n\n.block_t .part::before, .block_v .part::before {\n    opacity: .3;\n}\n\n.pentomino.active .part::before, .pentomino:hover .part::before {\n    opacity: 1;\n    /*display: inline;*/\n}\n\n.pentomino.transparent .part {\n    opacity: .7;\n}\n"; });
define('text!components/solving.css', ['module'], function(module) { module.exports = ""; });
define('text!components/menu.html', ['module'], function(module) { module.exports = "<template class=\"hamburger\">\n    <require from=\"components/menu.css\"></require>\n    <i class=\"fa fa-bars\"\n       click.delegate=\"showTheMenu()\"\n       touchstart.delegate=\"showTheMenu()\"></i>\n\n    <ul id=\"menu\"\n        if.bind=\"settings.menuVisible\">\n\n        <li click.delegate=\"hideTheMenu()\"\n            touchstart.delegate=\"hideTheMenu()\">\n            <i class=\"fa fa-times\"></i></li>\n\n        <li if.bind=\"sls.solutions['square'].length > 1\"\n            mouseenter.trigger=\"toggleSubmenuBoards()\"\n            mouseleave.trigger=\"toggleSubmenuBoards()\"\n            touchend.delegate=\"toggleSubmenuBoards()\">\n            Board sizes&nbsp;&nbsp;<i class=\"fa fa-angle-right\"></i>\n            <ul if.bind=\"settings.submenuBoardsVisible\"\n                class=\"subMenu\">\n                <li repeat.for=\"boardType of boardTypes\"\n                    if.bind=\"showThisBoard(boardType)\"\n                    class.bind=\"getActiveBoardClass(boardType)\"\n                    click.delegate=\"getStartPosition(boardType)\"\n                    touchstart.delegate=\"getStartPosition(boardType)\"\n                    innerhtml.bind=\"getBoardDimensions(boardType)\"></li>\n            </ul>\n        </li>\n\n        <li click.delegate=\"rotateBoard()\"\n            touchstart.delegate=\"rotateBoard()\">Rotate&nbsp;Blocks</li>\n\n        <li click.delegate=\"flipBoardYAxis()\"\n            touchstart.delegate=\"flipBoardYAxis()\">Flip Blocks</li>\n\n        <li if.bind=\"screenIsLargeEnough()\"\n            click.delegate=\"mixBoard()\"\n            touchstart.delegate=\"mixBoard()\">Shuffle</li>\n\n        <li if.bind=\"(sls.solutions[bs.boardType].length >= 0) && workersSupported()\"\n            click.delegate=\"showSolvingPanel()\"\n            touchstart.delegate=\"showSolvingPanel()\">Spoiler</li>\n    </ul>\n\n</template>"; });
define('text!components/pentominos.html', ['module'], function(module) { module.exports = "<template class=\"pentominosWrapper\">\n    <require from=\"components/pentominos.css\"></require>\n    <require from=\"resources/value-converters/pento-pos-value-converter\"></require>\n    <require from=\"resources/value-converters/part-pos-value-converter\"></require>\n    <require from=\"resources/value-converters/pento-face-value-converter\"></require>\n    <div repeat.for=\"pentomino of ps.pentominos\"\n         class.bind=\"getPentominoClasses(pentomino)\"\n         css.bind=\"pentomino | pentoPos:{ x:pentomino.position.x, y:pentomino.position.y, color:pentomino.color, partSize:ss.partSize } & signal:'position-signal'\">\n        <div class=\"relContainer inheritBgColor\">\n            <div repeat.for=\"part of pentomino | pentoFace:{ faces:pentomino.faces, face:pentomino.face } & signal:'position-signal'\"\n                 class.bind=\"getPartClasses(pentomino, $index, pentomino.face)\"\n                 css.bind=\"part | partPos:{ x:part[0], y:part[1], partSize:ss.partSize } & signal:'position-signal'\"\n                 mousedown.delegate=\"ds.startDrag(pentomino, $index, $event)\"\n                 touchstart.delegate=\"ds.startDrag(pentomino, $index, $event)\">\n            </div>\n        </div>\n    </div>\n</template>\n\n<!-- <template class=\"pentominosWrapper\">\n    <require from=\"components/pentominos.css\"></require>\n    <div repeat.for=\"pentomino of ps.pentominos\"\n         class.bind=\"getPentominoClasses(pentomino)\"\n         css.bind=\"getPentominoCSS(pentomino.position.x, pentomino.position.y, pentomino.color)\">\n        <div class=\"relContainer inheritBgColor\">\n            <div repeat.for=\"part of pentomino.faces[pentomino.face]\"\n                 class.bind=\"getPartClasses(pentomino, $index, pentomino.face)\"\n                 css.bind=\"getPartCSS(part)\"\n                 xcss=\"left: ${part[0] * ss.partSize}px;top:${part[1] * ss.partSize}px\"\n                 mousedown.delegate=\"ds.startDrag(pentomino, $index, $event)\"\n                 touchstart.delegate=\"ds.startDrag(pentomino, $index, $event)\">\n            </div>\n        </div>\n    </div>\n</template> -->"; });
define('text!components/solving.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/solving.css\"></require>\n    <div show.bind=\"solvingPanelVisible\">\n        <button class=\"button\"\n                title=\"find all solutions\"\n                click.delegate=\"autoSolve()\"\n                touchstart.delegate=\"autoSolve()\">\n                <icon class=\"fa fa-fast-forward fa-lg\"></icon>\n        </button>\n        <button class=\"button\"\n                show.bind=\"slvrWrkr != null\"\n                title=\"stop solutions worker\"\n                click.delegate=\"stop()\"\n                touchstart.delegate=\"stop()\">\n                <icon class=\"fa fa-stop fa-lg\"></icon>\n        </button>\n    </div>\n</template>"; });
//# sourceMappingURL=app-bundle.js.map