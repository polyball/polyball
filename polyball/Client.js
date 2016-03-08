var $ = require('jquery');
var logger = require('polyball/shared/loggers');

var Model = require('polyball/shared/Model');

$(document).ready(function() {

    var viewport = $('#viewport');
    var width = viewport.width(), height = viewport.height();

    logger.info(width);
    logger.info(height);

    var model = new Model();
    console.log(Object.keys(model));

}); // end on DOM ready