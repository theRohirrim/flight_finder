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
    //document.getElementById('datePicker').valueAsDate = new Date();

    // Get the location codes and add them to autocomplete list
    controller.doCodes(autocomplete_list, location_dictionary);

    //Set the dange range picker on the inputs
    $('input[name="dates"]').daterangepicker({
        locale: {
            format: 'DD/MM/YYYY'
        }
    });

    
    // Set up autcomplete for text input fields
    controller.autocomplete(document.getElementById('depart'), autocomplete_list);
    controller.autocomplete(document.getElementById('arrive'), autocomplete_list);

}

function FlightSearch() {
    console.log("Creating controller/model");

    //Private Variables and Functions

    //Set up API URL
    var BASE_GET_URL = "https://api.tequila.kiwi.com";

    var API_KEY = "j9z5EBBq-xysj_2iuZzB21Oau3kNPRl_";


    // Autocomplete text inputs for locations, from W3Schools @ https://www.w3schools.com/howto/howto_js_autocomplete.asp
    this.autocomplete = function(inp, arr) {
        /* Takes two arguments, text input and array of possible values */
        var currentFocus;
        // Execute function when someone writes in the text field
        inp.addEventListener("input", function(e) {
            var a,b, i, val = this.value;
            // Close any open lists of autocompleted values
            closeAllLists();
            if (!val || val.length < 2) {return false;}
            currentFocus = -1;
            // Create a DIV element that will contain the items (values)
            a = document.createElement("DIV")
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            // Append the DIV element as a child of the autocomplete container
            this.parentNode.appendChild(a);
            // For each item in the array...
            for (i=0; i < arr.length; i++) {
                // Check if item includes the same letter as the text field value
                if ((arr[i].toUpperCase()).includes(val.toUpperCase())) {
                    // Create a DIV element for each matching element
                    b = document.createElement("DIV");
                    // Insert the value of the matching words
                    b.innerHTML = arr[i]
                    // Insert an input field that will hold the current array item's value
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    // Execute a function when someone clicks on the item value (DIV element)
                        b.addEventListener("click", function(e) {
                            // Insert the value for the autocomplete text field
                            inp.value = this.getElementsByTagName("input")[0].value;
                            // Close list of autocompleted values, or any other open lists
                            closeAllLists();
                    });
                    a. appendChild(b);
                }
            }
        });
        // Execute a function press a key on the keyboard
        inp.addEventListener("keydown", function(e) {

            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                // If arrow DOWN key pressed, increase currentFocus variable
                currentFocus++;
                // And make the current item more visible
                addActive(x);
            } else if (e.keyCode == 38) {
                // If arrow UP key is pressed, decrease the currentFocus variable
                currentFocus--;
                // And make the current item more visible
                addActive(x);
            } else if (e.keyCode == 13) {
                // If ENTER pressed, prevent form from being submitted
                e.preventDefault();
                if (currentFocus > -1) {
                    // And simulate a click on the "active" item
                    if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            // A function to classify an item as "active"
            if (!x) return false;
            // Start by removing the "active" class on all items
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            // Add class "autocomplete-active"
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            // A function to remove the "active" class from all autocomplete items           
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
            // Close all autocomplete lists in the document, except one passed as arg
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        // Execute a function when someone clicks in the document
        document.addEventListener("click", function(e) {
            closeAllLists(e.target);
        })
    }
    
    // Removes all accented characters from a string
    function convertString(string) {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    this.doCodes = function(location_list, location_dictionary) {
        // AIRPORT LOCATION DATA
        function onAiportSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                // Create an entry of the airport name, and country
                var auto_entry = convertString(obj.locations[i].name) + " (" + 
                obj.locations[i].code + "), " + obj.locations[i].city.country.name;
                // Check if entry has the city name, adding it if it does not
                if (!auto_entry.toUpperCase().includes(convertString(obj.locations[i].city.name).toUpperCase())) {
                    auto_entry = convertString(obj.locations[i].city.name) + ' ' + auto_entry;
                }

                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary
                location_dictionary[auto_entry] = {code: obj.locations[i].code,
                type: obj.locations[i].type}
            }
        }

        // CITY LOCATION DATA
        function onCitySuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                // Only add if city has more than one airport
                if (obj.locations[i].airports > 1) {
                    var auto_entry = convertString(obj.locations[i].name) + " (All Aiports), " + 
                    obj.locations[i].country.name;
                    // Add each entry to autocomplete list
                    location_list.push(auto_entry);
                    // Add each entry to lookup dictionary
                    location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
                }
            }
        }

        // REGION LOCATION DATA
        function onCountrySuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Country)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }

        // REGION LOCATION DATA
        function onRegionSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Region)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }

        // CONTINENT LOCATION DATA
        function onContinentSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Continent)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }


        // AIRPORT location search
        var searchAirUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=airport&limit=15000&sort=name&active_only=true';
        $.ajax(searchAirUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onAiportSuccess});
        // CITY location search
        var searchCityUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=city&limit=15000&sort=name&active_only=true';
        $.ajax(searchCityUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onCitySuccess});
        // COUNTRY location search
        var searchCountryUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=country&limit=15000&sort=name&active_only=true';
        $.ajax(searchCountryUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onCountrySuccess});
        // REGION location search
        var searchRegionUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=region&limit=15000&sort=name&active_only=true';
        $.ajax(searchRegionUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onRegionSuccess});
        // CONTINENT location search
        var searchContinentUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=continent&limit=15000&sort=name&active_only=true';
        $.ajax(searchContinentUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onContinentSuccess});

        // FR2 Add 'Everywhere' as a choice for departure and arrival.
        var everywhere_entry = 'Everywhere';
        location_list.push(everywhere_entry);
        location_dictionary[everywhere_entry] = {code: 'anywhere',
            type: 'anywhere'};
    }

    this.disableDate = function() {
        console.log("it recognises")
        var return_checkbox = document.querySelector('#return');
        var date_input = document.getElementById('return_calendar');

        if (return_checkbox.checked) {
            date_input.disabled = false
            date_input.type = "text"
        } else {
            date_input.disabled = true
            date_input.type = "hidden"
        }

        date_input;
    }

    // Create table function to insert into the html with the appropriate results, from StackDiary.com @ https://stackdiary.com/tutorials/create-table-javascript/
    function createTableFromObjects(data) {
        // clear the container of any current content or table
        const container = document.getElementById('flights-container');
        if (container.childNodes.length > 0){
            container.replaceChildren();
        }

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        
        // Create table header row
        const keys = Object.keys(data[0]);
        for (const key of keys) {
          const headerCell = document.createElement('th');
          headerCell.textContent = key;
          headerRow.appendChild(headerCell);
        }
        table.appendChild(headerRow);
      
        // Create table data rows
        for (const obj of data) {
          const dataRow = document.createElement('tr');
          for (const key of keys) {
            const dataCell = document.createElement('td');
            dataCell.textContent = obj[key];
            dataRow.appendChild(dataCell);
          }
          table.appendChild(dataRow);
        }
      
        return table;
    }
}
var autocomplete_list = [];
var location_dictionary = {};

module.exports = {FlightSearch: FlightSearch};