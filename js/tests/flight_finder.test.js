const {FlightSearch} = require('../redo');
window.jQuery = window.$ = require('jquery');

//      FAILED ATTEMPT AT AUTOCOMPLETE DOM MANIPULATION TESTING
// describe('Test the autocomplete function', () => {
//     afterAll(() => {
//         jest.resetAllMocks();
//     });
//     const arr = ['Apple', 'Banana', 'Cherry', 'Coke', 'Zebra', 'Zealand']

//     document.body.innerHTML =
//     '<div>' +
//     '  <input id="depart" type="text"/>' +
//     '</div>';


//     var controller = new FlightSearch();
//     controller.autocomplete(document.getElementById('depart'), arr)

//     test('Should show the right number of autocomplete items in the DIV', () => {
//         const input = document.getElementById('depart');
//         const value = "C"

//         fireEvent.change(input, {
//             target: {
//                 value
//             }
//         })

//         let numb = document.getElementById("autocomplete-list").children.length;

//         expect(numb).toEqual(2);


//     })
// })

// Setup response data to be tested on later
var airport_locations;
var city_locations;
var country_locations;
var region_locations;
var continent_locations;

describe('Get all the codes for locations via AJAX requests', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    //Set up API URL                                        J Holt  H740671X
    var BASE_GET_URL = "https://api.tequila.kiwi.com";

    var API_KEY = "j9z5EBBq-xysj_2iuZzB21Oau3kNPRl_";


    test('T001 - Successful AJAX request - Airport', async() => {

        function onSuccess(obj) {
            airport_locations = obj;
        }
        
        // AIRPORT location search
        var searchAirUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=airport&limit=15000&sort=name&active_only=true';
        await $.ajax(searchAirUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});
        expect(airport_locations.locations.length).toBeGreaterThan(2000)
    })

    test('T002 - Successful AJAX request - City', async() => {
        function onSuccess(obj) {
            city_locations = obj;
        }

        // CITY location search
        var searchCityUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=city&limit=15000&sort=name&active_only=true';
        await $.ajax(searchCityUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});
        expect(city_locations.locations.length).toBeGreaterThan(2000);
    })

    test('T003 - Successful AJAX request - Country', async() => {
        function onSuccess(obj) {
            country_locations = obj;
        }
        // COUNTRY location search
        var searchCountryUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=country&limit=15000&sort=name&active_only=true';
        await $.ajax(searchCountryUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});        
        expect(country_locations.locations.length).toBeGreaterThan(150);
    })

    test('T004 - Successful AJAX request - Region', async() => {
        function onSuccess(obj) {
            region_locations = obj;
        }

        // REGION location search
        var searchRegionUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=region&limit=15000&sort=name&active_only=true';
        await $.ajax(searchRegionUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});
        
        expect(region_locations.locations.length).toBeGreaterThan(20)
    })

    test('T005 - Successful AJAX request - Continent', async() => {
        function onSuccess(obj) {
            continent_locations = obj;

        }

        // CONTINENT location search
        var searchContinentUrl = BASE_GET_URL + '/locations/dump?locale=en-US&location_types=continent&limit=15000&sort=name&active_only=true';
        await $.ajax(searchContinentUrl, {type: "GET", data: {}, headers: {apikey: API_KEY}, success: onSuccess});
        
        expect(continent_locations.locations.length).toEqual(6)
    })
})


describe('Extract data to a list', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    // Removes all accented characters from a string
    function convertString(string) {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Setup list of locations to be tested
    var location_list = [];
    var location_dictionary = {};
    var controller = new FlightSearch();

    test('T006 - Correctly extracted data - Airport', () => {
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

   
                // Add each entry to autocomplete list                          J Holt  H740671X
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary
                location_dictionary[auto_entry] = {code: obj.locations[i].code,
                type: obj.locations[i].type}
            }
        }
        onAiportSuccess(airport_locations);
        expect(location_list.length).toBeGreaterThan(3200);

        //Black box technique, test boundaries and then typical value
        expect(location_dictionary[Object.keys(location_dictionary)[Object.keys(location_dictionary).length - 1]].type).toEqual('airport')
        expect(location_dictionary[Object.keys(location_dictionary)[0]].type).toEqual('airport')
        expect(location_dictionary[Object.keys(location_dictionary)[500]].type).toEqual('airport')
    })

    test('T007 - Correctly extracted data - City', () => {
        var entries = {};
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

                    // Test the boundaries and middle value
                    if (i === 0 || 74 || 37) {
                        entries[auto_entry] = {code: obj.locations[i].id,
                        type: obj.locations[i].type}
                    }

                }
            }
        }

        onCitySuccess(city_locations);
        expect(location_list.length).toBeGreaterThan(3270);

        //Black box technique, test boundaries and then typical value
        expect(entries[Object.keys(entries)[0]].type).toEqual('city')
        expect(entries[Object.keys(entries)[1]].type).toEqual('city')        
        expect(entries[Object.keys(entries)[2]].type).toEqual('city')

    })

    test('T008 - Correctly extracted data - Country', () => {
        var entries = {}

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

                if (i === 0 || Math.floor(country_locations.locations.length) || country_locations.locations.length) {
                    entries[auto_entry] = {code: obj.locations[i].id,
                        type: obj.locations[i].type}
                }
            }

        }
        onCountrySuccess(country_locations);
        expect(location_list.length).toBeGreaterThan(3270 + country_locations.locations.length);

        //Black box technique, test boundaries and then typical value
        expect(entries[Object.keys(entries)[0]].type).toEqual('country')
        expect(entries[Object.keys(entries)[1]].type).toEqual('country')        
        expect(entries[Object.keys(entries)[2]].type).toEqual('country')
    })

    test('T009 - Correctly extracted data - Region', () => {
        var entries = {}

        // REGION LOCATION DATA
        function onRegionSuccess(obj) {
            // Go through list of codes                             J Holt H740671X
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Region)";
                // Add each entry to autocomplete list
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}

                if (i === 0 || Math.floor(region_locations.locations.length) || region_locations.locations.length) {
                    entries[auto_entry] = {code: obj.locations[i].id,
                        type: obj.locations[i].type}
                }
            }
        }

        onRegionSuccess(region_locations);
        expect(location_list.length).toBeGreaterThan(3270 + country_locations.locations.length +
            region_locations.locations.length);

        //Black box technique, test boundaries and then typical value
        expect(entries[Object.keys(entries)[0]].type).toEqual('region')
        expect(entries[Object.keys(entries)[1]].type).toEqual('region')        
        expect(entries[Object.keys(entries)[2]].type).toEqual('region')
    })

    test('T010 - Correctly extracted data - Continent', () => {
        var entries = {}

        function onContinentSuccess(obj) {
            // Go through list of codes
            for (let i = 0; i < obj.locations.length; i++) {
                var auto_entry = convertString(obj.locations[i].name) + " (Continent)";
                // Add each entry to autocomplete list                                  J Holt H740671X
                location_list.push(auto_entry);
                // Add each entry to lookup dictionary                    
                location_dictionary[auto_entry] = {code: obj.locations[i].id,
                    type: obj.locations[i].type}

                if (i === 0 || Math.floor(continent_locations.locations.length) || continent_locations.locations.length) {
                    entries[auto_entry] = {code: obj.locations[i].id,
                        type: obj.locations[i].type}
                }
            }
            onContinentSuccess(continent_locations);
            expect(location_list.length).toBeGreaterThan(3270 + country_locations.locations.length +
                region_locations.locations.length + continent_locations.locations.length);

            //Black box technique, test boundaries and then typical value
            expect(entries[Object.keys(entries)[0]].type).toEqual('continent')
            expect(entries[Object.keys(entries)[1]].type).toEqual('continent')        
            expect(entries[Object.keys(entries)[2]].type).toEqual('continent')
        }
    })
})

// Tests on smaller supplementary functions

describe('Smaller functions tested', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    // // Removes all accented characters from a string - DOESNT ACCEPT AS A FUNCTION
    // function convertString(string) {
    //     return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // };

    // convertString function
    test('T011 - convertString function to simplify text characters', async() => {
        expect('A Coruña'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).toEqual('A Coruna');
        expect('San José'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).toEqual('San Jose');
        expect('Nāpili-Honokōwai'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).toEqual('Napili-Honokowai');
    })

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
    
    test('T011 - convertNiceDate function to provide an intelligible date', async() => {
        expect(convertNiceDate('2023-08-30T20:40:00.00Z')).toEqual('30/8/2023 21:40');
        expect(convertNiceDate('2024-04-20T19:35:00.00Z')).toEqual('20/4/2024 20:35');
        expect(convertNiceDate('2021-11-15T10:25:00.00Z')).toEqual('15/11/2021 10:25');
        expect(convertNiceDate('2019-01-04T08:15:00.00Z')).toEqual('4/1/2019 08:15');
    })

    function convertDuration (seconds) {
        // Takes the duration from the flight info and converts to hours and mins               J Holt H740671X
        var minutes = seconds / 60;
        var hours = (Math.floor(minutes / 60)).toString();
        var remainder = (minutes % 60).toString();

        // Pad remainder if it is below 10
        if (remainder.toString() < 2) {
            remainder = '0' + remainder;
        }

        return hours + 'h ' + remainder + 'm';
    }

    test('T011 - convertDuration function to convert flight info duration into hours and minutes', async() => {
        expect(convertDuration(6000)).toEqual('1h 40m');
        expect(convertDuration(15000)).toEqual('4h 10m');
        expect(convertDuration(3600)).toEqual('1h 00m');
    })

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

    test('T011 - displayTypeBool function ', async() => {
        expect(displayTypeBool('aiport', 'airport')).toEqual('normal');
        expect(displayTypeBool('aiport', 'country')).toEqual('cityArrival');
        expect(displayTypeBool('country', 'airport')).toEqual('cityDeparture');
        expect(displayTypeBool('city', 'anywhere')).toEqual('countryArrival');
        expect(displayTypeBool('country', 'continent')).toEqual('countryArrival');
        expect(displayTypeBool('region', 'country')).toEqual('countryDeparture');    })

})

//module.exports = {location_list : location_list};