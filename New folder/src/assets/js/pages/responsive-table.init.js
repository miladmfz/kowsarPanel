/*
Template Name: Minton - KowsarPanel
Author: MFZ
Website: http://www.kits.ir/
Contact: MIlad.mfz73@gmail.com
File: Responsive table init js
*/

!function ($) {
    "use strict";

    var ResponsiveTable = function () { };

    ResponsiveTable.prototype.init = function () {
        $('.table-rep-plugin').responsiveTable('update');

        $('.btn-toolbar [data-toggle=dropdown]').attr('data-bs-toggle', "dropdown");
    },
        $.ResponsiveTable = new ResponsiveTable, $.ResponsiveTable.Constructor = ResponsiveTable

}(window.jQuery),

    //initializing 
    function ($) {
        "use strict";
        $.ResponsiveTable.init()
    }(window.jQuery);
