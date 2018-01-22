/* global d3 */

const svg = d3.select('svg')
const margin = { top: 40, right: 40, bottom: 40, left: 40 }
const width = svg.attr('width') - margin.left - margin.right
const height = svg.attr('height') - margin.top - margin.bottom

const g = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// cat result.json | jq '[ .hits.hits[] | ._source | { title: .title, year: .year, citations: .inCitations | length, references: .outCitations | length }]' > data.json

d3.json('data/foxp3.json', (error, data) => {
  if (error) throw error

  const maxValue = Math.max(...data.map(item => item.citations))

  const radiusScale = d3
    .scaleLog()
    .range([1, 20])
    .domain([1, maxValue + 1])

  data.forEach(item => {
    item.radius = radiusScale(item.citations + 1)
  })

  const yScale = d3
    .scaleLinear()
    .rangeRound([height, 0])
    .domain(d3.extent(data, d => d.year))

  const simulation = d3
    .forceSimulation(data)
    .force('x', d3.forceX(width / 2))
    .force('y', d3.forceY(d => yScale(d.year)).strength(1))
    .force('collide', d3.forceCollide(d => d.radius))
    .stop()

  for (let i = 0; i < 500; ++i) simulation.tick()

  g
    .append('g')
    .attr('class', 'axis axis--y')
    // .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisLeft(yScale).tickFormat(d3.format('d')).ticks(20))

  const cell = g
    .append('g')
    .attr('class', 'cells')
    .selectAll('g')
    .data(
      data
      // d3
      //   .voronoi()
      //   .extent([
      //     [-margin.left, -margin.top],
      //     [width + margin.right, height + margin.top]
      //   ])
      //   .x(d => d.x)
      //   .y(d => d.y)
      //   .polygons(data)
    )
    .enter()
    .append('g')

  // cell
  //   .append('circle')
  //   .attr('r', d => d.data.radius)
  //   .attr('cx', d => d.data.x)
  //   .attr('cy', d => d.data.y)
  //
  // cell.append('path').attr('d', d => 'M' + d.join('L') + 'Z')
  //
  // cell.append('title').text(d => d.data.title)

  cell
    .append('circle')
    .attr('r', d => d.radius)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)

  cell.append('title').text(d => d.title)
})
