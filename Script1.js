window.onload = function(){
var targetDest = "http://213.197.173.50:3153/Staging/FutureDemographicsDemo-XML/PopulationData.xml"

d3.xml(targetDest, d3CustomXMLParse);


function d3CustomXMLParse(error, rawXML) {
	
	var xmlArray = []
	
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
	xmlArray = makeObjectKeys(d);
	render(xmlArray);

};


function makeObjectKeys(parsedXML){
	
	var objectKeys = parsedXML[0],
		mainValues  = parsedXML.slice(1)
		
		result = mainValues.map(function(mainValue){
			
			var valueObject = {}
			
			objectKeys.forEach(function(objectKey, i){
				
				var objValue = mainValue[i].replace("0x","#");
				
				valueObject[objectKey] = (!isNaN(objValue) ? +objValue : objValue )
			
			});
			
			return valueObject;			
			
		});
		
	return result
	
};



function render(arr){
	
	// Settings
	var r = 7;

	var	width		= 800,
		height		= width,
		padding		= r,	
		
		xKey		= "PeriodYear",
		yKey		= "PopulationAge",
		colourKey	= "DotColour";

	var svg = d3.select("body").append("svg")
		.attr("width",	width)
		.attr("height",	height);

	// View Dimensions and scale
	var	xScale = d3.scaleLinear().range([0 + padding, width - padding]),
		yScale = d3.scaleLinear().range([0 + padding, height - padding]);
	
		xScale.domain(d3.extent(arr, function(d){ return d[xKey];}));
		yScale.domain(d3.extent(arr, function(d){ return d[yKey];}));
	
	
	// Bind data
	var cells = svg.selectAll("circle").data(arr);
	
	// Enter stage
	cells.enter().append("circle")
		.attr(	"r",r)
		.attr(	"cx",	function(d){ return xScale(d[xKey]);})
		.attr(	"cy",	function(d){ return yScale(d[yKey]);})
		.style(	"fill",	function(d){ return d[colourKey];});
	
	// Exit Stage
	cells.exit().remove();
}

};