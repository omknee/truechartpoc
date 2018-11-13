import * as d3 from 'd3';

const MARGIN = {
  top: 50,
  right: 40,
  bottom: 40,
  left: 100
};
// const PADDING = {
//   top: 60,
//   right: 60,
//   bottom: 60,
//   left: 60
// };
// const OUTER_WIDTH = 960;
// const OUTER_HEIGHT = 500;


// ES6 class
class BarChart {
  constructor(id, data, titleText, hasTotal = true) {
    this.id = id;
    this.data = data;
    this.titleText = titleText;
    if (hasTotal) {
      data.push({
        key: "Total",
        value: 0
      });
    }

    this.y = d3.scaleBand().domain(this.getKeys(data)).padding(0.2);
    this.bothPositiveAndNegativeValues = false;
    this.forecastKeys = _.filter(this.data, {
      'isForecast': true
    }).map((d) => {
      return d.key;
    });
    const minValue = this.getMinValue(data);
    const maxValue = this.getMaxValue(data);
    const domainLimit = Math.abs(maxValue) >= Math.abs(minValue) ? Math.abs(maxValue) : Math.abs(minValue);
    let maxLimit = domainLimit;
    let minLimit = -domainLimit;
    let svgElement = document.getElementById(id);
    if (minValue >= 0) {
      minLimit = 0;
    }
    if (maxValue <= 0) {
      maxLimit = 0;
    }
    if (minValue < 0 && maxValue > 0) {
      this.bothPositiveAndNegativeValues = true;
      svgElement.setAttribute("width", svgElement.clientWidth * 2);
    }

    this.x = d3.scaleLinear().domain([minLimit, maxLimit]);
    this.svg = d3.select(`#${id}`);
    this.g = this.svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    window.addEventListener("resize", this.draw());
  }

  draw() {
    this.g.append("g")
      .attr("class", "axis axis--y");

    const bounds = this.svg.node().getBoundingClientRect(),
      width = bounds.width - MARGIN.left - MARGIN.right,
      height = bounds.height - MARGIN.top - MARGIN.bottom;


    // const yOrigin = this.bothPositiveAndNegativeValues ? height / 2 : height;
    const xOrigin = this.bothPositiveAndNegativeValues ? width / 2 : 1;

    this.svg.append("text")
      .attr("x", MARGIN.left * 2)
      .attr("y", MARGIN.top / 4)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(this.titleText);
    this.svg.append("text")
      .attr("y", height + MARGIN.top)
      .attr("x", width / 2)
      .attr("dy", "0.71em")
      .text("Sales");


    this.y.rangeRound([0, height]);
    this.x.rangeRound([xOrigin, width]);

    this.g.select(".axis--y")
      .attr("transform", "translate(0," + xOrigin + ")")
      .call(d3.axisLeft(this.y));

    // this.g.select(".axis--y")
    //   .call(d3.axisLeft(this.y).ticks(10, "%"));

    const bars = this.g.selectAll(".bar")
      .data(this.data);


    // ENTER
    bars
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", (d) => {
        return this.y(d.key);
      })
      .attr("x", (d) => {
        return xOrigin;
      })
      .attr("width", (d) => {
        if (d.key.search(new RegExp("total", "i")) == -1) {
          return Math.abs(this.x(d.value));
        } else {
          return 0;
        }
      })
      .attr("height", this.y.bandwidth())
      .style("fill", (d) => {
        return this.getFillColor(d.key)
      });


    // UPDATE
    // bars.attr("x", (d) => {
    //     return this.x(d.key);
    //   })
    //   .attr("y", (d) => {
    //     if (d.value >= 0) {
    //       return this.y(d.value)
    //     } else {
    //       return yOrigin;
    //     };
    //   })
    //   .attr("width", this.x.bandwidth())
    //   .attr("height", (d) => {
    //     return Math.abs(yOrigin - this.y(d.value));
    //   })
    //   .style("fill", "lime");

    //BAR LABELS
    this.g.selectAll("text.bar")
      .data(this.data)
      .enter().append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", (d) => {
        if (d.key.toString().search(new RegExp("total", "i")) != -1) {
          return "bold";
        }
      })
      .style("fill", "DarkSlateGrey")
      .attr("y", (d) => {
        return (this.y(d.key) + (this.y.bandwidth() / 1.5));
      })
      .attr("x", (d) => {
        return this.x(d.value) + this.y.bandwidth();
      })
      .text((d) => {
        if (d.key.toString().search(new RegExp("total", "i")) != -1) {
          return this.kFormatter(this.data.map(item => item.value).reduce((prev, next) => prev + next));
        } else {
          return this.kFormatter(Math.round(Number(d.value)));
        }
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

  kFormatter(num) {
    return num > 999 ? (num / 1000).toFixed(0) + 'k' : num;
  }

  getFillColor(key) {
    if (this.forecastKeys.indexOf(key) != -1) {
      return "DarkGrey";
    } else {
      return "DarkSlateGrey";
    }
  }

}

// Make bar chart factory function
// defaut export, defaut params
export default function(id = 'chart1', data = [], title) {
  return new BarChart(id, data, title);
}
