import * as d3 from 'd3';

const MARGIN = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 60
};
// const PADDING = {
//   top: 60,
//   right: 60,
//   bottom: 60,
//   left: 60
// };
// const OUTER_WIDTH = 960;
// const OUTER_HEIGHT = 500;

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min;
// }

// ES6 class
class BarChart {
  constructor(id, data, titleText) {
    this.id = id;
    this.data = data;
    this.titleText = titleText;
    this.x = d3.scaleBand().domain(this.getKeys(data)).padding(0.1);
    const minValue = this.getMinValue(data) < 0 ? this.getMinValue(data) : 0;
    const maxValue = this.getMaxValue(data) > 0 ? this.getMaxValue(data) : 0;
    const domainLimit = Math.abs(maxValue) >= Math.abs(minValue) ? Math.abs(maxValue) : Math.abs(minValue);
    this.y = d3.scaleLinear().domain([-domainLimit, domainLimit]);
    this.svg = d3.select(`#${id}`);
    this.g = this.svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    this.g.append("g")
      .attr("class", "axis axis--x");

    window.addEventListener("resize", this.draw());
  }

  draw() {

    const bounds = this.svg.node().getBoundingClientRect(),
      width = bounds.width - MARGIN.left - MARGIN.right,
      height = bounds.height - MARGIN.top - MARGIN.bottom;

    this.svg.append("text")
      .attr("x", (width / 2))
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(this.titleText);
    this.svg.append("text")
      .attr("y", (height / 2) / 2)
      .attr("x", (MARGIN.left / 2) / 2)
      .attr("dy", "0.71em")
      .text("Sales");


    this.x.rangeRound([0, width]);
    this.y.rangeRound([(height / 2), 0]);

    this.g.select(".axis--x")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(d3.axisBottom(this.x));

    // g.select(".axis--y")
    //   .call(d3.axisLeft(y).ticks(10, "%"));

    const bars = this.g.selectAll(".bar")
      .data(this.data);


    // ENTER
    bars
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d) => {
        return this.x(d.key);
      })
      .attr("y", (d) => {
        if (d.value >= 0) {
          return this.y(d.value)
        } else {
          return height / 2;
        };
      })
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => {
        return Math.abs((height / 2) - this.y(d.value));
      });

    // UPDATE
    bars.attr("x", (d) => {
        return this.x(d.key);
      })
      .attr("y", (d) => {
        if (d.value >= 0) {
          return this.y(d.value)
        } else {
          return height / 2;
        };
      })
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => {
        return Math.abs((height / 2) - this.y(d.value));
      });

    //BAR LABELS
    this.g.selectAll("text.bar")
      .data(this.data)
      .enter().append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", (d) => {
        return this.x(d.key) + (this.x.bandwidth()/2);
      })
      .attr("y", (d) => {
        return this.y(d.value) - 5;
      })
      .text(function(d) {
        return Math.round(Number(d.value));
      });

    // EXIT
    bars.exit()
      .remove();

  }

  getKeys(data) {
    return data.map(d => d.key);
  }

  getValues(data) {
    return data.map(d => d.value);
  }

  getMinValue(data) {
    return Math.min(...this.getValues(data));
  }

  getMaxValue(data) {
    return Math.max(...this.getValues(data));
  }


  //   const inner = this.svg.append('g')
  //     .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  //     .attr('class', 'inner');
  //   // Make bars
  //   inner.append('g')
  //     .attr('class', 'bars');
  //
  //   // Make axis
  //   inner.append('g')
  //     .attr('class', 'labels');
  //
  //   // Make axis
  //   const axes = inner.append('g')
  //     .attr('class', 'axes');
  //   axes.append('g') // x axis
  //     .attr('class', 'axis')
  //     .attr('class', 'xaxis');
  //   // axes.append('g') // y axis
  //   //   .attr('class', 'axis')
  //   //   .attr('class', 'yaxis');
  //
  //   const title = inner.append("text")
  //     .attr("x", (this.getWidth() / 2))
  //     .attr("y", 0 - (MARGIN.top / 2) / 2)
  //     .attr("text-anchor", "middle")
  //     .style("font-size", "16px")
  //     .text(this.titleText);
  //
  //   this.bindEvents();
  //   this.render();
  //   this.generateData();
  // }
  //
  // getWidth() {
  //   const outerWidth = parseInt(this.svg.style('width'), 10);
  //   const innerWidth = outerWidth - MARGIN.left - MARGIN.right;
  //   const width = innerWidth - PADDING.left - PADDING.right;
  //
  //   return width;
  // }
  //
  // getHeight() {
  //   const outerHeight = parseInt(this.svg.style('height'), 10);
  //   const innerHeight = outerHeight - MARGIN.top - MARGIN.bottom;
  //   const height = innerHeight - PADDING.top - PADDING.bottom;
  //
  //   return height;
  // }
  //
  // bindEvents() {
  //   d3.select(window).on('resize', () => {
  //     this.resized();
  //     this.render(false);
  //   });
  // }
  //
  // resized() {
  //   const width = window.innerWidth ||
  //     document.documentElement.clientWidth ||
  //     document.body.clientWidth;
  //
  //   const outerWidth = Math.min(this.baseWidth, width);
  //   this.svg.attr('width', outerWidth);
  //
  //   const height = window.innerHeight ||
  //     document.documentElement.clientHeight ||
  //     document.body.clientHeight;
  //
  //   const outerHeight = Math.min(this.baseHeight, height);
  //   this.svg.attr('height', outerHeight);
  // }
  //
  // render(doTransition = true) {
  //   const yScale = this.getYScale();
  //   const xScale = this.getXScale();
  //
  //   // Set bars
  //   const bars = this.svg.select('g.inner g.bars')
  //     .selectAll('rect')
  //     .data(this.values);
  //
  //   this.setBars(bars.enter().append('rect'), xScale, yScale);
  //
  //   // Set labels
  //   const labels = this.svg.select('g.inner g.labels')
  //     .selectAll('text')
  //     .data(this.values);
  //
  //   BarChart.setLabels(labels.enter().append('text'), xScale, yScale);
  //
  //   if (doTransition) {
  //     this.setBars(bars.transition(), xScale, yScale);
  //     BarChart.setLabels(labels.transition(), xScale, yScale);
  //   } else {
  //     this.setBars(bars, xScale, yScale);
  //     BarChart.setLabels(labels, xScale, yScale);
  //   }
  //
  //   bars.exit().remove();
  //   labels.exit().remove();
  //
  //   this.setAxes(xScale, yScale);
  // }
  //
  // setBars(sel, xScale, yScale) {
  //   sel.attr('x', (d, i) => xScale(i))
  //     .attr('y', d => yScale(d))
  //     .attr('width', xScale.bandwidth())
  //     .attr('height', d => Math.abs(this.getHeight() - yScale(d)))
  //     .attr('fill', d => `rgb(0, ${Math.min(d * 10, 240)}, 0)`);
  // }
  //
  // static setLabels(sel, xScale, yScale) {
  //   sel.text(d => ((d >= 2) ? `${d}` : '')) // eslint-disable-line no-use-before-define
  //     .attr('x', (d, i) => {
  //       console.log(xScale(i));
  //       xScale(i) + (xScale.bandwidth() / 2)
  //     })
  //     .attr('y', d => yScale(d) + 20)
  //     .attr('text-anchor', 'middle')
  //     .attr('font-family', 'sans-serif')
  //     .attr('font-size', '12px')
  //     .attr('fill', 'white');
  // }
  //
  // setAxes(xScale, yScale) {
  //   const yAxis = d3.axisLeft(yScale);
  //   const xAxis = d3.axisBottom(xScale);
  //
  //   this.svg.select('g.inner g.axes g.xaxis')
  //     .attr('transform', `translate(0, ${this.getHeight()})`)
  //     .call(xAxis);
  //   this.svg.select('g.inner g.axes g.yaxis')
  //     .call(yAxis);
  // }
  //
  // getYScale() {
  //   return d3.scaleLinear()
  //     .domain([0, d3.max(this.values)])
  //     .range([this.getHeight(), 0]);
  // }
  //
  // getXScale() {
  //   return d3.scaleBand()
  //     .domain(this.keys)
  //     .rangeRound([0, this.getWidth()])
  //     .paddingInner(0.05);
  // }
  //
  // generateData() {
  //
  // }
}

// Make bar chart factory function
// defaut export, defaut params
export default function(id = 'chart1', data = [], title) {
  return new BarChart(id, data, title);
}
