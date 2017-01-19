require("datejs");

var d3 = require("d3");
var fs = require("fs");
var yaml = require("yamljs");
var argv = require("minimist")(process.argv.slice(2));
var D3Node = require("d3-node");


function SvgCalendar(config) {
	config = config || yaml.load("config.yml");

	// dimensions
	var aspectRatio = 1.414,
		headerHeight = 150 + config.typography.header.size,
		monthRowItemCount = 6,
		pageSpacers = 30,
		dayHeight = 15 + config.typography.dayNumber.size + config.typography.dayName.size,
		monthHeight = dayHeight * 31,
		monthTopPadding = 100 + config.typography.monthName.size,
		height = (pageSpacers * 2) + headerHeight + ((monthHeight + monthTopPadding) * (12 / monthRowItemCount)),
		monthWidth = (height / aspectRatio) / monthRowItemCount,
		monthPadding = 10,
		width = monthWidth * monthRowItemCount + (pageSpacers * 2);


	function paint() {
		var d3n = new D3Node();
		
		// create svg
		var svg = d3.select(d3n.document.body).append("svg")
			.attr("width", width + (2 * pageSpacers))
			.attr("height", height)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.append("g")
			.attr("transform", translate(pageSpacers, pageSpacers));
		
		// add defs
		svg.append("defs")
			.append("style")
			.attr("type", "text/css")
			.text("@import url('" + config.typography.url + "')");
		
		var requestedYear = getCalendarDataForYear(argv.year);
		
		// add header
		svg.append("g")
			.append("text")
			.text(argv.year)
			.attr("font-family", config.typography.header.font)
			.attr("font-size", config.typography.header.size + "px")
			.attr("fill", config.typography.header.color)
			.attr("x", width / 2)
			.attr("y", 100)
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
				
				return translate((col * (monthWidth + monthPadding)), (row * (monthHeight + monthTopPadding)) + headerHeight);
			});
		
		months.append("text")
			.text(function(d) {return d.month; })
			.attr("font-family", config.typography.monthName.font)
			.attr("font-size", config.typography.monthName.size + "px")
			.attr("fill", config.typography.monthName.color)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.attr("x", (monthWidth / 2) - monthPadding);
		
		
		var day = months.selectAll("g.day")
			.data(function (d) { return d.days; })
			.enter()
			.append("g")
			.attr("class", function (d) {
				if(d.dow === 0 || d.dow === 6) {
					return "weekend day";
				}
				return "day";
			})
			.attr("transform", function(d, i) {
				return translate(0, ((i+1) * dayHeight));
			});
		
		day.append("rect")
			.attr("width", monthWidth)
			.attr("height", dayHeight)
			.style("fill", function (d) {
				if(d.dow === 0 || d.dow === 6) {
					return "#ffffc4";
				} 
				return "#FFF";
			});
		
		day.append("text")
			.text(function (d) { return d.number; })
			.style("font-size", config.typography.dayNumber.size + "px")
			.style("font-family", config.typography.dayNumber.font)
			.attr("fill", config.typography.dayNumber.color)
			.style("font-weight", "bold")
			.attr("x", 8)
			.attr("y", 0)
			.attr("dy", 20);
		
		day.append("text")
			.text(function (d) { return d.name; })
			.style("font-size", config.typography.dayName.size + "px")
			.style("font-family", config.typography.dayName.font)
			.attr("fill", config.typography.dayName.color)
			.attr("x", 10)
			.attr("y", 25)
			.attr("dy", config.typography.dayName.size);
		  
		day.append("line")
			.style("stroke", config.lines.dayDivider.color)
			.style("stroke-width", config.lines.dayDivider.width + "px")
			.attr("x1", 0)
			.attr("y1", dayHeight) 
			.attr("x2", monthWidth)
			.attr("y2", dayHeight);
		
		// month divider line
		months.append("line")
			.style("stroke", config.lines.monthDivider.color)
			.style("stroke-width", config.lines.monthDivider.width + "px")
			.attr("x1", monthWidth)
			.attr("y1", dayHeight)
			.attr("x2", monthWidth)
			.attr("y2", monthHeight + dayHeight);
		
		return d3n;
	}
	
	this.generate = function(filename) {
		var svgXML = paint();
		
		filename = filename || "graph.svg";
		
		fs.writeFileSync(
				"graph.svg",
				"<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n" + svgXML.svgString(),
				{ encoding: "utf8" }
		);
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
				dow: date.getDay(),
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
		
		return data;
	}
}

module.exports = SvgCalendar;