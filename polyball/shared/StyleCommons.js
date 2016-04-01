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
    //icon: '\uf0d6',
    //fontstyle: {
    //    fill: '#ffffff',
    //    font: '40px fontawesome'
    //}
};

var paddleStyle = {
    fillStyle: red
};

var fontStyle = {
    font : '36px Cabin',
    fill : '#000000',
    strokeThickness : 3
};


exports.ballStyle = ballStyle;
exports.goalStyle = goalStyle;
exports.bumperStyle = bumperStyle;
exports.paddleStyle = paddleStyle;
exports.fontStyle = fontStyle;