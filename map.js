/*

User stories:

I can see where all Meteorites landed on a world map.

I can tell the relative size of the meteorite, just by looking at the way it's represented on the map.

I can mouse over the meteorite's data point for additional data.

*/

// Select svg element
let svg = d3.select('svg')

// Define constants
let width = +svg.attr('width');
let height = +svg.attr('height');

// Create projection
let projection = d3.geoMercator()
    .translate([(width / 2), (height / 2)])
    .scale( width / 2 / Math.PI);

let path = d3.geoPath().projection(projection);

//svg.call(zoom)

// Get json information
d3.json('world-topo-min.json', function(error, world) {
  let countries = topojson.feature(world, world.objects.countries).features;

  let topo = countries

  let g = svg.append('g')
//    .on('click', click)

    g.append('path')
    .datum({type: 'LineString', coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
    .attr('class', 'equator')
    .attr('d', path);

  let country = g.selectAll('.country')
    .data(topo)
    .enter().insert('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('id', d => d.id)
    .attr('title', d => d.properties.name)
    .attr('fill', d => 'rgb(31,119,180)')
})

// Create topojson information

// draw map

// Get point information

// draw points


// FUNCTIONS TO DO
//zoom
//click