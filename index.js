
import d3 from 'd3'

/**
 * Default config.
 */

const defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 450,

  // height of chart
  height: 130,

  // margin
  margin: { top: 15, right: 0, bottom: 35, left: 60 },

  // axis padding
  axisPadding: 5,

  // axis tick size
  tickSize: 10,

  // padding between bars
  barPadding: 13,

  // nice round values for axis
  nice: true
}

/**
 * BarChart.
 */

export default class BarChart {

  /**
   * Construct with the given `config`.
   */

  constructor(config) {
    this.set(config)
    this.init()
  }

  /**
   * Set configuration options.
   */

  set(config) {
    for (let k in defaults) {
      this[k] = config[k] == null
        ? defaults[k]
        : config[k]
    }
  }

  /**
   * Dimensions without margin.
   */

  dimensions() {
    const { width, height, margin } = this
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom
    return [w, h]
  }

  /**
   * Initialize the chart.
   */

  init() {
    const { target, width, height, margin, axisPadding, tickSize } = this
    const [w, h] = this.dimensions()

    this.chart = d3.select(target)
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.x = d3.time.scale()
      .range([0, w])

    this.y = d3.scale.linear()
      .range([h, 0])

    this.xAxis = d3.svg.axis()
      .orient('bottom')
      .scale(this.x)
      .ticks(5)
      .tickPadding(8)
      .tickSize(tickSize)

    this.yAxis = d3.svg.axis()
      .orient('left')
      .scale(this.y)
      .ticks(3)
      .tickPadding(8)
      .tickSize(tickSize)

    this.chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${h+axisPadding})`)
      .call(this.xAxis)

    this.chart.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${-axisPadding}, 0)`)
      .call(this.yAxis)
  }

  /**
   * Render axis.
   */

  renderAxis(data, options) {
    const { chart, x, y, xAxis, yAxis, nice } = this

    const xd = x.domain(d3.extent(data, d => d.time))
    const yd = y.domain(d3.extent(data, d => d.value))

    if (nice) {
      xd.nice()
      yd.nice()
    }

    const c = options.animate
      ? chart.transition()
      : chart

    c.select('.x.axis').call(xAxis)
    c.select('.y.axis').call(yAxis)
  }

  /**
   * Render columns.
   */

  renderCols(data) {
    const { chart, x, y, barPadding } = this
    const [w, h] = this.dimensions()

    const colWidth = (w / data.length) - barPadding
    if (colWidth < 1) throw new Error('BarChart is too small for the amount of data provided')

    const column = chart.selectAll('.column')
      .data(data)

    // enter
    column.enter().append('rect')
      .attr('class', 'column')

    // update
    column.attr('x', d => x(d.time))
      .attr('rx', colWidth / 2)
      .attr('ry', colWidth / 2)
      .attr('width', colWidth)
      .attr('y', 0)
      .attr('height', d => h)

    // exit
    column.exit()
      .remove()
  }

  /**
   * Render bars.
   */

  renderBars(data) {
    const { chart, x, y, barPadding } = this
    const [w, h] = this.dimensions()

    const barWidth = (w / data.length) - barPadding
    if (barWidth < 1) throw new Error('BarChart is too small for the amount of data provided')

    const bar = chart.selectAll('.bar')
      .data(data)

    // enter
    bar.enter().append('rect')
      .attr('class', 'bar')

    // update
    bar.attr('x', d => x(d.time))
      .attr('rx', barWidth / 2)
      .attr('ry', barWidth / 2)
      .attr('width', barWidth)
      .transition()
        .attr('y', d => y(d.value))
        .attr('height', d => h - y(d.value))

    // exit
    bar.exit()
      .remove()
  }

  /**
   * Render the chart against the given `data`.
   */

  render(data, options = {}) {
    this.renderAxis(data, options)
    this.renderCols(data, options)
    this.renderBars(data, options)
  }

  /**
   * Update the chart against the given `data`.
   */

  update(data) {
    this.render(data, {
      animate: true
    })
  }
}
