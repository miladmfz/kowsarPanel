/*
Template Name: Minton - KowsarPanel
Author: MFZ
Website: http://www.kits.ir/
Contact: MIlad.mfz73@gmail.com
File: Inbox init js
*/

$('input:checkbox').change(function () {
    if ($(this).is(":checked")) {
        $(this).parent().parent().parent().addClass("mail-selected");
    } else {
        $(this).parent().parent().parent().removeClass("mail-selected");
    }
});