import * as d3 from 'd3';

const MARGIN = {
  top: 50,
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


// ES6 class
class BarChart {
  constructor(id, data, titleText, hasTotal = true) {
    //Show
    document.getElementById(id).parentElement.style.display = 'block';

    this.id = id;
    this.data = data;
    this.titleText = titleText;
    if (hasTotal) {
      data.push({
        key: "Total",
        value: 0
      });
    }

    this.x = d3.scaleBand().domain(this.getKeys(data)).padding(0.25);
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
      svgElement.setAttribute("height", svgElement.clientHeight * 2);
    }


    this.y = d3.scaleLinear().domain([minLimit, maxLimit]);
    this.svg = d3.select(`#${id}`);
    this.g = this.svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    window.addEventListener("resize", this.draw());
  }

  draw() {
    this.g.append("g")
      .attr("class", "axis axis--x");

    const bounds = this.svg.node().getBoundingClientRect(),
      width = bounds.width - MARGIN.left - MARGIN.right,
      height = bounds.height - MARGIN.top - MARGIN.bottom;

    const yOrigin = this.bothPositiveAndNegativeValues ? height / 2 : height;

    this.svg.append("text")
      .attr("x", MARGIN.left * 2)
      .attr("y", MARGIN.top / 4)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(this.titleText);
    this.svg.append("text")
      .attr("y", yOrigin / 2)
      .attr("x", (MARGIN.left / 2) / 2)
      .attr("dy", "0.71em")
      .text("Sales");


    this.x.rangeRound([0, width]);
    this.y.rangeRound([yOrigin, 0]);

    this.g.select(".axis--x")
      .attr("transform", "translate(0," + yOrigin + ")")
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
          return yOrigin
        };
      })
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => {
        return Math.abs(yOrigin - this.y(d.value));
      })
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
      .attr("x", (d) => {
        return this.x(d.key) + (this.x.bandwidth() / 2);
      })
      .attr("y", (d) => {
        return this.y(d.value) - 5;
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

    //Hide
    document.getElementById(this.id).parentElement.style.display = 'none';

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
