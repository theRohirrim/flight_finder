function testSuite(obj) {
    var controller = obj;


    function testIncrementDate() {
        // Test normal value
        var bool_one = controller.incrementDate('2014-04-22') == '2014-04-23';
        console.log("incrementDate('2014-04-22') == '2014-04-23': " + bool_one);
        
        // February boundary case
        var bool_two = controller.incrementDate('2023-02-28') == '2023-03-01';
        console.log("incrementDate('2023-02-28') == '2023-03-01': " + bool_two);

        // February leap year
        var bool_three = controller.incrementDate('2024-02-28') == '2024-02-29';
        console.log("incrementDate('2024-02-28') == '2024-02-29': " + bool_three);       // Josh Holt H740671X

        // Year boundary case
        var bool_four = controller.incrementDate('2023-12-31') == '2024-01-01';
        console.log("incrementDate('2023-12-31') == '2024-01-01'': " + bool_four);

        // Invalid input
        var bool_five = controller.incrementDate('25-04-2020') != '26-04-2020';
        console.log("incrementDate('25-04-2020') != '26-04-2020': " + bool_four);        

        var result = bool_one & bool_two & bool_three & bool_four & bool_five;
        if (result == true) {
            var string = "Pass";
        } else {
            var string = "Fail";
        }
        console.log("incrementDate test results: " + string);
    }


    function testConvertDateFormat() {
        // Test normal value
        var bool_one = controller.convertDateFormat('2014-04-22') == '22/04/2014';
        console.log("incrementDate('2014-04-22') == '2014/04/23': " + bool_one);
        
        // Lowest value in year
        var bool_two = controller.convertDateFormat('2017-01-01') == '01/01/2017';
        console.log("convertDateFormat('2017-01-01') == '01/01/2017': " + bool_two);            // Josh Holt H740671X

        // Highest value in year
        var bool_three = controller.convertDateFormat('2017-12-31') == '31/12/2017';
        console.log("convertDateFormat('2017-12-31') == '31/12/2017': " + bool_three);        

        var result = bool_one & bool_two & bool_three;
        if (result == true) {
            var string = "Pass";
        } else {
            var string = "Fail";
        }
        console.log("convertDateFormat test results: " + string);
    }

    function testConvertNiceDate() {
        // Test normal value - REMEMBER British Summer Time pushes the hour forwards
        var bool_one = controller.convertNiceDate('2023-07-04T15:45:00.000Z') == '4/7/2023 16:45';
        console.log("convertNiceDate('2023-07-04T15:45:00.000Z') == '4/7/2023 16:15' :" + bool_one);

        // Earliest Date in year       
        var bool_two = controller.convertNiceDate('2023-01-01T15:45:00.000Z') == '1/1/2023 15:45';
        console.log("convertNiceDate('2023-01-01T15:45:00.000Z') == '1/1/2023 15:15' :" + bool_two);
                
        // Latest Date in year       
        var bool_three = controller.convertNiceDate('2023-12-31T15:45:00.000Z') == '31/12/2023 15:45';
        console.log("convertNiceDate('2023-01-01T15:45:00.000Z') == '1/1/2023 15:15' :" + bool_three);          // Josh Holt H740671X

        // Earliest Time       
        var bool_four = controller.convertNiceDate('2023-01-08T00:00:00.000Z') == '8/1/2023 00:00';
        console.log("convertNiceDate('2023-01-08T00:00:00.000Z') == '8/1/2023 00:00' :" + bool_four);
        
        // Latest Time
        var bool_five = controller.convertNiceDate('2023-01-08T23:59:59.000Z') == '8/1/2023 23:59';
        console.log("convertNiceDate('2023-01-08T23:59:59.000Z') == '8/1/2023 23:59' :" + bool_five);      
        
        // Invalid input
        var bool_five = controller.convertNiceDate('2023-01-08 5 hours 57 minutes') != '08/01/2023 05:57';
        console.log("convertNiceDate('2023-01-08 5 hours 57 minutes') != '08/01/2023 05:57' :" + bool_five);
        
        var result = bool_one & bool_two & bool_three & bool_four & bool_five;
        if (result == true) {
            var string = "Pass";
        } else {
            var string = "Fail";
        }
        console.log("convertNiceDate test results: " + string);

    }

    function testConvertDuration() {

    }
    
    testIncrementDate();
    testConvertDateFormat();
    testConvertNiceDate();
}