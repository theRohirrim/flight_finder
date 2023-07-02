/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    //
    
    // Setup controller object
    controller = new FlightSearch();

    // Set date to today function
    document.getElementById('datePicker').valueAsDate = new Date();

    controller.doCodes();

    // Set up autcomplete for text input fields
    controller.autocomplete(document.getElementById('depart'), autocomplete_list);
    controller.autocomplete(document.getElementById('arrive'), autocomplete_list);

}

// JavaScript 'class' with all functions within
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
;            for (var i = 0; i < x.length; i++) {
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

    // Increment Date by 1
    function incrementDate(date_str) {
        var parts = date_str.split("-");
        var dt = new Date(
            parseInt(parts[0], 10),      // year
            parseInt(parts[1], 10) - 1,  // month (starts with 0)
            parseInt(parts[2], 10)       // date
        );
        dt.setDate(dt.getDate() + 1);
        parts[0] = "" + dt.getFullYear();
        parts[1] = "" + (dt.getMonth() + 1);
        if (parts[1].length < 2) {
            parts[1] = "0" + parts[1];
        }
        parts[2] = "" + dt.getDate();
        if (parts[2].length < 2) {
            parts[2] = "0" + parts[2];
        }
        return parts.join("-");
    }

    // Date Format Converter - to match format accepted by the API (dd-mm-yyyy)
    function convertDateFormat(date_string) {
        const dateArray = date_string.split("-");
        const reversedArray = dateArray.reverse();
        const newDateString = reversedArray.join("/");
        return newDateString;
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

    function startLoader() {
        // Starts the loader image to signify to user results are incoming
        var img = document.getElementsByClassName('loader')[0];
        img.style.display = "";
    }

    function stopLoader() {
        // Removes the loader image
        var img = document.getElementsByClassName('loader')[0];
        img.style.display = "none";;
    }

    // Update display of price limit
    function updatePriceText() {
        var val = document.getElementById("limit_price").value;

        if (val == 2000) {
            document.getElementById('price_input').innerHTML = 'No Limit';
        } else {
            document.getElementById('price_input').innerHTML = "€" + val;
        }
    }
    

    // Initiate a search call to the API with included inputs
    function doSearch() {
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


        // Get the next day's date & convert format
        var tomorrow = convertDateFormat(incrementDate(date));
        date = convertDateFormat(date);

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

        // what to do on successful request
        function onSuccess(obj) {
            var flights = [];

            if (obj.data.length == 0) {
                // alert the user if there were no results
                if (obj.data.length == 0) {
                    alert("There were no results for your search");
                    // remove the loading icon if its still going
                    stopLoader();
                }
            } else {
                // Loop through the results up until the limit
                for (let i = 0; i < limit; i++) {
                    // Create a flight entry if it exists             // Josh Holt H740671X
                    if (obj.data[i]) {
                        var flight = {
                            route: obj.data[i].cityFrom + " (" + obj.data[i].flyFrom +
                             ") to " + obj.data[i].cityTo + " (" + obj.data[i].flyTo + ")",
                            depart: convertNiceDate(obj.data[i].local_departure),
                            arrive: convertNiceDate(obj.data[i].local_arrival),
                            duration: convertDuration(obj.data[i].duration.departure),
                            cost: '€' + obj.data[i].price
                        }
                        // Add the flight to the flight list if it is within price limit
                        if (obj.data[i].price <= price_limit){
                            flights.push(flight);
                        }
                    }
                }

                // Add table to the html
                const table = createTableFromObjects(flights);
                const tableContainer = document.getElementById('flights-container');
                tableContainer.appendChild(table);
            }
        }

        //Build the URL string
        var searchUrl = BASE_GET_URL + '/v2/search?' + 'fly_from=' + location_dictionary[depart].code +
         '&fly_to=' + location_dictionary[arrive].code + '&dateFrom=' + date + '&dateTo=' + tomorrow;

         // Catch errors on the inputs
         if (depart == arrive) {
            alert("You cannot have departure and arrival locations be the same.");
            stopLoader();
         } else if (new Date(document.getElementById("datePicker").value) < new Date().setUTCHours(0,0,0,0)) {
            alert("You cannot pick a date which is in the past.");
            stopLoader();
         } else if (depart == "Everywhere") {
            // Do list of ajax calls if departure is everywhere

            // Get list of all continents
            var continent_list = []
            for (let i in location_dictionary) {
                if (location_dictionary[i].type == 'continent') {
                    continent_list.push(location_dictionary[i].code);
                }
            }

            var everywhere_flights = [];
            // Success function for each AJAX call
            function onEverywhereSuccess(obj) {
                for (let i = 0; i < Math.round(limit/1.5); i++) {
                    // Create a flight entry if it exists
                    if (obj.data[i]) {
                        var flight = {
                            route: obj.data[i].cityFrom + " (" + obj.data[i].flyFrom +
                             ") to " + obj.data[i].cityTo + " (" + obj.data[i].flyTo + ")",
                            depart: convertNiceDate(obj.data[i].local_departure),
                            arrive: convertNiceDate(obj.data[i].local_arrival),
                            duration: convertDuration(obj.data[i].duration.departure),
                            cost: '€' + obj.data[i].price
                        }
                        // Add the flight to the flight list if it is within price limit
                        if (obj.data[i].price <= price_limit){
                            everywhere_flights.push(flight);
                        }
                    }
                }
            }
            
            // Start the loader
            startLoader();
            
            // Set up promises in which to check all ajax requests are complete
            var promises = [];
            // Iterate through continent list and perform AJAX call
            for (continent in continent_list) {
                //Build the URL string
                var searchUrl = BASE_GET_URL + '/v2/search?' + 'fly_from=' + continent_list[continent] +
                '&fly_to=' + location_dictionary[arrive].code + '&dateFrom=' + date + '&dateTo=' + tomorrow;

                var request = $.ajax(searchUrl, {type: "GET",
                data: {}, headers: {apikey: API_KEY}, success: onEverywhereSuccess});

                // Push ajax request to the array of promises
                promises.push(request);                                     // Josh Holt H740671X
             };

            $.when.apply(null, promises).done(function (){
                if (everywhere_flights.length < 1 ) {
                    alert("No flights could be found");
                } else {
                    // Sort the flight list by price
                    everywhere_flights.sort(function(a, b) {
                        a = parseFloat(a.cost.slice(1));
                        b = parseFloat(b.cost.slice(1));
                        return a - b;
                    })
                    
                    //Limit the size of the list of flights to the limit specified
                    everywhere_flights = everywhere_flights.splice(0, limit);
                    
                    // Push the flight list onto the html table
                    const table = createTableFromObjects(everywhere_flights);
                    const tableContainer = document.getElementById('flights-container');
                    tableContainer.appendChild(table);
                }
    
                // Close loader
                stopLoader();
            })
        } else {
            // do ajax call and set loader to active before being turned off at the completion of the call
            $.ajax(searchUrl, {type: "GET", 
            beforeSend: startLoader,
                data: {}, headers: {apikey: API_KEY}, success: onSuccess,
                complete: stopLoader});
         };
    };

    function convertString(string){
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    this.doCodes = function() {
        // AIRPORT LOCATION DATA
        function onAiportSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].city.name) + " (" + 
                obj.locations[i].code + "), " + obj.locations[i].city.country.name;
                // Add each entry to autocomplete list
                autocomplete_list.push(auto_entry);
                // Add each entry to lookup dictionary
                location_dictionary[auto_entry] = {code: obj.locations[i].code,
                type: obj.locations[i].type}
            }
        }                                                                                           // Josh Holt H740671X

        //Build the airport locations URL string
        var searchAirUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=airport&limit=15000&sort=name&active_only=true';
        
        $.ajax(searchAirUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onAiportSuccess});


        // CITY LOCATION DATA
        function onCitySuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                // Only add if city has more than one airport
                if (obj.locations[i].airports > 1) {
                    var auto_entry = convertString(obj.locations[i].name) + " (All Aiports), " + 
                    obj.locations[i].country.name;
                    // Add each entry to autocomplete list
                    autocomplete_list.push(auto_entry);
                    // Add each entry to lookup dictionary
                    location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
                }
            }
        }

        //Build the city locations URL string
        var searchCityUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=city&limit=15000&sort=name&active_only=true';
        
        $.ajax(searchCityUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onCitySuccess});


        // REGION LOCATION DATA
        function onCountrySuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Country)";
                // Add each entry to autocomplete list
                autocomplete_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }
        
        //Build the region locations URL string
        var searchCountryUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=country&limit=15000&sort=name&active_only=true';
                
        $.ajax(searchCountryUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onCountrySuccess});



        // REGION LOCATION DATA
        function onRegionSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Region)";
                // Add each entry to autocomplete list
                autocomplete_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }

        //Build the region locations URL string
        var searchRegionUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=region&limit=15000&sort=name&active_only=true';
        
        $.ajax(searchRegionUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onRegionSuccess});


        // CONTINENT LOCATION DATA
        function onContinentSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Continent)";
                // Add each entry to autocomplete list
                autocomplete_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}
            }
        }

        //Build the city locations URL string
        var searchContinentUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=continent&limit=15000&sort=name&active_only=true';
        
        $.ajax(searchContinentUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onContinentSuccess});

        // FR2 Add 'Everywhere' as a choice for departure and arrival.
        var everywhere_entry = 'Everywhere';
        autocomplete_list.push(everywhere_entry);
        location_dictionary[everywhere_entry] = {code: 'anywhere',
            type: 'anywhere'}


    }

    // FR4 Set listener to search button to activate search
    document.getElementById("search_button").addEventListener("click", doSearch); 
    // FR5 Set listener to price limit bar to show value
    document.getElementById("limit_price").addEventListener("change", updatePriceText);
}
var autocomplete_list = [];
var location_dictionary = {};