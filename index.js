
import d3 from 'd3'

/**
 * Default config.
 */

const defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 500,

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
  nice: false,

  // easing function for transitions
  ease: 'linear',

  // mouseover callback for tooltips or value display
  mouseover: _ => {},

  // mouseout callback for tooltips or value display
  mouseout: _ => {}
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
    Object.assign(this, defaults, config)
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
   * Handle mouseover.
   */

  onMouseOver() {
    const m = d3.mouse(this.chart.node())
    const x = this.x.invert(m[0])
    const i = this.xBisect(this.data, x, 1)
    const data = this.data[i - 1]
    this.mouseover(data)
  }

  /**
   * Handle mouseleave.
   */

  onMouseLeave() {
    this.mouseout()
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
        .on('mouseover', _ => this.onMouseOver())
        .on('mouseleave', _ => this.onMouseLeave())

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

    this.xBisect = d3.bisector(d => d.time).left
  }

  /**
   * Render axis.
   */

  renderAxis(data, options) {
    const { chart, x, y, xAxis, yAxis, nice, ease } = this

    const xd = x.domain(d3.extent(data, d => d.time))
    const yd = y.domain(d3.extent(data, d => d.value))

    if (nice) {
      xd.nice()
      yd.nice()
    }

    const c = options.animate
      ? chart.transition().ease(ease)
      : chart

    c.select('.x.axis').call(xAxis)
    c.select('.y.axis').call(yAxis)
  }

  /**
   * Render bars.
   */

  renderBars(data) {
    const { chart, x, y, ease, barPadding } = this
    const [w, h] = this.dimensions()

    const width = w / data.length
    const barWidth = width - barPadding
    if (barWidth < 1) throw new Error('BarChart is too small for the amount of data provided')

    const column = chart.selectAll('.column')
        .data(data)

    // enter
    column.enter().append('rect')
      .attr('class', 'column')

    // update
    column.transition().ease(ease)
      .attr('x', d => x(d.time))
      .attr('rx', barWidth / 2)
      .attr('ry', barWidth / 2)
      .attr('width', barWidth)
      .attr('height', h)

    // exit
    column.exit().remove()

    const bar = chart.selectAll('.bar')
      .data(data)

    // enter
    bar.enter().append('rect')
      .attr('class', 'bar')

    // update
    bar.transition().ease(ease)
      .attr('x', d => x(d.time))
      .attr('y', d => y(d.value))
      .attr('rx', barWidth / 2)
      .attr('ry', barWidth / 2)
      .attr('width', barWidth)
      .attr('height', d => h - y(d.value))

    // exit
    bar.exit().remove()

    const overlay = chart.selectAll('.overlay')
      .data(data)

    // enter
    overlay.enter().append('rect')
      .attr('class', 'overlay')

    // update
    overlay.attr('x', d => x(d.time))
      .attr('width', width)
      .attr('height', h)
      .style('fill', 'transparent')

    // exit
    overlay.exit().remove()
  }

  /**
   * Render the chart against the given `data`.
   */

  render(data, options = {}) {
    this.data = data
    this.renderAxis(data, options)
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
