
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Chart from '../index'
import offset from 'offset'
import d3 from 'd3'

const gen = n => {
  const data = []

  for (var i = n; i; i--) {
    data.push({
      time: new Date(Date.now() - (i * 3600000)),
      value: Math.max(250, Math.random() * 3000 | 0)
    })
  }

  return data
}

class Tip {
  show(d) {
    const el = document.querySelector('#tip')
    const to = offset(el)
    const o = offset(event.target)
    el.style.top = o.top - to.height + 'px'
    el.style.left = o.left - (to.width / 2) + 'px'
    el.textContent = d3.format(',')(d.value)
    el.classList.add('show')
  }

  hide() {
    const el = document.querySelector('#tip')
    el.classList.remove('show')
  }
}

class App extends Component {
  componentDidMount() {
    const tip = new Tip

    this.a = new Chart({
      target: this.refs.a,
      mouseover: tip.show,
      mouseout: tip.hide
    })

    this.b = new Chart({
      target: this.refs.b,
      width: 220,
      height: 120,
      mouseover: tip.show,
      mouseout: tip.hide
    })

    this.c = new Chart({
      target: this.refs.c,
      axisPadding: 5,
      barPadding: 15,
      tickSize: 3,
      mouseover: tip.show,
      mouseout: tip.hide
    })

    this.a.render(gen(24))
    this.b.render(gen(10))
    this.c.render(gen(24))
  }

  componentDidUpdate() {
    this.changeData()
  }

  changeData = _ => {
    const n = Math.max(15, Math.random() * 30 | 0)
    this.a.update(gen(n))
    this.b.update(gen(10))
    this.c.update(gen(24))
  }

  render() {
    return <div>
      <div id="actions">
        <button onClick={this.changeData}>Animate</button>
      </div>

      <section>
        <h3>Defaults</h3>
        <p>Chart default settings.</p>
        <svg ref="a" className="chart"></svg>
      </section>

      <section>
        <h3>Small</h3>
        <p>Chart with a smaller size.</p>
        <svg ref="b" className="chart"></svg>
      </section>

      <section>
        <h3>Kitchen Sink</h3>
        <p>Chart with most settings configured.</p>
        <svg ref="c" className="chart"></svg>
      </section>

      <section>
        <h3>Reference</h3>
        <p>Chart reference image.</p>
        <img src="chart.png" width={500} />
      </section>
    </div>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
