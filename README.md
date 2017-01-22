# SVG Calendar Generator

Generates a Calendar (as SVG) for a given year.

* Generates months of the given year
* Marks weekends
* Prints day names

You can print your SVGs as large as you want without fearing quality loss. I've printed my calendar on a sheet of DIN A2 paper.

## Usage

	node bin/cmd.js --year 2017

or

	svgcal --year 2017
	
a SVG file is generated to your current directory.
	
## Configuration

You can customize your calendar appearance in the `config.yml`

## How does it look?

Click [here](examples/export-small.png) for an example PNG export based on the generated SVG. I've added some extra graphics (the garland) in this example :)