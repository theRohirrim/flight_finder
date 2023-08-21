const {FlightSearch} = require('../redo');

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

// describe('Get all the codes for locations', () => {
//     afterAll(() => {
//         jest.resetAllMocks();
//     });

//     var controller = new FlightSearch();
//     controller.doCodes()

//     // Set up lists for each location type
//     let country = []
//     let region = []
//     let continent = []

//     // Iterate through list and add appropriate values to lists
//     for (let i=0; i<autocomplete_list.length; i++) {
//             // Add country to list
//             if (autocomplete_list[i].includes('(Country)')) {
//                 country.push(autocomplete_list[i])
//             }

//             // Add region to list
//             if (autocomplete_list[i].includes('(Region)')) {
//                 region.push(autocomplete_list[i])
//             }

//             // Add country to list
//             if (autocomplete_list[i].includes('(Continent)')) {
//                 continent.push(autocomplete_list[i])
//             }
//     }

//     test('Should have all the country locations', () => {
//         expect(country.length).toBeGreaterThan(2000)
//     })

//     test('Should have all the region locations', () => {
//         expect(region.length).toBeGreaterThan(2000)
//     })

//     test('Should have all the country locations', () => {
//         expect(continent.length).toEqual(6)
//     })

//     test('Should have over 3500 locations', () => {
//         expect(autocomplete_list.length).toBeGreaterThan(3500)
//     })
// })

describe('Second thing here', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return subtraction of two numbers', () => {
        var controller = new FlightSearch();
        const subtract = controller.subtract(5,4)
        expect(subtract).toEqual(1);
    })
})

describe('Second thing here', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return subtraction of two numbers', () => {
        var controller = new FlightSearch();
        const subtract = controller.subtract(5,4)
        expect(subtract).toEqual(1);
    })
})