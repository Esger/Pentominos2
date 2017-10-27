define('app',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var App = exports.App = function App() {
        _classCallCheck(this, App);

        this.message = 'Cover the board';
    };
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
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('resources/elements/menu',[], function () {
  "use strict";
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
define('components/board',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
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

    var BoardCustomElement = exports.BoardCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function BoardCustomElement(eventAggregator) {
            _classCallCheck(this, BoardCustomElement);

            this.ea = eventAggregator;
        }

        BoardCustomElement.prototype.addEventListeners = function addEventListeners() {};

        BoardCustomElement.prototype.attached = function attached() {
            this.addEventListeners();
        };

        return BoardCustomElement;
    }()) || _class);
});
define('components/pentominos',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
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

    var PentominosCustomElement = exports.PentominosCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function PentominosCustomElement(eventAggregator) {
            _classCallCheck(this, PentominosCustomElement);

            this.ea = eventAggregator;
        }

        PentominosCustomElement.prototype.addEventListeners = function addEventListeners() {};

        PentominosCustomElement.prototype.attached = function attached() {
            this.addEventListeners();
        };

        return PentominosCustomElement;
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
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/menu\"></require>\n    <require from=\"components/board\"></require>\n    <require from=\"components/footer.html\"></require>\n    <header css.bind=\"board.theHeaderCss()\">\n        <menu></menu>\n        <h1>${message}</h1>\n    </header>\n    <board></board>\n    <footer></footer>\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n"; });
define('text!resources/elements/menu.html', ['module'], function(module) { module.exports = ""; });
define('text!resources/elements/menu.css', ['module'], function(module) { module.exports = ""; });
define('text!components/menu.html', ['module'], function(module) { module.exports = "<template id=\"hamburger\">\n    <require from=\"components/menu.css\"></require>\n    <i class=\"fa fa-bars\"\n       click.delegate=\"showTheMenu()\"\n       touchstart.delegate=\"showTheMenu()\"></i>\n\n    <!-- <ul id=\"menu\"\n        if.bind=\"settings.menuVisible\">\n\n        <li click.delegate=\"hideTheMenu()\"\n            touchstart.delegate=\"hideTheMenu()\">\n            <i class=\"fa fa-times\"></i></li>\n\n        <li if.bind=\"solutions['square'].length > 1\"\n            mouseenter.delegate=\"toggleSubmenuBoards()\"\n            mouseleave.delegate=\"toggleSubmenuBoards()\"\n            touchend.delegate=\"toggleSubmenuBoards()\">\n            Board sizes&nbsp;&nbsp;\n            <i class=\"fa fa-angle-right\"></i>\n            <ul if.bind=\"settings.submenuBoardsVisible\"\n                class=\"subMenu\">\n                <li repeat.for=\"(key, val) in board.boardTypes track by $index\"\n                    if.bind=\"showThisBoard(key)\"\n                    class.bind=\"{'active' : board.boardType == key}\"\n                    click.delegate=\"getStartPosition(key)\"\n                    touchstart.delegate=\"getStartPosition(key)\">{{val.w}}&nbsp;&times;&nbsp;{{val.h}}</li>\n            </ul>\n        </li>\n\n        <li click.delegate=\"setOpaqueBlocks()\"\n            if.bind=\"settings.opaqueBlocks == false\"\n            touchstart.delegate=\"setOpaqueBlocks()\">Opaque</li>\n\n        <li click.delegate=\"setTransparentBlocks()\"\n            if.bind=\"settings.opaqueBlocks == true\"\n            touchstart.delegate=\"setTransparentBlocks()\">Transparent</li>\n\n        <li click.delegate=\"methods.rotateBoard()\"\n            touchstart.delegate=\"methods.rotateBoard()\">Rotate&nbsp;Blocks</li>\n\n        <li click.delegate=\"methods.flipBoardYAxis()\"\n            touchstart.delegate=\"methods.flipBoardYAxis()\">Flip Blocks</li>\n\n        <li if.bind=\"screenIsLargeEnough()\"\n            click.delegate=\"methods.mixBoard()\"\n            touchstart.delegate=\"methods.mixBoard()\">Shuffle</li>\n\n        <li if.bind=\"solutions[board.boardType].length > 20\"\n            click.delegate=\"board.autoSolve()\"\n            touchstart.delegate=\"board.autoSolve()\">Spoiler</li>\n    </ul> -->\n\n</template>"; });
define('text!components/menu.css', ['module'], function(module) { module.exports = "#hamburger {\n    position: absolute;\n    left    : 2px;\n    top     : 2px;\n    z-index : 100;\n}\n\n#hamburger .fa-bars {\n    height     : 40px;\n    line-height: 40px;\n    padding    : 0 10px;\n    margin-top : -1px;\n    cursor     : pointer;\n}\n\nnav ul#menu {\n    position: absolute;\n    left    : -5px;\n    top     : 0;\n}\n\nnav ul {\n    background-color: rgba(34, 34, 34, .7);\n    border          : 1px solid rgba(34, 34, 34, .7);\n}\n\nnav ul li {\n    position        : relative;\n    font-size       : 14px;\n    color           : #333;\n    background-color: ghostwhite;\n    line-height     : 20px;\n    padding         : 10px 20px 10px 15px;\n    margin          : 1px;\n    cursor          : pointer;\n}\n\nnav ul li:hover {\n    background-color: gainsboro;\n}\n\nnav ul li.active {\n    background-color: silver;\n}\n\nnav ul.subMenu {\n    position: absolute;\n    left    : 99%;\n    top     : -2px;\n    z-index : 1;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template id=\"board\">\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/pentominos\"></require>\n    <require from=\"components/controls\"></require>\n    <pentominos></pentominos>\n    <controls></controls>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = "#board {\n    position        : relative;\n    /*margin: 40px auto;*/\n    background-color: lightgray;\n    border          : 5px solid darkgray;\n}\n\n#board.solved, .solved {\n    border-color      : lime;\n    -webkit-box-shadow: 0 0 30px 0 rgba(0, 255, 0, .5);\n    box-shadow        : 0 0 30px 0 rgba(0, 255, 0, .5);\n}\n"; });
define('text!app.css', ['module'], function(module) { module.exports = "body, html {\n    width                : 100%;\n    height               : 100%;\n    background-color     : #222;\n    font-family          : TrebuchetMS, sans-serif;\n    color                : #fff;\n    -webkit-touch-callout: none;\n    -webkit-user-select  : none;\n    -khtml-user-select   : none;\n    -moz-user-select     : none;\n    -ms-user-select      : none;\n    user-select          : none;\n}\n\nbody {\n    flex           : 1 0 auto;\n    display        : flex;\n    flex-direction : column;\n    justify-content: flex-start;\n    align-items    : center;\n}\n@media (min-height: 700px) {\n    body {\n        justify-content: center;\n    }\n}\n\n.r {\n    float: right;\n}\n\n.l {\n    float: left;\n}\n\n.relContainer {\n    position: relative;\n}\n\n.rounded {\n    border-radius: 100px;\n}\n\n.clearFix {\n    clear: both;\n}\n\n.hidden {\n    display: none;\n}\n\n.invisible {\n    visibility: hidden;\n}\n\n.pushTop {\n    margin-top: 12px;\n}\n\n.pushLeft {\n    margin-left: 12px;\n}\n\n.pushBottom {\n    margin-bottom: 12px;\n}\n\n.pushBottomMore {\n    margin-bottom: 24px;\n}\n\n.textAlignLeft {\n    text-align: left;\n}\n\nheader {\n    position: relative;\n    height  : 40px;\n}\n\nh1 {\n    font-family   : inherit;\n    font-size     : 21px;\n    letter-spacing: 1px;\n    text-align    : center;\n    line-height   : 0;\n    margin        : 20px 0 -20px;\n}\n"; });
define('text!components/footer.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/footer.css\"></require>\n    <a href=\"http://www.ashware.nl\"\n       target=\"_blank\"\n       class=\"r\">&copy;&nbsp;ashWare</a>\n    <!-- <span class='st_sharethis' displayText='ShareThis'></span> -->\n</template>"; });
define('text!components/footer.css', ['module'], function(module) { module.exports = "footer {\n    display   : block;\n    width     : 100%;\n    position  : absolute;\n    padding   : 0 10px;\n    bottom    : 10px;\n    box-sizing: border-box;\n}\n\nfooter span {\n    color: #fff !important;\n}\n\nfooter a {\n    color          : #f2f2f2;\n    text-decoration: none;\n    font-size      : 12px;\n}\n"; });
define('text!components/pentominos.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"pentomino block_{{pentomino.name}}\"\n         ng-repeat=\"pentomino in pentominos track by $index\"\n         ng-hide=\"(board.boardTypes[board.boardType].surface == 60) && ($index > 11)\"\n         ng-style=\"methods.getPentominoCss(pentomino.position)\"\n         ng-class=\"{\n            'active' : {{methods.isActive($index)}},\n            'transparent' : settings.opaqueBlocks == false\n        }\">\n        <div class=\"relContainer\"\n             ng-repeat=\"face in pentomino.faces track by $index\"\n             ng-if=\"$index == pentomino.face\">\n            <div class=\"part {{methods.getPartClasses(pentomino, $index)}}\"\n                 ng-repeat=\"part in face track by $index\"\n                 ng-mousedown=\"methods.startDrag(pentomino, $index, $event)\"\n                 ng-touchstart=\"methods.startDrag(pentomino, $index, $event)\"\n                 ng-style=\"{{methods.getPartCss(pentomino, part)}}\">\n            </div>\n        </div>\n    </div>\n</template>"; });
define('text!components/pentominos.css', ['module'], function(module) { module.exports = ".pentomino {\n    position      : absolute;\n    left          : 0;\n    top           : 0;\n    pointer-events: none;\n}\n\n.part {\n    position      : absolute;\n    left          : 0;\n    top           : 0;\n    width         : 40px;\n    height        : 40px;\n    text-align    : center;\n    color         : white;\n    border        : 1px solid rgba(211, 211, 211, .2);\n    box-sizing    : border-box;\n    pointer-events: auto;\n    cursor        : move;\n    /* fallback: no `url()` support or images disabled */\n    cursor        : -webkit-grab;\n    /* Chrome 1-21, Safari 4+ */\n    cursor        : -moz-grab;\n    /* Firefox 1.5-26 */\n    cursor        : grab;\n    /* W3C standards syntax, should come least */\n}\n\n.part > span {\n    line-height: 40px;\n}\n\n.part:active {\n    cursor: -webkit-grabbing;\n    cursor: -moz-grabbing;\n    cursor: grabbing;\n}\n\n.part::before {\n    line-height: 38px;\n    opacity    : .2;\n    /*display: none;*/\n}\n\n.block_n .part::before, .block_y .part::before {\n    opacity: .4;\n}\n\n.block_t .part::before, .block_v .part::before {\n    opacity: .3;\n}\n\n.pentomino.active .part::before, .pentomino:hover .part::before {\n    opacity: 1;\n    /*display: inline;*/\n}\n\n.pentomino.transparent .part {\n    opacity: .7;\n}\n"; });
define('text!components/controls.html', ['module'], function(module) { module.exports = "<template>\n    <!-- <button class=\"small r\"\n            title=\"Show next solution\"\n            if.bind=\"settings.solutionsShown\"\n            disabled.bind=\"(currentSolution == solutions[board.boardType].length - 1)\"\n            click.delegate=\"showNextSolution(board.boardType)\"\n            touchstart.delegate=\"showNextSolution(board.boardType)\">\n            <icon class=\"fa fa-step-forward fa-lg\"></icon>\n        </button>\n    <button class=\"small l\"\n            title=\"Show previous solution\"\n            if.bind=\"settings.solutionsShown\"\n            disabled.bind=\"(currentSolution == 0)\"\n            click.delegate=\"showPreviousSolution(board.boardType)\"\n            touchstart.delegate=\"showPreviousSolution(board.boardType)\">\n            <icon class=\"fa fa-step-backward fa-lg\"></icon>\n        </button>\n    <button class=\"rounded\"\n            if.bind=\"!settings.solutionsShown\"\n            ng-class=\"{'solved' : (board.solved && !board.newSolution)}\"\n            click.delegate=\"showSolution()\"\n            touchstart.delegate=\"showSolution()\">Show solution\n            {{currentSolution + 1}} / {{solutions[board.boardType].length}}\n        </button>\n    <span class=\"rounded\"\n          if.bind=\"settings.solutionsShown\"\n          ng-class=\"{'solved' : (board.solved && !board.newSolution)}\">\n            Solution {{currentSolution + 1}} / {{solutions[board.boardType].length}}\n        </span> -->\n\n</template>"; });
define('text!components/controls.css', ['module'], function(module) { module.exports = "#controls {\n    margin-top: 5px;\n    text-align: center;\n}\n\n#controls button, #controls span {\n    display         : inline-block;\n    height          : 30px;\n    line-height     : 30px;\n    font-family     : inherit;\n    background-color: transparent;\n    border          : none;\n    outline         : none;\n    text-align      : center;\n    color           : white;\n    font-size       : 14px;\n    margin-top      : 10px;\n    padding         : 0 10px;\n}\n\n#controls span.solved {\n    border: 1px dotted lime;\n}\n\n#controls button {\n    cursor: pointer;\n}\n\n#controls button.small {\n    width      : 40px;\n    height     : 40px;\n    line-height: 40px;\n    margin-top : 5px;\n}\n\n#controls button+icon {\n    margin     : 0 10px;\n    line-height: 30px;\n}\n\n#controls button[disabled='disabled'] {\n    visibility: hidden;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map