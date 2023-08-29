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

    // // Add table to the html
    // // const table = controller.createTableFromObjects(return_flights);
    // const tableContainer = document.getElementById('flights-container');
    // // tableContainer.appendChild(table);

    // // Make list of things to append
    // var list = []

    // for (const location in processed_dict) {
    //     let div = controller.makeCollapsible(location, processed_dict[location], 'to')
    //     list.push(div)
    // }
    // for (const location of list) {
    //     tableContainer.appendChild(location);
    // }
   

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

    function addToLocationDictionary(code, name, type, dispName = null) {
        // Add each entry to lookup dictionary
        location_dictionary[code] = {name: name, type: type}
        if (dispName) {
            location_dictionary[code].dispName = dispName;
        }
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
                // Get code for entry
                const code = obj.locations[i].code;
                // Get type for entry
                const type = obj.locations[i].type;

                // Get presentable name, no country
                var displayName = convertString(obj.locations[i].name) + " (" + 
                obj.locations[i].code + ")"
                // Check if entry has the city name, adding it if it does not
                if (!displayName.toUpperCase().includes(convertString(obj.locations[i].city.name).toUpperCase())) {
                    displayName = convertString(obj.locations[i].city.name) + ' ' + displayName;
                }

                // Add each entry to autocomplete list
                location_list.push(auto_entry);

                // Add each entry to lookup dictionary
                addToLocationDictionary(code, auto_entry, type, displayName);
                // Add each entry to a code dictionary
                codeDictionary[auto_entry] = obj.locations[i].code
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
                    // Get code for entry
                    const code = obj.locations[i].id;
                    // Get type for entry
                    const type = obj.locations[i].type;
                    // Add each entry to lookup dictionary
                    addToLocationDictionary(code, auto_entry, type);
                    // Add each entry to a code dictionary
                    codeDictionary[auto_entry] = obj.locations[i].code
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
                // Get code for entry
                const code = obj.locations[i].code;
                // Get type for entry
                const type = obj.locations[i].type;
                // Add each entry to lookup dictionary
                addToLocationDictionary(code, auto_entry, type);
                // Add each entry to a code dictionary
                codeDictionary[auto_entry] = obj.locations[i].code
            }
        }

        // REGION LOCATION DATA
        function onRegionSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Region)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Get code for entry
                const code = obj.locations[i].id;
                // Get type for entry
                const type = obj.locations[i].type;
                // Add each entry to lookup dictionary
                addToLocationDictionary(code, auto_entry, type);
                // Add each entry to a code dictionary
                codeDictionary[auto_entry] = obj.locations[i].id
            }
        }

        // CONTINENT LOCATION DATA
        function onContinentSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Continent)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Get code for entry
                const code = obj.locations[i].slug;
                // Get type for entry
                const type = obj.locations[i].type;
                // Add each entry to lookup dictionary
                addToLocationDictionary(code, auto_entry, type);
                // Add each entry to a code dictionary
                codeDictionary[auto_entry] = obj.locations[i].code
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

        // FR2 Add 'Everywhere' as a choice for departure and arrival to list and dictionaries.
        var anywhere_entry = 'Anywhere';
        location_list.push(anywhere_entry);
        location_dictionary[anywhere_entry] = {code: 'anywhere',
            type: 'anywhere'};
        codeDictionary[anywhere_entry] = 'anywhere'
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
        // Create list for appendable items to properly append from
        var list = [] 
        
        // Create container div and set id and class
        const container = document.createElement('div');
        container.setAttribute('id', id)
        container.classList.add('modal')
        // Set the container to hidden
        container.style.display = 'none'

        // Create div for modal content and add to 
        var content_div = document.createElement('div');
        content_div.classList.add('modal-content');
        container.appendChild(content_div);

        //Create a span with the close button
        const span_div = document.createElement('div');
        span_div.innerText = 'x';
        span_div.classList.add('close');
        list.push(span_div);

        // Make table of the layover flights and append to the modal
        const modal_flights = makeModalTable(data, container);
        list.push(modal_flights);

        // Append all to the modal
        for (const item of list) {
            content_div.appendChild(item);
        }

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

            // Add classes to end groups for styling later
            if (key == 'route') {
                headerCell.classList.add('leftCell');
            } else if (key == 'cost') {
                headerCell.classList.add('rightCell');
            }
        }
        table.appendChild(headerRow);
        
        // Create table data rows
        for (const obj of data) {
            const dataRow = document.createElement('tr');
            // Add class to the table row
            dataRow.classList.add('tableRow');
            for (const key of keys) {
                const dataCell = document.createElement('td');
                dataCell.textContent = obj[key];
                // Add class to the table cell and append to row
                dataCell.classList.add('tableCell');
                // Add classes to end groups for styling later
                if (key == 'route') {
                    dataCell.classList.add('leftCell');
                } else if (key == 'cost') {
                    dataCell.classList.add('rightCell');
                }
                dataRow.appendChild(dataCell);
            }
            table.appendChild(dataRow);
        }
        
        return table;

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
          // Add classes to end groups for styling later
          if (key == 'route') {
            headerCell.classList.add('leftCell');
          } else if (key == 'cost') {
            headerCell.classList.add('rightCell');
          }
        }
        table.appendChild(headerRow);

        // Create a counter to create unique ID's to open correct modals
        var id = 0;
      
        // Create table data rows
        // For each entry in the flight list
        for (const obj of data) {
          const dataRow = document.createElement('tr');
          // Add class to the table row
          dataRow.classList.add('tableRow');
          // Add content to the cells
          // For each key in the flight entry
          for (const key of keys) {
            // Create data cell
            const dataCell = document.createElement('td');
            // Create a list of one or two divs to go into the data cell
            const content = makeCells(key, obj[key], id)
            // Append all divs to the table cell to the cells
            for (const div of content) {
                dataCell.appendChild(div);
            }            
            // Add class to the table cell and append to row
            dataCell.classList.add('tableCell');
            dataRow.appendChild(dataCell)
            // Add classes to end groups for styling later
            if (key == 'route') {
                dataCell.classList.add('leftCell');
            } else if (key == 'cost') {
                dataCell.classList.add('rightCell');
            }
          }
          // Append the row to the table
          table.appendChild(dataRow);
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
        return table;
    }

    function makeCells(key, data, id) {
        // Create list of potential divs to be inserted (1 or 2)
        var content = [];
        // Set up counter to apply different CSS class to each cell div
        var ind = 0;
        // Iterate through the list of data
        for (const entry of data) {
            // Create a div for the values to enter
            var the_div = document.createElement('div');
            // Creating modal if the key is stops
            if (key == 'stops' && entry != 'Direct') {
                // Create button element
                const stopsButton = document.createElement('button');
                // Assign class and ID to modal button
                stopsButton.classList.add('modal-button');
                const mod_id = `modal${id}`
                stopsButton.setAttribute("href", mod_id)
                // Write the number of stops as the text of the button
                stopsButton.textContent = entry.length;

                // Make the modal content
                const mod = makeModal(entry, mod_id);
                // Open the modal when the user clicks the button
                stopsButton.onclick = function() {
                    mod.style.display = "block";
                }

                // Increment the id for following modal unique ID's
                id += 1;
                // Add the button to the data cell
                the_div.appendChild(stopsButton);
            } else {
                // Otherwise add the content of the key to the data cell
                the_div.textContent = entry;
            }
            // Add a class to the entry div and add to the list of divs
            the_div.classList.add('cell-div');
            // Add a class to differentiate the top and bottom divs
            the_div.classList.add(`cell${ind}`);
            // Increment the ind variable
            ind += 1;
            content.push(the_div);
        }
        // Return the list of divs
        return content
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

    // Activate collapsibles on click
    function activateCollapsibles() {
        var coll = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            console.log('recognised click')
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
            content.style.maxHeight = null;
            } else {
            content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
        }
    }

    // Test version to build the types of table displays needed
    function doSearch() {
        // Build the url as we go along
        var searchUrl = `${BASE_GET_URL}/v2/search?`;

        // Get locations and exit function if not valid
        var depart = document.getElementById("depart").value;
        var arrive = document.getElementById("arrive").value;
        // Exit function if location values are not in the list of locations
        if (!(autocomplete_list.includes(depart) && autocomplete_list.includes(arrive))){
            alert("Please enter correct departure and arrival locations");
            return
        }
        // Get the codes for locations
        var fly_from = codeDictionary[depart];
        var fly_to = codeDictionary[arrive];
        // Append locations to the url
        searchUrl += `${Object.keys({fly_from})[0]}=${fly_from}&${Object.keys({fly_to})[0]}=${fly_to}`;

        // Get departure dates if value is there
        const dates = document.getElementById("departure_calendar").value.split(' - ');
        var date_from = dates[0];
        var date_to = dates[1];
        // Append dates to the string
        searchUrl += `&${Object.keys({date_from})[0]}=${date_from}&${Object.keys({date_to})[0]}=${date_to}`
        // Get return dates if return flight checkbox is ticked
        if ($("#return").prop("checked") === true) {
            // Get departure dates if value is there
            const dates = document.getElementById("return_calendar").value.split(' - ');
            var return_from = dates[0];
            var return_to = dates[1];
            // Append the two values to the list
            searchUrl += `&${Object.keys({return_from})[0]}=${return_from}&${Object.keys({return_to})[0]}=${return_to}`;
        }
        var limit = document.getElementById('limit_num').value;
        var price_to = document.getElementById("limit_price").value;
        if (price_to == 2000) {
            price_to = 50000;
        }
        searchUrl += `&${Object.keys({limit})[0]}=${limit}&${Object.keys({price_to})[0]}=${price_to}`;
        var max_sector_stopovers = $("#stop_limit").val();
        // if max stopovers has a value, add it to the string
        if (max_sector_stopovers !== 'Any') {
            searchUrl += `&${Object.keys({max_sector_stopovers})[0]}=${max_sector_stopovers}`;
        }

        // If departure is 'Anywhere' then do the anywhere search method
        if (depart == 'Anywhere') {
            doAnywhereSearch(searchUrl, depart, arrive);

        }


        function onSuccess(obj) {
            const data = obj.data
            console.log(data)

            if (data.length == 0) {
                // Alert the user if there were no results
                alert("There were no results for your search");
                // TODO remove the loading icon if its still going
                //stopLoader();
            } else {
                // Get back list of collapsibles or just a regular table
                const appendables = buildCollapsibleList(data, depart, arrive);
                // Get the div container to append to
                const tableContainer = document.getElementById('flights-container');
                //Iterate through list and append to the flight container
                for (const item of appendables) {
                    tableContainer.appendChild(item);
                }

                // Set up the collapsible open and closing
                activateCollapsibles();

            }
        }

        // var searchUrl = `${BASE_GET_URL}/v2/search?fly_from=${depart}&fly_to=${arrive}&date_from=${date_from}&date_to=${date_to}&return_from=${return_from}&return_to=${return_to}&limit=100`

        $.ajax(searchUrl, {type: "GET",
                data: {}, headers: {apikey: API_KEY}, success: onSuccess});

    }

    function doAnywhereSearch(searchUrl, depart, arrive) {
        // Get list of all continents
        var continent_list = []
        for (let i in location_dictionary) {
            if (i != 'Anywhere') {
                if (location_dictionary[i].type == 'continent') {
                    continent_list.push(i);
                }
            }
        }
        console.log(continent_list);

        // Initialise an empty list to hold all the appendables to the display
        var anywhere_appendables = [];
        // What to do on each successful AJAX call
        function onAnywhereSucceess(obj) {
            // If there are any results
            if (obj._results > 0) {
                const data = obj.data
                // Get back list of collapsibles or just a regular table
                const appendables = buildCollapsibleList(data, depart, arrive);
                // Add the collapsibles list to the anywhere appendables
                anywhere_appendables.push.apply(anywhere_appendables, appendables);
            }
        }

        // startLoader();

        // Set up the list of promises for the AJAX calls
        var promises = [];
        // Iterate through continent list and add AJAX call to the list of promises
        for (continent in continent_list) {
            //Replace the anywhere in the string with the correct continent code
            const search = 'anywhere';
            const replaceWith = continent_list[continent];
                

            const continentUrl = searchUrl.split(search).join(replaceWith);
            console.log(continentUrl);

            var request = $.ajax(continentUrl, {type: "GET",
            data: {}, headers: {apikey: API_KEY}, success: onAnywhereSucceess});

            // Push request to the list of promises
            promises.push(request);
        }

        // When the promises have concluded
        $.when.apply(null, promises).done(function (){
            if (anywhere_appendables.length < 1 ) {
                alert("No flights could be found");
            } else {
                // Get the div container to append to
                const tableContainer = document.getElementById('flights-container');
                // Order the collapsibles by price
                const ordered_appendables = orderCollapsibles(anywhere_appendables);
                //Iterate through list and append to the flight container
                for (const item of ordered_appendables) {
                    tableContainer.appendChild(item);
                }

                // Set up the collapsible open and closing
                activateCollapsibles();
            }


            // Close loader
            //stopLoader();
        })
    }

    function processResults(data, target) {
        // Create an empty list of flights
        var flights_dict = {};
        var location = "";
        // Iterate through list up to result limit
        for (let i = 0; i < data.length; i++) {
            // Make note of the target location
            if (target.includes('city')) {
                // Path to get the city names
                location = data[i][target];

            } else if (target.includes('country')) {
                // Path to get the country names
                location = data[i][target].name
            }

            // Create an empty flight entry
            var flight = {
                route: [],
                stops: [],
                depart: [],
                arrive: [],
                duration: [],
                cost: []
            }

            // Get OUTGOING 
            // Get route and append
            const out_route = `${location_dictionary[data[i].flyFrom].dispName} to ${location_dictionary[data[i].flyTo].dispName}`
            flight.route.push(out_route);
            // Initialise the stops lists
            var out_stops = [];
            var ret_stops = [];
            // Get the list of routes
            const stops = data[i].route;
            // Iterate through the stops
            for (let j = 0; j < stops.length; j++) {
                const stop = {
                    route: `${location_dictionary[stops[j].flyFrom].name} to ${location_dictionary[stops[j].flyTo].name}`,
                    depart: convertNiceDate(stops[j].local_departure),
                    arrive: convertNiceDate(stops[j].local_arrival),
                    duration: convertDuration( (new Date(stops[j].utc_arrival).getTime() - new Date(stops[j].utc_departure).getTime()) / 1000)
                }

                if (stops[j].return === 0) {
                    // Append to outgoing flights
                    out_stops.push(stop);
                } else if (stops[j].return === 1) {
                    // Append to return flights
                    ret_stops.push(stop);
                }
            }
            // Append stops to flight (or direct if only one)
            if (out_stops.length === 1) {
                flight.stops.push('Direct')
            } else {
                flight.stops.push(out_stops);
            }
            // Get departure time and append to flight
            const out_depart_time = convertNiceDate(data[i].local_departure);
            flight.depart.push(out_depart_time);
            // Get arrival time and append to flight
            const out_arrival_time = convertNiceDate(data[i].local_arrival);
            flight.arrive.push(out_arrival_time);
            // Get duration and append to flight
            const out_duration = convertDuration(data[i].duration.departure);
            flight.duration.push(out_duration);
            // Get price and append to flight
            const out_price = `€${data[i].price}`;
            flight.cost.push(out_price);

            // Get the return information if return stops list is not empty
            if (ret_stops.length > 0) {
                // Get route and append to flight
                const ret_route = `${location_dictionary[data[i].flyTo].dispName} to ${location_dictionary[data[i].flyFrom].dispName}`
                flight.route.push(ret_route);
                // Append stops to flight (or direct if only one)
                if (ret_stops.length === 1) {
                    flight.stops.push('Direct')
                } else {
                    flight.stops.push(ret_stops);
                }
                // Get departure time and append to flight
                const ret_depart_time = ret_stops[0].depart;
                flight.depart.push(ret_depart_time);
                // Get arrival time and append to flight
                const ret_arrive_time = ret_stops[ret_stops.length - 1].arrive;
                flight.arrive.push(ret_arrive_time);
                // Get duration and append to flight
                const ret_duration = convertDuration(data[i].duration.return);
                flight.duration.push(ret_duration);
                // Append null for return flight cost
                flight.cost.push(null);
            }

            // If flight dictionary has location, add flight to the value list, otherwise make a new key/value
            if (flights_dict.hasOwnProperty(location)) {
                flights_dict[location].push(flight);
            } else {
                // Create the key with the added flight in a list
                flights_dict[location] = [flight];
            }
        }
        console.log(flights_dict);
        return flights_dict;
    }

    function makeCollapsible(location, flights, direction) {
        // Make button and add class to it
        const btn = document.createElement('button');
        btn.classList.add('collapsible');
        // Add the text content
        btn.innerHTML = `Fly ${direction} ${location} from ${flights[0].cost[0]}`
        // Create the content div
        const col_content = document.createElement('div');
        // Add the 'collapsible-content' class
        col_content.classList.add('content');
        // Create a table with the flights
        const tab = createTableFromObjects(flights)
        // Attach the table to the collapsible content div
        col_content.appendChild(tab);

        const div = document.createElement('div');
        div.appendChild(btn);
        div.appendChild(col_content);

        return div;

    }

    // Function to decide the which display type will be persued
    function displayTypeBool(deptype, arrtype) {
        // Variable to be returned
        var disType;
        if (["airport", "city"].includes(deptype) && ["country"].includes(arrtype) || ["country"].includes(deptype) && ["country"].includes(arrtype)) {
            disType = 'cityArrival';
        } else if (["country"].includes(deptype) && ["airport", "city"].includes(arrtype)) {
            disType = 'cityDeparture'
        } else if ((["airport" , "city" , "country"].includes(deptype)  && ["region" , "continent" ,"anywhere"].includes(arrtype) )  ||  (["region" , "continent" , "anywhere"].includes(deptype) && ["region" , "continent"].includes(arrtype))) {
            disType = 'countryArrival'
        } else if (["region" , "continent" , "anywhere"].includes(deptype) && ["airport" , "city" , "country"].includes(arrtype)) {
            disType = 'countryDeparture'
        } else {
            disType = 'normal'
        }

        return disType
    }

    function buildCollapsibleList(data, depart, arrive) {
        // Create a list of collapsibles to be appended to the display
        var appendables = [];
        // Decide collapsible format based on the departure and arrival location types
        var deptype;
        var arrtype;
        // if depart or arrive is 'Anywhere', make it lower case
        if (depart == 'Anywhere') {
            deptype = 'anywhere';
        } else {
            deptype = location_dictionary[codeDictionary[depart]].type;
        }
        if (arrive == 'Anywhere') {
            arrtype = 'anywhere';
        } else {
            arrtype = location_dictionary[codeDictionary[arrive]].type;

        }

        const disType = displayTypeBool(deptype, arrtype);

        if (disType == 'cityArrival') {
            // CITY ARRIVAL
            // Create a dictionary of results to build into collapsibles
            const entry_dict = processResults(data, 'cityTo');
            // Iterate through the dictionary and make collapsibles, attaching table to each
            for (const location in entry_dict) {
                // Create the collapsible and add to the appendables list
                appendables.push(makeCollapsible(location, entry_dict[location], 'to'));
            }

        } else if (disType == 'cityDeparture') {
            // CITY DEPARTURE
            // Create a dictionary of results to build into collapsibles
            const entry_dict = processResults(data, 'cityFrom');
            // Iterate through the dictionary and make collapsibles, attaching table to each
            for (const location in entry_dict) {
                // Create the collapsible and add to the appendables list
                const collap = makeCollapsible(location, )
                appendables.push(makeCollapsible(location, entry_dict[location], 'from'));
            }

        } else if ( disType == 'countryArrival' ) {
            // COUNTRY ARRIVAL
            // Create a dictionary of results to build into collapsibles
            const entry_dict = processResults(data, 'countryTo');
            // Iterate through the dictionary and make collapsibles, attaching table to each
            for (const location in entry_dict) {
                // Create the collapsible and add to the appendables list
                appendables.push(makeCollapsible(location, entry_dict[location], 'to'));
            }

        } else if ( disType == 'countryDeparture' ) {
            // COUNTRY DEPARTURE
            // Create a dictionary of results to build into collapsibles
            const entry_dict = processResults(data, 'countryFrom');
            // Iterate through the dictionary and make collapsibles, attaching table to each
            for (const location in entry_dict) {
                // Create the collapsible and add to the appendables list
                appendables.push(makeCollapsible(location, entry_dict[location], 'from'));
            }

        } else {
            // NORMAL DISPLAY
            const entry_dict = processResults(data, 'cityTo');
            // Make a list of normal flights
            var normal_flights = []
            // Iterate through the dictionary locations
            for (var key in entry_dict) {
               normal_flights =  normal_flights.concat(entry_dict[key])
            }
            // Sort the flight list by price
            normal_flights.sort(function(a, b) {
                a = parseFloat(a.cost.slice(1));
                b = parseFloat(b.cost.slice(1));
                return a - b;
            })


            // Make a table of the list of flights and append to the appendibles
            appendables.push(createTableFromObjects(normal_flights));
        }
        console.log(appendables);

        return appendables
    }

    // Order collapsibles from an 'anywhere search'
    function orderCollapsibles(list) {
        // Function to sort the 
        function compare(a,b) {
            const r = /\d+/;
            // Match the integer values of the collapsibles text content
            var a_price = parseInt(a.firstChild.textContent.match(r));
            var b_price = parseInt(b.firstChild.textContent.match(r));

            if (a_price < b_price)
               return -1;
            if (a_price > b_price)
              return 1;
            return 0;
        }
          
        return list.sort(compare);
    }

    // FR4 Set listener to search button to activate search
    document.getElementById("search_button").addEventListener("click", doSearch);

}

// Set up the collapsible open and closing
document.addEventListener("DOMContentLoaded", (event) => {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        console.log('recognised click')
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
        content.style.maxHeight = null;
        } else {
        content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
    }


});



var autocomplete_list = [];
var location_dictionary = {};
var codeDictionary = [];

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
    route: ['Dublin (DUB) to London Stanstead (STN)'],
    stops: ['Direct'],
    depart: ['23/8/2023 07:30'],
    arrive: ['23/8/2023 08:50'],
    duration: ['1H 20M'],
    cost: ['€24']
}
var flight_two = {
    route: ['Dublin (DUB) to The Sea'],
    stops: [fake_stops],
    depart: ['23/8/2023 07:30'],
    arrive: ['23/8/2023 08:50'],
    duration: ['1H 20M'],
    cost: ['€24']
}
var flight_three = {
    route: ['Bloopy bin bop'],
    stops: [fake_stops_two],
    depart: ['23/8/2023 07:30'],
    arrive: ['23/8/2023 08:50'],
    duration: ['1H 20M'],
    cost: ['€24']
}
flights.push(flight_one, flight_two, flight_three);

var return_flights = [];
var flights_one =
    {route: ['Dublin (DUB) to London Stanstead (STN)', 'London Stanstead (STN) To Dublin (DUB)'],
    stops: ['Direct', fake_stops],
    depart: ['23/8/2023 07:30', '25/08/2023 11:45'],
    arrive: ['23/8/2023 08:50', '25/08/2023 13:10'],
    duration: ['1H 20M', '1H 30M'],
    cost: ['€24', null]
}

var flights_two =
    {route: ['Dublin (DUB) to London Stanstead (STN)', 'London Stanstead (STN) To Dublin (DUB)'],
    stops: ['Direct', fake_stops],
    depart: ['23/8/2023 07:30', '25/08/2023 11:45'],
    arrive: ['23/8/2023 08:50', '25/08/2023 13:10'],
    duration: ['1H 20M', '1H 30M'],
    cost: ['€24', null]
}

var flights_three = {
    route: ['Dublin (DUB) to Paris Charles de Gaul (CDG)', 'Paris Charles de Gaul (CDG) To Dublin (DUB)'],
    stops: ['Direct', fake_stops],
    depart: ['23/8/2023 07:30', '25/08/2023 11:45'],
    arrive: ['23/8/2023 08:50', '25/08/2023 13:10'],
    duration: ['1H 20M', '1H 30M'],
    cost: ['€24', null]
}

return_flights.push(flights_one, flights_two, flights_three);

var processed_dict = {
    London: [flights_one, flights_two],
    Paris: [flights_three]
}

module.exports = {FlightSearch: FlightSearch};