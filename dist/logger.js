"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var supportsColor = require("supports-color");
var colors = [6, 2, 3, 4, 5, 1];
try {
    if (supportsColor && supportsColor.level >= 2) {
        colors = [
            26, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 57, 62, 63, 68,
            69, 74, 75, 76, 77, 78, 79, 80, 81, 93, 98, 99, 112, 113, 128, 129, 134,
            135, 148, 149, 163, 164, 165, 166, 167, 168, 169, 170, 171,
            172, 173, 178, 179, 184, 185, 199, 200, 201, 202, 203, 204,
            205, 206, 207, 208, 209, 214, 215, 220, 221
        ];
    }
}
catch (err) {
}
var currentColorIndex = 0;
exports.logger = console;
exports.createTaskLogger = function (name) {
    currentColorIndex = currentColorIndex === colors.length - 1 ? 0 : currentColorIndex + 1;
    var color = colors[currentColorIndex];
    var format = "\u001B[3" + (color < 8 ? color : '8;5;' + color) + ";1m%s: %s\u001B[0m";
    return function (msg) { return console.log(format, name, msg); };
};
//# sourceMappingURL=logger.js.map