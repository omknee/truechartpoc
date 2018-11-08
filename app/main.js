import * as d3 from 'd3';
import _ from 'lodash';

import makeBarChart from './bar'; // name is irrelevant since it is a default export

require('./main.scss'); // will build CSS from SASS 3 file

// const chartWidth = 400;
// const chartHeight = 300;

const mainContainer = document.getElementById("main-container");

let categoriesIds = [];

d3.csv("/data/data.csv", (d) => {
  if (!_.isEmpty(d.CategoryID)) {
    return {
      categoryId: d.CategoryID,
      categoryName: d.CategoryName,
      year: d.Year,
      quantity: Number(d.Quantity),
      sales: Number(d.Sales),
    };
  }
}).then(function(data) {
  const categoryIds = _.uniq(_.map(data, 'categoryId'));
  categoryIds.forEach((categoryId) => {
    let newChart = document.createElement("svg");
    newChart.id = "chart-" + categoryId;
    newChart.setAttribute('width', '50%');
    newChart.setAttribute('height', '500px');
    // mainContainer.append(newChart);

    const categoryData = _.filter(data, {
      'categoryId': categoryId
    });

    const titleText = categoryData[0].categoryName;
    const years = _.uniq(_.map(categoryData, 'year'));

    let chartData = [];
    years.forEach((year) => {
      const categoryYearData = _.filter(categoryData, {
        'year': year
      });
      let sum = 0;
      categoryYearData.forEach((cYD) => {
        sum = sum + Number(cYD.sales);
      });
      chartData.push({
        key: Number(year),
        value: Number(sum)
      });
    });
    chartData = _.sortBy(chartData, cD => cD.key);
    window.addEventListener('resize', makeBarChart(newChart.id, chartData, titleText));
  });
});
