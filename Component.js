window.onload = function(){

// Data Service Description
// Use this Data Service URL as data source for the application, that would be providing data for
// the component:
var targetDest = "http://213.197.173.50:3153/Staging/FutureDemographicsDemo-XML/PopulationData.xml"

// Custom XML parser initiation as a callback using d3 get XML method from Data Service URL.
d3.xml(targetDest, d3CustomXMLParse)

// Graph Settings
//
// cellR	-	Cell (Circle) Radius
// cellPad	-	padding between cells on x and y axis
// svgPad	-	padding in SVG element
//
// axisOffset	-	Offset axis from bottom cells
//
// yWidth - width of y axis element
// xWidth - height of x axis element
//
var cellR		= 5,
	cellPad		= {	x:	1,	y:	-1	},
	svgPad		= { top:	45,	bot:	45,	left:	45,	right:	45	},
	shape		= ["circle", "rect"],
	defShape	= shape[1],
	
	axisOffset	= 5,
	tickSize	= { xBig:	6,	xSmall:	2,	yBig:	8,	ySmall:	4	},

	yWidth		= 21.5,
	xWidth		= 18.09,

// Global variables for render to use

	xKey		= "",
	yKey		= "",
	colorKey	= "";
	
// Custom XML parser function for given XML data stucture only.
function d3CustomXMLParse(error, rawXML) {
	
// Variable for result Data array	
	var xmlArray = [],
	
		nodeHeader = rawXML.children[0].children[0].nodeName;

// Error handling
	if (error) throw error;

	// Converts the XML document to an array of objects.
	// Note that querySelectorAll returns a NodeList, not a proper Array,
	// so map.call must be used to invoke array methods.
	// Cycling through all Row Nodes, executing function on each iteration 
	var d = [].map.call(rawXML.querySelectorAll(nodeHeader), function(d) {
		
		var cell = [];

			// Iterating each child element of Row, saving value to array
			for (i=0; i<d.childElementCount; i++){
				
				cell[i] = d.children[i].childNodes[0].nodeValue
				
			};
		
		return cell
	});
	// makeObjectKeys takes array as arguement, returns array of object with object keys
	// set from first entry in array
	xmlArray = makeObjectKeys(d);

	// Renders array object into svg elements
	render(xmlArray);

};


function makeObjectKeys(parsedXML){
	
	// First entry for object keys
	var objectKeys = parsedXML[0];
	
	yKey		= objectKeys[0],
	xKey		= objectKeys[1],
	colorKey	= objectKeys[2],

	// Removing entry of keys
		mainValues  = parsedXML.slice(1)
		
	// Remaping array to object keys
		result = mainValues.map(function(mainValue){
			
			var valueObject = {}
			
			objectKeys.forEach(function(objectKey, i){
				
				// Changing to proper hex color code if necesary
				var objValue = mainValue[i].replace("0x","#");
				
				// Parsing strings to integers, if parsable (otherwise d3.min and d3.max methods will glitch)
				valueObject[objectKey] = (!isNaN(objValue) ? +objValue : objValue )
			
			});
			
			return valueObject;			
			
		});
		
	return result
	
};



function render(arr){
	
	// Counting number of x elements in row and y elements in column
		xCount	= d3.max(arr, function(d){ return d[xKey];}) - d3.min(arr, function(d){ return d[xKey];});
		yCount	= d3.max(arr, function(d){ return d[yKey];}) - d3.min(arr, function(d){ return d[yKey];});

	// Seting cell container width and height
	var	width		= ((cellR * 2) + cellPad.x) * xCount - cellPad.x,
		height		= ((cellR * 2) + cellPad.y) * yCount - cellPad.y,
		
	// Calculating extra width and height for SVG element
		extraWidth	= svgPad.left + yWidth + axisOffset + svgPad.right,
		extraHight	= svgPad.top + xWidth + axisOffset + svgPad.bot,
		
		svgWidth	= width + extraWidth,
		svgHeight	= height + extraHight;
		
	// Binding SVG element to variable, setting calculated attributes for height and width
	var svg = d3.select("#Rendering").append("svg")
		.attr("width",	svgWidth)
		.attr("height",	svgHeight);

	// d3.js scaleLinear method 
	var	xScale = d3.scaleLinear().range([0 + cellR, width - cellR]).domain(d3.extent(arr, function(d){ return d[xKey];})),
		yScale = d3.scaleLinear().range([0 + cellR, height - cellR]).domain(d3.extent(arr, function(d){ return d[yKey];}));
	
	// Binding x axis to variable
	// Setting default parameters
	var xAxis = d3.axisBottom()
				.scale(xScale)
				.ticks(50, "f");
	
	// Same with y axis
	var yAxis = d3.axisLeft()
				.scale(yScale)
				.ticks(100, "f");
				
	// Binding data to group element of SVG parent element
	// Setting position
	var c = svg.append("g")
			.attr("id",	"cells")
			.attr("transform", "translate(" + (svgPad.left + yWidth + axisOffset) + "," + (svgPad.top) + ")");
	
	// Binding array data to cells
	var cells = c.selectAll(defShape).data(arr),
		rectHeight = cellR * 2 + (cellPad.y < 1 ? cellPad.y - 1 : 0 );
		
	if (defShape === "rect"){
	cells.enter().append(defShape)
		.attr(	"width",	cellR * 2)
		.attr(	"height",	cellR * 2 + (cellPad.y < 1 ? cellPad.y - 1 : 0 ) )
		.attr(	"x",	function(d){ return xScale(d[xKey]);})
		.attr(	"y",	function(d){ return yScale(d[yKey]);})
		.style(	"fill",	function(d){ return d[colorKey];});

	d3.select("#cells")
		.attr("transform", "translate(" + (svgPad.left + yWidth + axisOffset - cellR) + "," + (svgPad.top - rectHeight/2) + ")");
	}
	
	else{
	// Rendering cells 
	cells.enter().append(defShape)
		.attr(	"class", "cell")
		.attr(	"r",	cellR)
		.attr(	"cx",	function(d){ return xScale(d[xKey]);})
		.attr(	"cy",	function(d){ return yScale(d[yKey]);})
		.style(	"fill",	function(d){ return d[colorKey];});

	}
	// Exit Stage of render function
	cells.exit().remove();
	
	// Appending group element with x axis
	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(" + (svgPad.left + yWidth + axisOffset) + "," + (svgPad.top + height + axisOffset) + ")")
		.call(xAxis);
		
	// Appending group element with y axis
		svg.append("g")
		.attr("class", "yaxis")
		.attr("transform", "translate(" + (svgPad.left + yWidth) + "," + (svgPad.top) + ")")
		.call(yAxis);
	
	// Tweaking y axis for minor tick looks
	d3.selectAll("g.yaxis g.tick line")
    .attr("x2", function(d){
		if ( (d)%5 )	{ return -tickSize.ySmall; }
		else 			{ return -tickSize.yBig; }
		});
	
	d3.selectAll("g.yaxis g.tick text")
    .attr("class", function(d){
		if ( (d)%10 )	{ return "delete"; }
		});

	d3.selectAll("g.yaxis g.tick text.delete").remove();	

	// Tweaking x axis for minor tick looks
	d3.selectAll("g.xaxis g.tick line")
    .attr("y2", function(d){
		if ( (d)%5 )	{ return tickSize.xSmall; }
		else 			{ return tickSize.xBig; }
		});

	d3.selectAll("g.xaxis g.tick text")
    .attr("class", function(d){
		if ( (d)%10 )	{ return "delete"; }
		});

	d3.selectAll("g.xaxis g.tick text.delete").remove();
	
	}
};