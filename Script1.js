var targetDest = "http://213.197.173.50:3153/Staging/FutureDemographicsDemo-XML/PopulationData.xml"
var xmlArray = []

function d3CustomXMLParse(url) {
	d3.xml(url, function(error, rawXML) {
		if (error) throw error;

		// Convert the XML document to an array of objects.
		// Note that querySelectorAll returns a NodeList, not a proper Array,
		// so we must use map.call to invoke array methods.
		var d = [].map.call(rawXML.querySelectorAll("Row"), function(Row) {
			
			var cell = [];
			
				for (i=0; i<Row.childElementCount; i++){
					
					cell[i] = Row.children[i].childNodes[0].nodeValue
					
				};
			
			return cell
		});
		xmlArray = makeObjectKeys(d)
	});
};


function makeObjectKeys(parsedXML){
	
	var objectKeys = parsedXML[0],
		mainValues  = parsedXML.slice(1)
		
		result = mainValues.map(function(mainValue){
			
			var valueObject = {}
			
			objectKeys.forEach(function(objectKey, i){
				
				valueObject[objectKey] = mainValue[i]
				
			});
			
			return valueObject;			
			
		});
		
	return result
	
};
