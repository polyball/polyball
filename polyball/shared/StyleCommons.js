// Style Constants
var darkGray = '0x30302f';
var blue = '0x3b4c60';
var red = '0xb01d19';
var orange = '0xd04900';
var background = '0xeae1cc'; //jshint ignore:line

var ballStyle = {
    fillStyle: orange
};

var goalStyle = {
    fillStyle: blue,

    layer: 5
};

var bumperStyle = {
    fillStyle: darkGray,
    layer: 6
};

var paddleStyle = {
    fillStyle: red
};

var fontStyle = {
    font : '24px Cabin',
    fill : '#000000',
    strokeThickness : 2
};

var titleFontStyle = {
    font : '96px Cabin',
    fill : '#000000',
    strokeThickness : 6
};

exports.ballStyle = ballStyle;
exports.goalStyle = goalStyle;
exports.bumperStyle = bumperStyle;
exports.paddleStyle = paddleStyle;
exports.fontStyle = fontStyle;
exports.titleFontStyle = titleFontStyle;