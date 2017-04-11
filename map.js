/*

User stories:

I can see where all Meteorites landed on a world map.

I can tell the relative size of the meteorite, just by looking at the way it's represented on the map.

I can mouse over the meteorite's data point for additional data.

*/

// Create zoom element
var zoom = d3.zoom()
  .scaleExtent([1, 9])
  .on('zoom', move)

// Select svg element and apply zoom
let svg = d3.select('svg')
  .call(zoom)

// Define constants
let width = +svg.attr('width');
let height = +svg.attr('height');
let g;  // Initialize so we can reference in move function
let URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';


// Create tooltip
d3.select('body').append('div')
    .attr('class', 'tooltip')
    .attr('width', '200px')
    .attr('height', '200px')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('background-color', '#333')
    .style('opacity', '0.8')
    .style('color', 'white')
    .style('font-size', '14px')
    .style('font-family', 'sans-serif')
    .style('visibility', 'hidden')
    .style('text-align', 'center')
    .style('padding', '0 5px 0 5px')
    .style('border-radius', '4px')

// Create projection
let projection = d3.geoMercator()
    .translate([(width / 2), (height / 2)])
    .scale( width / 2 / Math.PI);

let path = d3.geoPath().projection(projection);


// Add element that we will use to scale
g = svg.append('g')

// Get json information
d3.json('world-topo-min.json', function(error, world) {

  // Analyze using topojson
  let countries = topojson.feature(world, world.objects.countries).features;
  let topo = countries;

  drawMap(topo);

})

function drawMap(topo) {

  let country = g.selectAll('.country')
    .data(topo)
    .enter().insert('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('id', d => d.id)
    .attr('title', d => d.properties.name)
    .attr('fill', d => 'rgb(31,119,180)')
}

d3.json(URL, function(error, data) {
  g.append("g").attr('class', 'strikes')
    .selectAll('circle')
    .data(data.features)
    .enter().append('circle')
      .attr('class', 'strike')
      .attr('r', d =>  Math.pow(+d.properties.mass, 1/10)) // These numbers can be huge, so 10th root.
      .attr('cx', function(d) {
        return d.geometry == undefined ? 200 : projection(d.geometry.coordinates)[0]})
      .attr('cy', function(d) {
        return d.geometry == undefined ? 200 : projection(d.geometry.coordinates)[1]})
      .style('opacity', '0.4')
      .on('mouseover', function(d) {
        d3.select(this).style('fill', 'white')

        d3.select('.tooltip')
          .html(tooltipFormat(d))
          .style('visibility', 'visible')
      })
      .on('mousemove', function() {
        d3.select('.tooltip')
          .style('top', (d3.event.pageY - 120) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px')
      })
      .on('mouseleave', function(d) {
        d3.select(this).style('fill', 'black')
        d3.select('.tooltip')
          .style('visibility', 'hidden')
      })

});



// move function will be hoisted for zoom assignment
function move() {
  let t = [d3.event.transform.x, d3.event.transform.y];
  let s = d3.event.transform.k;
  let zscale = s;
  let h = height / 4;

/*

Let's take a look at the maximum and minimum transformations allowed

Imagine this is a map that was zoomed in.  The larger rectangle represents the full map, while the small rectangle represents the 'viewport', the html svg on the page that we see through.  The dimensions of the full rectangle will be the scale factor times the original dimensions.

                  _________________________
                  |         |               |
                  |         | height        |
                  |_________|               | s * height
                  |  width                  |
                  |                         |
                  |                         |
                  |_________________________|
                          s * width

These t values represent the number of pixels the full rectangle is moved relative to the view port, which we can think of as static.  This means that in the above picture, we have moved it x = 0 and y = 0, as the x and y baselines are the same for both pictures.

This means that no matter the size of the full rectangle, we can never move it past 0 for x and y, as that would move it to the right and down from the above picture, thus moving the full picture out of the frame.

For the maximums, let's look at another picture.

          s * width
   _________________________
  |               |         |
  |       height  |         |
  |               |_________| s * height
  |                  width  |
  |                         |
  |                         |
  |_________________________|

  |---------------|
  s * width - width

Here, we've moved the 'viewport' all the way to the right.  We don't want it to move any farther.  This means that we have really moved the large rectangle to the left a distance of the difference between the two rectangle sizes, s * width - width.  We can factor out a width to get width * (s - 1), which gives us the number of pixels we moved the large rectangle to the left.

This means that width * (s - 1) is the max movement to the left.  d3 counts movement to the left as negative (consider how the large rectangle has been shifted with respect to the static viewport), so this really means that the most we can move it is -(width * (s - 1)), or width * (1 - s).

A similar argument for y yields the following expressions.

*/
  t[0] = Math.min(0, Math.max(t[0], width * ( 1 - s)))
  t[1] = Math.min(0, Math.max(t[1], height * ( 1 - s)))

  g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

  d3.selectAll('.country').style('stroke-width', 1.5 / s);
}

// Template Literal for tooltip html 
function tooltipFormat(d) {
    return `<h3> ${d.properties.name} ${ d.properties.year.slice(0, 4)}</h3>
    <p>Mass: ${d.properties.mass} grams</p>
    <p>Class: ${d.properties.recclass}</p>` 
}