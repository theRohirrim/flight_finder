/**
 * This is the second iteration of the flight finder app. Restructured to better organise
 * the code and enable test driven development with the use of Jest.
 */


document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    //console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    // Setup controller object
    controller = new FlightSearch();

    // Set date to today function
    document.getElementById('datePicker').valueAsDate = new Date();

    controller.doCodes();

    // Set up autcomplete for text input fields
    controller.autocomplete(document.getElementById('depart'), autocomplete_list);
    controller.autocomplete(document.getElementById('arrive'), autocomplete_list);

}