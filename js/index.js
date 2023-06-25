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

    // Gets locations and sets them into local storage for autocomplete
    function getLocations() {

        function onSuccess(obj) {
            console.log("Locations retrieved", obj);

            var location_data;
        }
    }

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

    // Date Format Converter - to match format accepted by the API
    function convertDateFormat(date_string) {
        const dateArray = date_string.split("-");
        const reversedArray = dateArray.reverse();
        const newDateString = reversedArray.join("/");
        return newDateString;
    }
    

    // Initiate a search call to the API with included inputs
    function doSearch() {
        // Get all the inputs from the HTML
        var depart = document.getElementById("depart").value;
        var arrive = document.getElementById("arrive").value;
        var date = document.getElementById("datePicker").value;
        var limit = document.getElementById("limit_num").value;
        // Get the next day's date & convert format
        var tomorrow = convertDateFormat(incrementDate(date));
        date = convertDateFormat(date);

        console.log(depart, arrive, date, tomorrow, limit);

        function onSuccess(obj) {
            console.log(obj);
        }

        //Build the URL string
        var searchUrl = BASE_GET_URL + '/v2/search?' + 'fly_from=' + depart +
         '&fly_to=' + arrive + '&dateFrom=' + date + '&dateTo=' + tomorrow;

        
         $.ajax(searchUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});
    }

    this.doCodes = function() {

        function onSuccess(obj) {
            console.log(obj);

            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = obj.locations[i].city.name + " (" + 
                obj.locations[i].code + "), " + obj.locations[i].city.country.name;
                autocomplete_list.push(auto_entry);
            }
            console.log(autocomplete_list);
        }

        //Build the locations URL string
        var searchUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=airport&limit=10000&sort=name&active_only=true';
        
         $.ajax(searchUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});

    }

    // Set listener to search button to activate search
    document.getElementById("search_button").addEventListener("click", doSearch); 
}
var autocomplete_list = [];
var location_dictionary = {};