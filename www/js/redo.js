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

    // Add table to the html
    const table = controller.createTableFromObjects(flights);
    const tableContainer = document.getElementById('flights-container');
    tableContainer.appendChild(table);

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

    function addToLocationDictionary(obj, index) {
        // Add each entry to lookup dictionary
        const location = obj.locations[index];
        location_dictionary[location.code] = {name: convertString(location.name) + " (" + 
        location.code + ")",
        type: location.type}
    }

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
                addToLocationDictionary(obj, i);
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
                    addToLocationDictionary(obj, i);
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
                addToLocationDictionary(obj, i);
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
                addToLocationDictionary(obj, i);
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
                addToLocationDictionary(obj, i);
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

    function makeModal(data, id) {
        // Create container div and set id and class
        const container = document.createElement('div');
        container.setAttribute('id', id)
        container.classList.add('modal')
        // Set the container to hidden
        container.style.display = 'none'

        // Create div for modal content and add to 
        const content_div = document.createElement('div');
        content_div.classList.add('modal-content');
        container.appendChild(content_div);

        //Create a span with the close button
        const span_div = document.createElement('span');
        span_div.textContent = 'x';
        span_div.classList.add('close');
        content_div.appendChild(span_div);

        // Make table of the layover flights and append to the modal
        const modal_flights = makeModalTable(data, container);
        content_div.appendChild(modal_flights);

        // When user clicks on span, close the modal
        span_div.onclick = function() {
            container.style.display = "none";
        }

        // When user clicks anywhere outside modal, close it
        window.onclick = function(event) {
            if (event.target == container) {
            container.style.display = "none";
            }
        }

        // Attach the container to the body of the html
        document.body.appendChild(container);
        
        return container;
    }

    function makeModalTable(data, modal) {
        //Clear the container of any current content
        const modal_content = modal.firstChild;
        if (modal_content.childNodes.length > 0){
            modal_content.replaceChildren();
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

    // Create table function to insert into the html with the appropriate results, from StackDiary.com @ https://stackdiary.com/tutorials/create-table-javascript/
    this.createTableFromObjects = function(data) {
        // clear the container of any current content or table
        const container = document.getElementById('flights-container');
        if (container.childNodes.length > 0){
            container.replaceChildren();
        }

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        // Add class to the header row
        headerRow.classList.add('headerRow');
        
        // Create table header row
        const keys = Object.keys(data[0]);
        for (const key of keys) {
          const headerCell = document.createElement('th');
          headerCell.textContent = key;
          headerRow.appendChild(headerCell);
          // Add class to the header cells
          headerCell.classList.add('headerCell');
        }
        table.appendChild(headerRow);

        // Create a counter to create unique ID's to open correct modals
        var id = 0;
      
        // Create table data rows
        for (const obj of data) {
          const dataRow = document.createElement('tr');
          // Add class to the table row
          dataRow.classList.add('tableRow');
          // Add content to the cells
          for (const key of keys) {
            // Create data cell
            const dataCell = document.createElement('td');
            // If the key is 'stops', then make modal or just continue
            if (key == 'stops' && obj[key] != 'Direct') {
                // Create button element
                const stopsButton = document.createElement('button');
                // Assign class and ID to modal button
                stopsButton.classList.add('modal-button');
                const mod_id = `modal${id}`
                stopsButton.setAttribute("href", mod_id)
                // Write the number of stops as the text of the button
                stopsButton.textContent = obj[key].length;

                // Make the modal content
                const mod = makeModal(obj[key], mod_id);
                // Open the modal when the user clicks the button
                stopsButton.onclick = function() {
                    console.log('recognised click');
                    mod.style.display = "block";
                }

                // Increment the id for following modal unique ID's
                id += 1;
                // Add the button to the data cell
                dataCell.appendChild(stopsButton);
            } else {
                // Otherwise add the content of the key to the data cell
                dataCell.textContent = obj[key];
            }
            // Add class to the table cell and append to row
            dataCell.classList.add('tableCell');
            dataRow.appendChild(dataCell);
          }

          // Window clicks will close all modals
          // All page modals
          var modals = document.querySelectorAll('.modal');
          window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                for (var index in modals) {
                    if (typeof modals[index].style !== 'undefined') modals[index].style.display = "none";    
                }
            }
        }

          table.appendChild(dataRow);
        }
      
        return table;
    }

    // Convert date to be a nicer format for display
    function convertNiceDate(timestamp) {
        var date = new Date(timestamp);
        var nice = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() +
        ' ';
        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();
        if (hours.length < 2) {
            hours = '0' + hours;
        }
        if (minutes.length < 2) {
            minutes = minutes + '0';
        }
        return nice + hours + ':' + minutes
    }

    function convertDuration (seconds) {
        // Takes the duration from the flight info and converts to hours and mins
        var minutes = seconds / 60;
        var hours = (Math.floor(minutes / 60)).toString();
        var remainder = (minutes % 60).toString();

        // Pad remainder if it is below 10
        if (remainder.toString() < 2) {
            remainder = '0' + remainder;
        }

        return hours + 'h ' + remainder + 'm';
    }

    // Test version to build the types of table displays needed
    function doSearch() {
        /*
        // Get all the inputs from the HTML
        var depart = document.getElementById("depart").value;
        var arrive = document.getElementById("arrive").value;
        var date = document.getElementById("datePicker").value;
        var limit = document.getElementById("limit_num").value;
        // Price limit becomes 'effectively infinite' if it at max value
        var price_limit = document.getElementById("limit_price").value;
        if (price_limit == 2000) {
            price_limit = 50000;
        }

        // Exit function if location values are not in the list of locations
        if (!(autocomplete_list.includes(depart) && autocomplete_list.includes(arrive))){
            alert("Please enter correct departure and arrival locations");
            return
        }
        */

        var depart = 'AZ';
        var arrive = 'MIA';
        var date_from = '11/09/2023'
        var date_to = '12/09/2023'
        var return_from = '15/09/2023'
        var return_to = '16/09/2023'
        var limit = 20;

        function onSuccess(obj) {
            const data = obj.data
            console.log(data)

            if (data.length == 0) {
                // Alert the user if there were no results
                alert("There were no results for your search");
                // TODO remove the loading icon if its still going
                //stopLoader();
            } else {
                // Build entries of flights
                // const return_entries = buildReturnEntries(data, limit)
            }
        }

        var searchUrl = `${BASE_GET_URL}/v2/search?fly_from=${depart}&fly_to=${arrive}&date_from=${date_from}&date_to=${date_to}&return_from=${return_from}&return_to=${return_to}&limit=100`

        $.ajax(searchUrl, {type: "GET",
                data: {}, headers: {apikey: API_KEY}, success: onSuccess});

    }

    function buildReturnEntries(data, limit) {
        // Create an empty list of flights
        var flights = [];

        // Iterate through list up to result limit
        for (let i = 0; i < limit; i++) {
            // Get OUTGOING 
            // Get route
            const out_route = `${location_dictionary[data[i].cityCodeFrom]} to ${location_dictionary[data[i].cityCodeTo]}`
            // Get the number of stops
            var out_stops = [];
            // Get departure time
            const out_depart_time = convertNiceDate(data[i].local_departure);
            // Get arrival time
            const out_arrival_time = convertNiceDate(data[i].local_arrival);
            // Get duration
            const out_duration = convertDuration(data.duration.departure);
            // Get price
            const out_price = data[i].price;


            // GET RETURN
            // Get route
            const ret_route = `${location_dictionary[data[i].cityCodeTo]} to ${location_dictionary[data[i].cityCodeFrom]}`
            // Get the number of stops
            var ret_stops = [];
            // Get departure time
            const ret_depart_time = 0;
            // Get arrival time
            const ret_arrive_time = 0;
            // Get duration
            const ret_duration = convertDuration(data.duration.return);
            


        }

    }

    // FR4 Set listener to search button to activate search
    document.getElementById("search_button").addEventListener("click", doSearch); 
}


var autocomplete_list = [];
var location_dictionary = {};

var flights = [];

var fake_stops = [{
    route: 'Dublin (DUB) to The Land',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}, {
    route: 'The Land to The Sea',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}]
var fake_stops_two = [{
    route: 'The Land to The Sea',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}, {
    route: 'Dublin (DUB) to The Land',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}, {
    route: 'The Land to The Sea',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}];
var flight_one = {
    route: 'Dublin (DUB) to London Stanstead (STN)',
    stops: 'Direct',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}
var flight_two = {
    route: 'Dublin (DUB) to The Sea',
    stops: fake_stops,
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}
var flight_three = {
    route: 'Bloopy bin bop',
    stops: fake_stops_two,
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'
}
flights.push(flight_one, flight_two, flight_three);

var return_flights = [];
var flights_one = [
    {route: 'Dublin (DUB) to London Stanstead (STN)',
    stops: 'Direct',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'},
    {route: 'STANSTEAD TO SEA',
    stops: 'Direct',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'}
]

var flights_two = [
    {route: 'Dublin (DUB) to London Stanstead (STN)',
    stops: 'Direct',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'},
    {route: 'STANSTEAD TO SEA',
    stops: 'Direct',
    depart: '23/8/2023 07:30',
    arrive: '23/8/2023 08:50',
    duration: '1H 20M',
    cost: '€24'}
]
return_flights.push(flights_one, flights_two);

module.exports = {FlightSearch: FlightSearch};