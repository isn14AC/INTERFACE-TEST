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
	var r			= 5,
		pad			= {	x:	1,	y:	-3	},
		axisPad		= { x:	25,	y:	25	},
		svgPad		= { top:	25,	bot:	25,	left:	25,	right:	25	},
		
		axisOffset	= 25,

		xKey		= "PeriodYear",
		yKey		= "PopulationAge",
		colourKey	= "DotColour";
		
		xCount	= d3.max(arr, function(d){ return d[xKey];}) - d3.min(arr, function(d){ return d[xKey];});
		yCount	= d3.max(arr, function(d){ return d[yKey];}) - d3.min(arr, function(d){ return d[yKey];});

	var	width		= ((r * 2) + pad.x) * xCount,
		height		= ((r * 2) + pad.y) * yCount,
		
		svgWidth	= width + axisOffset + axisPad.x,
		svgHeight	= height + axisOffset + axisPad.y;

	var svg = d3.select("body").append("svg")
		.attr("width",	svgWidth + svgPad.left + svgPad.right)
		.attr("height",	svgHeight + svgPad.top + svgPad.bot);

	// View Dimensions and scale
	var	xScale = d3.scaleLinear().range([0 + r, width - r]).domain(d3.extent(arr, function(d){ return d[xKey];})),
		yScale = d3.scaleLinear().range([0 + r, height - r]).domain(d3.extent(arr, function(d){ return d[yKey];}));
	
	var xAxis = d3.axisBottom()
				.scale(xScale)
				.ticks(60, "f");
				
	var yAxis = d3.axisLeft()
				.scale(yScale)
				.ticks(100, "f");
	// Bind data
	var c = svg.append("g")
			.attr("transform", "translate(" + (svgWidth - width) + "," + (svgPad.top) + ")");
	
	var cells = c.selectAll("circle").data(arr);
	
	// Enter stage
	cells.enter().append("circle")
		.attr(	"class", "cell")
		.attr(	"r",r)
		.attr(	"cx",	function(d){ return xScale(d[xKey]);})
		.attr(	"cy",	function(d){ return yScale(d[yKey]);})
		.style(	"fill",	function(d){ return d[colourKey];});
	//	.attr("transform", "translate(" + (axisPad.y + axisOffset) + "," + width + "));
	// Exit Stage
	cells.exit().remove();
	
	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(" + (svgWidth - width) + "," + (svgPad.top + height + axisOffset) + ")")
		.call(xAxis);
		
	svg.append("g")
		.attr("class", "yaxis")
		.attr("transform", "translate(" + (svgWidth - width - axisOffset) + "," + (svgPad.top) + ")")
		.call(yAxis);
		
	d3.selectAll("g.yaxis g.tick line")
    .attr("x2", function(d){
		if ( (d)%5 )	{ return -4; }
		else 			{ return -10; }
		});

	d3.selectAll("g.yaxis g.tick text")
    .attr("class", function(d){
		if ( (d)%10 )	{ return "delete"; }
		});

	d3.selectAll("g.yaxis g.tick text.delete").remove();	

	d3.selectAll("g.xaxis g.tick line")
    .attr("y2", function(d){
		if ( (d)%5 )	{ return 3; }
		else 			{ return 6; }
		});

	d3.selectAll("g.xaxis g.tick text")
    .attr("class", function(d){
		if ( (d)%10 )	{ return "delete"; }
		});

	d3.selectAll("g.xaxis g.tick text.delete").remove();	

	}
};