// Style Constants
var darkGray = '0x30302f';
var blue = '0x3b4c60';
var turqoise = '0x386055';
var red = '0xb01d19';
var orange = '0xd04900';
var background = '0xeae1cc'; //jshint ignore:line
var lightPink = '0xE61945'; //jshint ignore:line
var fuchsia = '0xC00029'; //jshint ignore:line

var blueText = '#3b4c60';

var midasParticleStartColor = 'd04900';
var midasParticleEndColor = '545454';

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

var blackholeStyle = {
    fillStyle: turqoise,
    icon: '\uf069',
    fontstyle: {
        fill: blueText,
        font: '30px fontawesome'
    }
};

var kingMidasStyle = {
    fillStyle: turqoise,
    icon: '\uf219',
    fontstyle: {
        fill: blueText,
        font: '30px fontawesome'
    }
};

var bulletTimeStyle = {
    fillStyle: turqoise,
    icon: '\uf254',
    fontstyle: {
        fill: blueText,
        font: '30px fontawesome'
    }
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
exports.blackholeStyle = blackholeStyle;
exports.kingMidasStyle = kingMidasStyle;
exports.midasParticleStartColor = midasParticleStartColor;
exports.midasParticleEndColor = midasParticleEndColor;
exports.bulletTimeStyle = bulletTimeStyle;
exports.fontStyle = fontStyle;
exports.titleFontStyle = titleFontStyle;