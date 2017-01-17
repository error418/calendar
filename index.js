require("datejs");

var d3 = require("d3");
var fs = require("fs");
var yaml = require("yamljs");
var argv = require('minimist')(process.argv.slice(2));
var D3Node = require('d3-node');

var config = yaml.load('config.yml');
var d3n = new D3Node();

var data = {
	months: config.months
};

function translate(x, y) {
	return "translate(" + x + "," + y + ")";
}

function monthInformation(year, month) {
	var dayCount = Date.getDaysInMonth(year, month);
	
	var days = [];
	for (var day = 1; day <= dayCount; day++) {
		var date = new Date(year, month, day);

		days.push({
			name: config.days[date.getDay()],
			number: day
		});
	}
	
	return {
		month: config.months[month],
		days: days,
		size: days.length
	};
}

function getCalendarDataForYear(year) {
	var data = [];
	
	for(var month = 0; month < 12; month++) {
		data.push(monthInformation(year, month));
	}
	
	console.log(data);
	
	return data;
}

// dimensions
var headerHeight = 250,
	monthWidth = 300,
	dayHeight = 45,
	monthHeight = dayHeight * 31,
	monthTopPadding = 75,
	monthRowItemCount = 6,
	spacers = 30,
	width = monthWidth * monthRowItemCount + (spacers * 2),
    height = headerHeight + ((monthHeight + monthTopPadding) * (12 / monthRowItemCount));



// create svg
var svg = d3.select(d3n.document.body).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('xmlns', 'http://www.w3.org/2000/svg');

var defs = svg.append("defs").append("style")
			.attr("type", "text/css")
			.text("@import url('" + config.font.url + "')");

var requestedYear = getCalendarDataForYear(argv.year);

var header = svg.append("g")
				.append("text")
				.text(argv.year)
				.attr("font-family", config.font.header)
				.attr("font-size", "80px")
				.attr("x", width / 2)
				.attr("y", headerHeight / 3)
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "central");

// add months
var months = svg.selectAll("g.month")
    .data(requestedYear)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
    	var row = Math.floor(i / monthRowItemCount);
    	var col = i % monthRowItemCount;
    	
    	return translate(spacers + (col * monthWidth), (row * (monthHeight + monthTopPadding)) + headerHeight);
    });

months.append("text")
		.text(function(d) {return d.month; })
		.attr("font-family", config.font.monthName)
		.attr("font-size", "40px")
		.attr("alignment-baseline", "central");

var day = months.selectAll("g.day")
				.data(function (d) { return d.days; })
				.enter()
				.append("g")
				.attr("transform", function(d, i) {
					return translate(0, ((i+1) * dayHeight));
				});

day.append("text")
	.text(function (d) { return d.number; })
	.style("font-size", "20px")
	.style("font-family", config.font.dayNumber)
	.style("font-weight", "bold")
	.attr("x", 0)
	.attr("y", 0)
	.attr("dy", 20);

day.append("text")
	.text(function (d) { return d.name; })
	.style("font-size", "14px")
	.style("font-family", config.font.dayName)
	.attr("fill", "#888")
	.attr("x", 2)
	.attr("y", 25)
	.attr("dy", 14);
  
day.append("line")
	.style("stroke", "#EEE")
	.attr("x1", 0)
	.attr("y1", dayHeight - 5) 
	.attr("x2", monthWidth - 10)
	.attr("y2", dayHeight - 5);

// get a reference to our SVG object and add the SVG NS
var svgGraph = svg;

var svgXML = d3n.svgString();

fs.writeFileSync(
		'graph.svg',
		'<?xml version="1.0" encoding="UTF-8" ?>\n' + svgXML,
		{ encoding: 'utf8' }
);
  

