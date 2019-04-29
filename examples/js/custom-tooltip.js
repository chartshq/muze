/* eslint-disable */
d3.json('../data/cars.json', (data) => {
    const jsonData = [{"Maker":"chevrolet","Name":"chevrolet chevelle malibu","Miles_per_Gallon":18,"Cylinders":8,"Displacement":307,"Horsepower":130,"Weight_in_lbs":3504,"Acceleration":12,"Year":"1970-01-01","Origin":"USA"},{"Maker":"buick","Name":"buick skylark 320","Miles_per_Gallon":15,"Cylinders":8,"Displacement":350,"Horsepower":165,"Weight_in_lbs":3693,"Acceleration":11.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth satellite","Miles_per_Gallon":18,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":3436,"Acceleration":11,"Year":"1970-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc rebel sst","Miles_per_Gallon":16,"Cylinders":8,"Displacement":304,"Horsepower":150,"Weight_in_lbs":3433,"Acceleration":12,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford torino","Miles_per_Gallon":17,"Cylinders":8,"Displacement":302,"Horsepower":140,"Weight_in_lbs":3449,"Acceleration":10.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford galaxie 500","Miles_per_Gallon":15,"Cylinders":8,"Displacement":429,"Horsepower":198,"Weight_in_lbs":4341,"Acceleration":10,"Year":"1970-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet impala","Miles_per_Gallon":14,"Cylinders":8,"Displacement":454,"Horsepower":220,"Weight_in_lbs":4354,"Acceleration":9,"Year":"1970-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth fury iii","Miles_per_Gallon":14,"Cylinders":8,"Displacement":440,"Horsepower":215,"Weight_in_lbs":4312,"Acceleration":8.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac catalina","Miles_per_Gallon":14,"Cylinders":8,"Displacement":455,"Horsepower":225,"Weight_in_lbs":4425,"Acceleration":10,"Year":"1970-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc ambassador dpl","Miles_per_Gallon":15,"Cylinders":8,"Displacement":390,"Horsepower":190,"Weight_in_lbs":3850,"Acceleration":8.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"citroen","Name":"citroen ds-21 pallas","Miles_per_Gallon":null,"Cylinders":4,"Displacement":133,"Horsepower":115,"Weight_in_lbs":3090,"Acceleration":17.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"chevrolet","Name":"chevrolet chevelle concours (sw)","Miles_per_Gallon":null,"Cylinders":8,"Displacement":350,"Horsepower":165,"Weight_in_lbs":4142,"Acceleration":11.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford torino (sw)","Miles_per_Gallon":null,"Cylinders":8,"Displacement":351,"Horsepower":153,"Weight_in_lbs":4034,"Acceleration":11,"Year":"1970-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth satellite (sw)","Miles_per_Gallon":null,"Cylinders":8,"Displacement":383,"Horsepower":175,"Weight_in_lbs":4166,"Acceleration":10.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc rebel sst (sw)","Miles_per_Gallon":null,"Cylinders":8,"Displacement":360,"Horsepower":175,"Weight_in_lbs":3850,"Acceleration":11,"Year":"1970-01-01","Origin":"USA"},{"Maker":"dodge","Name":"dodge challenger se","Miles_per_Gallon":15,"Cylinders":8,"Displacement":383,"Horsepower":170,"Weight_in_lbs":3563,"Acceleration":10,"Year":"1970-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth 'cuda 340","Miles_per_Gallon":14,"Cylinders":8,"Displacement":340,"Horsepower":160,"Weight_in_lbs":3609,"Acceleration":8,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford mustang boss 302","Miles_per_Gallon":null,"Cylinders":8,"Displacement":302,"Horsepower":140,"Weight_in_lbs":3353,"Acceleration":8,"Year":"1970-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet monte carlo","Miles_per_Gallon":15,"Cylinders":8,"Displacement":400,"Horsepower":150,"Weight_in_lbs":3761,"Acceleration":9.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"buick","Name":"buick estate wagon (sw)","Miles_per_Gallon":14,"Cylinders":8,"Displacement":455,"Horsepower":225,"Weight_in_lbs":3086,"Acceleration":10,"Year":"1970-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota corona mark ii","Miles_per_Gallon":24,"Cylinders":4,"Displacement":113,"Horsepower":95,"Weight_in_lbs":2372,"Acceleration":15,"Year":"1970-01-01","Origin":"Japan"},{"Maker":"plymouth","Name":"plymouth duster","Miles_per_Gallon":22,"Cylinders":6,"Displacement":198,"Horsepower":95,"Weight_in_lbs":2833,"Acceleration":15.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc hornet","Miles_per_Gallon":18,"Cylinders":6,"Displacement":199,"Horsepower":97,"Weight_in_lbs":2774,"Acceleration":15.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford maverick","Miles_per_Gallon":21,"Cylinders":6,"Displacement":200,"Horsepower":85,"Weight_in_lbs":2587,"Acceleration":16,"Year":"1970-01-01","Origin":"USA"},{"Maker":"datsun","Name":"datsun pl510","Miles_per_Gallon":27,"Cylinders":4,"Displacement":97,"Horsepower":88,"Weight_in_lbs":2130,"Acceleration":14.5,"Year":"1970-01-01","Origin":"Japan"},{"Maker":"volkswagen","Name":"volkswagen 1131 deluxe sedan","Miles_per_Gallon":26,"Cylinders":4,"Displacement":97,"Horsepower":46,"Weight_in_lbs":1835,"Acceleration":20.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"peugeot","Name":"peugeot 504","Miles_per_Gallon":25,"Cylinders":4,"Displacement":110,"Horsepower":87,"Weight_in_lbs":2672,"Acceleration":17.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"audi","Name":"audi 100 ls","Miles_per_Gallon":24,"Cylinders":4,"Displacement":107,"Horsepower":90,"Weight_in_lbs":2430,"Acceleration":14.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"saab","Name":"saab 99e","Miles_per_Gallon":25,"Cylinders":4,"Displacement":104,"Horsepower":95,"Weight_in_lbs":2375,"Acceleration":17.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"bmw","Name":"bmw 2002","Miles_per_Gallon":26,"Cylinders":4,"Displacement":121,"Horsepower":113,"Weight_in_lbs":2234,"Acceleration":12.5,"Year":"1970-01-01","Origin":"Europe"},{"Maker":"amc","Name":"amc gremlin","Miles_per_Gallon":21,"Cylinders":6,"Displacement":199,"Horsepower":90,"Weight_in_lbs":2648,"Acceleration":15,"Year":"1970-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford f250","Miles_per_Gallon":10,"Cylinders":8,"Displacement":360,"Horsepower":215,"Weight_in_lbs":4615,"Acceleration":14,"Year":"1970-01-01","Origin":"USA"},{"Maker":"chevy","Name":"chevy c20","Miles_per_Gallon":10,"Cylinders":8,"Displacement":307,"Horsepower":200,"Weight_in_lbs":4376,"Acceleration":15,"Year":"1970-01-01","Origin":"USA"},{"Maker":"dodge","Name":"dodge d200","Miles_per_Gallon":11,"Cylinders":8,"Displacement":318,"Horsepower":210,"Weight_in_lbs":4382,"Acceleration":13.5,"Year":"1970-01-01","Origin":"USA"},{"Maker":"datsun","Name":"datsun pl510","Miles_per_Gallon":27,"Cylinders":4,"Displacement":97,"Horsepower":88,"Weight_in_lbs":2130,"Acceleration":14.5,"Year":"1971-01-01","Origin":"Japan"},{"Maker":"chevrolet","Name":"chevrolet vega 2300","Miles_per_Gallon":28,"Cylinders":4,"Displacement":140,"Horsepower":90,"Weight_in_lbs":2264,"Acceleration":15.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota corona","Miles_per_Gallon":25,"Cylinders":4,"Displacement":113,"Horsepower":95,"Weight_in_lbs":2228,"Acceleration":14,"Year":"1971-01-01","Origin":"Japan"},{"Maker":"ford","Name":"ford pinto","Miles_per_Gallon":25,"Cylinders":4,"Displacement":98,"Horsepower":null,"Weight_in_lbs":2046,"Acceleration":19,"Year":"1971-01-01","Origin":"USA"},{"Maker":"volkswagen","Name":"volkswagen super beetle 117","Miles_per_Gallon":null,"Cylinders":4,"Displacement":97,"Horsepower":48,"Weight_in_lbs":1978,"Acceleration":20,"Year":"1971-01-01","Origin":"Europe"},{"Maker":"amc","Name":"amc gremlin","Miles_per_Gallon":19,"Cylinders":6,"Displacement":232,"Horsepower":100,"Weight_in_lbs":2634,"Acceleration":13,"Year":"1971-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth satellite custom","Miles_per_Gallon":16,"Cylinders":6,"Displacement":225,"Horsepower":105,"Weight_in_lbs":3439,"Acceleration":15.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet chevelle malibu","Miles_per_Gallon":17,"Cylinders":6,"Displacement":250,"Horsepower":100,"Weight_in_lbs":3329,"Acceleration":15.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford torino 500","Miles_per_Gallon":19,"Cylinders":6,"Displacement":250,"Horsepower":88,"Weight_in_lbs":3302,"Acceleration":15.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc matador","Miles_per_Gallon":18,"Cylinders":6,"Displacement":232,"Horsepower":100,"Weight_in_lbs":3288,"Acceleration":15.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet impala","Miles_per_Gallon":14,"Cylinders":8,"Displacement":350,"Horsepower":165,"Weight_in_lbs":4209,"Acceleration":12,"Year":"1971-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac catalina brougham","Miles_per_Gallon":14,"Cylinders":8,"Displacement":400,"Horsepower":175,"Weight_in_lbs":4464,"Acceleration":11.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford galaxie 500","Miles_per_Gallon":14,"Cylinders":8,"Displacement":351,"Horsepower":153,"Weight_in_lbs":4154,"Acceleration":13.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth fury iii","Miles_per_Gallon":14,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":4096,"Acceleration":13,"Year":"1971-01-01","Origin":"USA"},{"Maker":"dodge","Name":"dodge monaco (sw)","Miles_per_Gallon":12,"Cylinders":8,"Displacement":383,"Horsepower":180,"Weight_in_lbs":4955,"Acceleration":11.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford country squire (sw)","Miles_per_Gallon":13,"Cylinders":8,"Displacement":400,"Horsepower":170,"Weight_in_lbs":4746,"Acceleration":12,"Year":"1971-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac safari (sw)","Miles_per_Gallon":13,"Cylinders":8,"Displacement":400,"Horsepower":175,"Weight_in_lbs":5140,"Acceleration":12,"Year":"1971-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc hornet sportabout (sw)","Miles_per_Gallon":18,"Cylinders":6,"Displacement":258,"Horsepower":110,"Weight_in_lbs":2962,"Acceleration":13.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet vega (sw)","Miles_per_Gallon":22,"Cylinders":4,"Displacement":140,"Horsepower":72,"Weight_in_lbs":2408,"Acceleration":19,"Year":"1971-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac firebird","Miles_per_Gallon":19,"Cylinders":6,"Displacement":250,"Horsepower":100,"Weight_in_lbs":3282,"Acceleration":15,"Year":"1971-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford mustang","Miles_per_Gallon":18,"Cylinders":6,"Displacement":250,"Horsepower":88,"Weight_in_lbs":3139,"Acceleration":14.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"mercury","Name":"mercury capri 2000","Miles_per_Gallon":23,"Cylinders":4,"Displacement":122,"Horsepower":86,"Weight_in_lbs":2220,"Acceleration":14,"Year":"1971-01-01","Origin":"USA"},{"Maker":"opel","Name":"opel 1900","Miles_per_Gallon":28,"Cylinders":4,"Displacement":116,"Horsepower":90,"Weight_in_lbs":2123,"Acceleration":14,"Year":"1971-01-01","Origin":"Europe"},{"Maker":"peugeot","Name":"peugeot 304","Miles_per_Gallon":30,"Cylinders":4,"Displacement":79,"Horsepower":70,"Weight_in_lbs":2074,"Acceleration":19.5,"Year":"1971-01-01","Origin":"Europe"},{"Maker":"fiat","Name":"fiat 124b","Miles_per_Gallon":30,"Cylinders":4,"Displacement":88,"Horsepower":76,"Weight_in_lbs":2065,"Acceleration":14.5,"Year":"1971-01-01","Origin":"Europe"},{"Maker":"toyota","Name":"toyota corolla 1200","Miles_per_Gallon":31,"Cylinders":4,"Displacement":71,"Horsepower":65,"Weight_in_lbs":1773,"Acceleration":19,"Year":"1971-01-01","Origin":"Japan"},{"Maker":"datsun","Name":"datsun 1200","Miles_per_Gallon":35,"Cylinders":4,"Displacement":72,"Horsepower":69,"Weight_in_lbs":1613,"Acceleration":18,"Year":"1971-01-01","Origin":"Japan"},{"Maker":"volkswagen","Name":"volkswagen model 111","Miles_per_Gallon":27,"Cylinders":4,"Displacement":97,"Horsepower":60,"Weight_in_lbs":1834,"Acceleration":19,"Year":"1971-01-01","Origin":"Europe"},{"Maker":"plymouth","Name":"plymouth cricket","Miles_per_Gallon":26,"Cylinders":4,"Displacement":91,"Horsepower":70,"Weight_in_lbs":1955,"Acceleration":20.5,"Year":"1971-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota corona hardtop","Miles_per_Gallon":24,"Cylinders":4,"Displacement":113,"Horsepower":95,"Weight_in_lbs":2278,"Acceleration":15.5,"Year":"1972-01-01","Origin":"Japan"},{"Maker":"dodge","Name":"dodge colt hardtop","Miles_per_Gallon":25,"Cylinders":4,"Displacement":97.5,"Horsepower":80,"Weight_in_lbs":2126,"Acceleration":17,"Year":"1972-01-01","Origin":"USA"},{"Maker":"volkswagen","Name":"volkswagen type 3","Miles_per_Gallon":23,"Cylinders":4,"Displacement":97,"Horsepower":54,"Weight_in_lbs":2254,"Acceleration":23.5,"Year":"1972-01-01","Origin":"Europe"},{"Maker":"chevrolet","Name":"chevrolet vega","Miles_per_Gallon":20,"Cylinders":4,"Displacement":140,"Horsepower":90,"Weight_in_lbs":2408,"Acceleration":19.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford pinto runabout","Miles_per_Gallon":21,"Cylinders":4,"Displacement":122,"Horsepower":86,"Weight_in_lbs":2226,"Acceleration":16.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet impala","Miles_per_Gallon":13,"Cylinders":8,"Displacement":350,"Horsepower":165,"Weight_in_lbs":4274,"Acceleration":12,"Year":"1972-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac catalina","Miles_per_Gallon":14,"Cylinders":8,"Displacement":400,"Horsepower":175,"Weight_in_lbs":4385,"Acceleration":12,"Year":"1972-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth fury iii","Miles_per_Gallon":15,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":4135,"Acceleration":13.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford galaxie 500","Miles_per_Gallon":14,"Cylinders":8,"Displacement":351,"Horsepower":153,"Weight_in_lbs":4129,"Acceleration":13,"Year":"1972-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc ambassador sst","Miles_per_Gallon":17,"Cylinders":8,"Displacement":304,"Horsepower":150,"Weight_in_lbs":3672,"Acceleration":11.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"mercury","Name":"mercury marquis","Miles_per_Gallon":11,"Cylinders":8,"Displacement":429,"Horsepower":208,"Weight_in_lbs":4633,"Acceleration":11,"Year":"1972-01-01","Origin":"USA"},{"Maker":"buick","Name":"buick lesabre custom","Miles_per_Gallon":13,"Cylinders":8,"Displacement":350,"Horsepower":155,"Weight_in_lbs":4502,"Acceleration":13.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"oldsmobile","Name":"oldsmobile delta 88 royale","Miles_per_Gallon":12,"Cylinders":8,"Displacement":350,"Horsepower":160,"Weight_in_lbs":4456,"Acceleration":13.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"chrysler","Name":"chrysler newport royal","Miles_per_Gallon":13,"Cylinders":8,"Displacement":400,"Horsepower":190,"Weight_in_lbs":4422,"Acceleration":12.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"mazda","Name":"mazda rx2 coupe","Miles_per_Gallon":19,"Cylinders":3,"Displacement":70,"Horsepower":97,"Weight_in_lbs":2330,"Acceleration":13.5,"Year":"1972-01-01","Origin":"Japan"},{"Maker":"amc","Name":"amc matador (sw)","Miles_per_Gallon":15,"Cylinders":8,"Displacement":304,"Horsepower":150,"Weight_in_lbs":3892,"Acceleration":12.5,"Year":"1972-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet chevelle concours (sw)","Miles_per_Gallon":13,"Cylinders":8,"Displacement":307,"Horsepower":130,"Weight_in_lbs":4098,"Acceleration":14,"Year":"1972-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford gran torino (sw)","Miles_per_Gallon":13,"Cylinders":8,"Displacement":302,"Horsepower":140,"Weight_in_lbs":4294,"Acceleration":16,"Year":"1972-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth satellite custom (sw)","Miles_per_Gallon":14,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":4077,"Acceleration":14,"Year":"1972-01-01","Origin":"USA"},{"Maker":"volvo","Name":"volvo 145e (sw)","Miles_per_Gallon":18,"Cylinders":4,"Displacement":121,"Horsepower":112,"Weight_in_lbs":2933,"Acceleration":14.5,"Year":"1972-01-01","Origin":"Europe"},{"Maker":"volkswagen","Name":"volkswagen 411 (sw)","Miles_per_Gallon":22,"Cylinders":4,"Displacement":121,"Horsepower":76,"Weight_in_lbs":2511,"Acceleration":18,"Year":"1972-01-01","Origin":"Europe"},{"Maker":"peugeot","Name":"peugeot 504 (sw)","Miles_per_Gallon":21,"Cylinders":4,"Displacement":120,"Horsepower":87,"Weight_in_lbs":2979,"Acceleration":19.5,"Year":"1972-01-01","Origin":"Europe"},{"Maker":"renault","Name":"renault 12 (sw)","Miles_per_Gallon":26,"Cylinders":4,"Displacement":96,"Horsepower":69,"Weight_in_lbs":2189,"Acceleration":18,"Year":"1972-01-01","Origin":"Europe"},{"Maker":"ford","Name":"ford pinto (sw)","Miles_per_Gallon":22,"Cylinders":4,"Displacement":122,"Horsepower":86,"Weight_in_lbs":2395,"Acceleration":16,"Year":"1972-01-01","Origin":"USA"},{"Maker":"datsun","Name":"datsun 510 (sw)","Miles_per_Gallon":28,"Cylinders":4,"Displacement":97,"Horsepower":92,"Weight_in_lbs":2288,"Acceleration":17,"Year":"1972-01-01","Origin":"Japan"},{"Maker":"toyouta","Name":"toyouta corona mark ii (sw)","Miles_per_Gallon":23,"Cylinders":4,"Displacement":120,"Horsepower":97,"Weight_in_lbs":2506,"Acceleration":14.5,"Year":"1972-01-01","Origin":"Japan"},{"Maker":"dodge","Name":"dodge colt (sw)","Miles_per_Gallon":28,"Cylinders":4,"Displacement":98,"Horsepower":80,"Weight_in_lbs":2164,"Acceleration":15,"Year":"1972-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota corolla 1600 (sw)","Miles_per_Gallon":27,"Cylinders":4,"Displacement":97,"Horsepower":88,"Weight_in_lbs":2100,"Acceleration":16.5,"Year":"1972-01-01","Origin":"Japan"},{"Maker":"buick","Name":"buick century 350","Miles_per_Gallon":13,"Cylinders":8,"Displacement":350,"Horsepower":175,"Weight_in_lbs":4100,"Acceleration":13,"Year":"1973-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc matador","Miles_per_Gallon":14,"Cylinders":8,"Displacement":304,"Horsepower":150,"Weight_in_lbs":3672,"Acceleration":11.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet malibu","Miles_per_Gallon":13,"Cylinders":8,"Displacement":350,"Horsepower":145,"Weight_in_lbs":3988,"Acceleration":13,"Year":"1973-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford gran torino","Miles_per_Gallon":14,"Cylinders":8,"Displacement":302,"Horsepower":137,"Weight_in_lbs":4042,"Acceleration":14.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"dodge","Name":"dodge coronet custom","Miles_per_Gallon":15,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":3777,"Acceleration":12.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"mercury","Name":"mercury marquis brougham","Miles_per_Gallon":12,"Cylinders":8,"Displacement":429,"Horsepower":198,"Weight_in_lbs":4952,"Acceleration":11.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet caprice classic","Miles_per_Gallon":13,"Cylinders":8,"Displacement":400,"Horsepower":150,"Weight_in_lbs":4464,"Acceleration":12,"Year":"1973-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford ltd","Miles_per_Gallon":13,"Cylinders":8,"Displacement":351,"Horsepower":158,"Weight_in_lbs":4363,"Acceleration":13,"Year":"1973-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth fury gran sedan","Miles_per_Gallon":14,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":4237,"Acceleration":14.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"chrysler","Name":"chrysler new yorker brougham","Miles_per_Gallon":13,"Cylinders":8,"Displacement":440,"Horsepower":215,"Weight_in_lbs":4735,"Acceleration":11,"Year":"1973-01-01","Origin":"USA"},{"Maker":"buick","Name":"buick electra 225 custom","Miles_per_Gallon":12,"Cylinders":8,"Displacement":455,"Horsepower":225,"Weight_in_lbs":4951,"Acceleration":11,"Year":"1973-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc ambassador brougham","Miles_per_Gallon":13,"Cylinders":8,"Displacement":360,"Horsepower":175,"Weight_in_lbs":3821,"Acceleration":11,"Year":"1973-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth valiant","Miles_per_Gallon":18,"Cylinders":6,"Displacement":225,"Horsepower":105,"Weight_in_lbs":3121,"Acceleration":16.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet nova custom","Miles_per_Gallon":16,"Cylinders":6,"Displacement":250,"Horsepower":100,"Weight_in_lbs":3278,"Acceleration":18,"Year":"1973-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc hornet","Miles_per_Gallon":18,"Cylinders":6,"Displacement":232,"Horsepower":100,"Weight_in_lbs":2945,"Acceleration":16,"Year":"1973-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford maverick","Miles_per_Gallon":18,"Cylinders":6,"Displacement":250,"Horsepower":88,"Weight_in_lbs":3021,"Acceleration":16.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth duster","Miles_per_Gallon":23,"Cylinders":6,"Displacement":198,"Horsepower":95,"Weight_in_lbs":2904,"Acceleration":16,"Year":"1973-01-01","Origin":"USA"},{"Maker":"volkswagen","Name":"volkswagen super beetle","Miles_per_Gallon":26,"Cylinders":4,"Displacement":97,"Horsepower":46,"Weight_in_lbs":1950,"Acceleration":21,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"chevrolet","Name":"chevrolet impala","Miles_per_Gallon":11,"Cylinders":8,"Displacement":400,"Horsepower":150,"Weight_in_lbs":4997,"Acceleration":14,"Year":"1973-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford country","Miles_per_Gallon":12,"Cylinders":8,"Displacement":400,"Horsepower":167,"Weight_in_lbs":4906,"Acceleration":12.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth custom suburb","Miles_per_Gallon":13,"Cylinders":8,"Displacement":360,"Horsepower":170,"Weight_in_lbs":4654,"Acceleration":13,"Year":"1973-01-01","Origin":"USA"},{"Maker":"oldsmobile","Name":"oldsmobile vista cruiser","Miles_per_Gallon":12,"Cylinders":8,"Displacement":350,"Horsepower":180,"Weight_in_lbs":4499,"Acceleration":12.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc gremlin","Miles_per_Gallon":18,"Cylinders":6,"Displacement":232,"Horsepower":100,"Weight_in_lbs":2789,"Acceleration":15,"Year":"1973-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota carina","Miles_per_Gallon":20,"Cylinders":4,"Displacement":97,"Horsepower":88,"Weight_in_lbs":2279,"Acceleration":19,"Year":"1973-01-01","Origin":"Japan"},{"Maker":"chevrolet","Name":"chevrolet vega","Miles_per_Gallon":21,"Cylinders":4,"Displacement":140,"Horsepower":72,"Weight_in_lbs":2401,"Acceleration":19.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"datsun","Name":"datsun 610","Miles_per_Gallon":22,"Cylinders":4,"Displacement":108,"Horsepower":94,"Weight_in_lbs":2379,"Acceleration":16.5,"Year":"1973-01-01","Origin":"Japan"},{"Maker":"maxda","Name":"maxda rx3","Miles_per_Gallon":18,"Cylinders":3,"Displacement":70,"Horsepower":90,"Weight_in_lbs":2124,"Acceleration":13.5,"Year":"1973-01-01","Origin":"Japan"},{"Maker":"ford","Name":"ford pinto","Miles_per_Gallon":19,"Cylinders":4,"Displacement":122,"Horsepower":85,"Weight_in_lbs":2310,"Acceleration":18.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"mercury","Name":"mercury capri v6","Miles_per_Gallon":21,"Cylinders":6,"Displacement":155,"Horsepower":107,"Weight_in_lbs":2472,"Acceleration":14,"Year":"1973-01-01","Origin":"USA"},{"Maker":"fiat","Name":"fiat 124 sport coupe","Miles_per_Gallon":26,"Cylinders":4,"Displacement":98,"Horsepower":90,"Weight_in_lbs":2265,"Acceleration":15.5,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"chevrolet","Name":"chevrolet monte carlo s","Miles_per_Gallon":15,"Cylinders":8,"Displacement":350,"Horsepower":145,"Weight_in_lbs":4082,"Acceleration":13,"Year":"1973-01-01","Origin":"USA"},{"Maker":"pontiac","Name":"pontiac grand prix","Miles_per_Gallon":16,"Cylinders":8,"Displacement":400,"Horsepower":230,"Weight_in_lbs":4278,"Acceleration":9.5,"Year":"1973-01-01","Origin":"USA"},{"Maker":"fiat","Name":"fiat 128","Miles_per_Gallon":29,"Cylinders":4,"Displacement":68,"Horsepower":49,"Weight_in_lbs":1867,"Acceleration":19.5,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"opel","Name":"opel manta","Miles_per_Gallon":24,"Cylinders":4,"Displacement":116,"Horsepower":75,"Weight_in_lbs":2158,"Acceleration":15.5,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"audi","Name":"audi 100ls","Miles_per_Gallon":20,"Cylinders":4,"Displacement":114,"Horsepower":91,"Weight_in_lbs":2582,"Acceleration":14,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"volvo","Name":"volvo 144ea","Miles_per_Gallon":19,"Cylinders":4,"Displacement":121,"Horsepower":112,"Weight_in_lbs":2868,"Acceleration":15.5,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"dodge","Name":"dodge dart custom","Miles_per_Gallon":15,"Cylinders":8,"Displacement":318,"Horsepower":150,"Weight_in_lbs":3399,"Acceleration":11,"Year":"1973-01-01","Origin":"USA"},{"Maker":"saab","Name":"saab 99le","Miles_per_Gallon":24,"Cylinders":4,"Displacement":121,"Horsepower":110,"Weight_in_lbs":2660,"Acceleration":14,"Year":"1973-01-01","Origin":"Europe"},{"Maker":"toyota","Name":"toyota mark ii","Miles_per_Gallon":20,"Cylinders":6,"Displacement":156,"Horsepower":122,"Weight_in_lbs":2807,"Acceleration":13.5,"Year":"1973-01-01","Origin":"Japan"},{"Maker":"oldsmobile","Name":"oldsmobile omega","Miles_per_Gallon":11,"Cylinders":8,"Displacement":350,"Horsepower":180,"Weight_in_lbs":3664,"Acceleration":11,"Year":"1973-01-01","Origin":"USA"},{"Maker":"plymouth","Name":"plymouth duster","Miles_per_Gallon":20,"Cylinders":6,"Displacement":198,"Horsepower":95,"Weight_in_lbs":3102,"Acceleration":16.5,"Year":"1974-01-01","Origin":"USA"},{"Maker":"ford","Name":"ford maverick","Miles_per_Gallon":21,"Cylinders":6,"Displacement":200,"Horsepower":null,"Weight_in_lbs":2875,"Acceleration":17,"Year":"1974-01-01","Origin":"USA"},{"Maker":"amc","Name":"amc hornet","Miles_per_Gallon":19,"Cylinders":6,"Displacement":232,"Horsepower":100,"Weight_in_lbs":2901,"Acceleration":16,"Year":"1974-01-01","Origin":"USA"},{"Maker":"chevrolet","Name":"chevrolet nova","Miles_per_Gallon":15,"Cylinders":6,"Displacement":250,"Horsepower":100,"Weight_in_lbs":3336,"Acceleration":17,"Year":"1974-01-01","Origin":"USA"},{"Maker":"datsun","Name":"datsun b210","Miles_per_Gallon":31,"Cylinders":4,"Displacement":79,"Horsepower":67,"Weight_in_lbs":1950,"Acceleration":19,"Year":"1974-01-01","Origin":"Japan"},{"Maker":"ford","Name":"ford pinto","Miles_per_Gallon":26,"Cylinders":4,"Displacement":122,"Horsepower":80,"Weight_in_lbs":2451,"Acceleration":16.5,"Year":"1974-01-01","Origin":"USA"},{"Maker":"toyota","Name":"toyota corolla 1200","Miles_per_Gallon":32,"Cylinders":4,"Displacement":71,"Horsepower":65,"Weight_in_lbs":1836,"Acceleration":21,"Year":"1974-01-01","Origin":"Japan"}];
    const schema = [
        {
            name: 'Name',
            type: 'dimension'
        },
        {
            name: 'Maker',
            type: 'dimension'
        },
        {
            name: 'Miles_per_Gallon',
            type: 'measure',
            defAggFn: 'avg'
        },

        {
            name: 'Displacement',
            type: 'measure'
        },
        {
            name: 'Horsepower',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Weight_in_lbs',
            type: 'measure'
        },
        {
            name: 'Acceleration',
            type: 'measure',
            defAggFn: 'sum'
        },
        {
            name: 'Origin',
            type: 'dimension'
        },
        {
            name: 'Cylinders',
            type: 'dimension'
        },
        {
            name: 'Year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
    ];

    const env = muze();
    const DataModel = muze.DataModel;

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count',
            numberFormat: val => parseInt(val, 10)
        },
        ['Name', () => 1]
    );
    env.data(rootData);

    // line chart
    window.canvas = env.canvas()
        .columns(['Origin', 'Year'])
        .rows(['Horsepower'])
        .width(700)
        .height(500)
        .data(rootData.select((fields) => new Date(fields.Year.value).getFullYear() <= 1974 ))
        // .layers([{
        //     mark: 'line'
        // }])
        .title('Line Chart')
        .mount('#chart');

    canvas.once('canvas.updated').then(() => {
        const vGroup = canvas.composition().visualGroup;
        vGroup.matrixInstance().value.each((cell) => {
            const sideEffects = cell.valueOf().firebolt().sideEffects();
            const strategyFn = sideEffects.tooltip._strategies.highlightSummary;
            sideEffects.tooltip.setStrategy('highlightSummary', (dm, config, context) => {
                const content = strategyFn(dm, config, context);
                content.push([{
                    value: '<hr></hr>',
                    style: {
                        margin: '0px',
                        display: 'block'
                    }
                }], [{
                    value: 'Double Click to see data',
                    style: {
                        'font-weight': 'bold'
                    }
                }]);
                return content;
            });
        });
    });
    // stacked bar chart
    env.canvas()
        .rows([])
        .columns([])
        .width(600)
        .color('Origin')
        .layers([{
            mark: 'arc',
            encoding: {
                angle: 'Maker',
                radius: 'Acceleration'
            },
            transform: {
                type: 'stack'
            }
        }, {
            mark: 'text',
            encoding: {
                angle: 'Maker',
                radius: 'Acceleration',
                text: {
                    field: 'Acceleration',
                    formatter: (d) => d.toFixed(2)
                },
                rotation: {
                    value: () => 40
                }
            }
        }, {
            mark: 'tick',
            encoding: {
                angle: 'Maker',
                radius0: {
                    value: (d) => {
                        return d.radius + 20;
                    }
                },
                radius: 'Acceleration',
                text: {
                    field: 'Acceleration',
                    formatter: (d) => d.toFixed(2)
                },
                rotation: {
                    value: () => 40
                }
            }
        }])
        .height(500)
        .title('Stacked Bar Chart')
        .mount('#chart2');

    // grouped bar chart with line
    env.canvas()
        .rows(['Miles_per_Gallon'])
        .columns(['Year'])
        .width(1050)
        .color('Origin')
        .layers([{
            mark: 'bar'
        }, {
            mark: 'line'
        }])
        .height(300)
        .title('Grouped Bar Chart and Line')
        .mount('#chart3');
});
