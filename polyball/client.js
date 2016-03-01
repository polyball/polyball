var $ = require('jquery');
var logger = require('polyball/shared/loggers').mainLogger;

$(document).ready(function() {

    var viewport = $('#viewport');
    var width = viewport.width(), height = viewport.height();

    logger.info(width);
    logger.info(height);

}); // end on DOM ready