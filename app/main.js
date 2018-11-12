import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';

import VerticalBarChart from './VerticalBarChart';
import HorizontalBar from './VerticalBarChart';

require('./main.scss'); // will build CSS from SASS 3 file

// const chartWidth = 400;
// const chartHeight = 300;

const yearlySalesByCategoryContainer = document.getElementById("yearly-sales-by-category-container");
const totalSalesByMonth = document.getElementById("total-sales-by-month-container");

let categoriesIds = [];

d3.csv("/data/data.csv", (d) => {
  if (!_.isEmpty(d.CategoryID)) {
    return {
      categoryId: d.CategoryID,
      categoryName: d.CategoryName,
      year: d.Year,
      yearMonth: d.YearMonth.replace("_", "-"),
      quantity: Number(d.Quantity),
      sales: Number(d.Sales),
    };
  }
}).then(function(data) {

  //Sales/Year by Category Charts
  const categoryIds = _.uniq(_.map(data, 'categoryId'));
  categoryIds.forEach((categoryId) => {
    let newChart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newChart.id = "yearly-sales-by-category-" + categoryId;
    newChart.setAttribute('width', '250px');
    newChart.setAttribute('height', '350px');
    yearlySalesByCategoryContainer.append(newChart);

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
    window.addEventListener('retotalSalesByMonthsize', VerticalBarChart(newChart.id, chartData, titleText));
  });
  //Sales/Year Chart (2012)
  const year = "2012";
  let newChart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newChart.id = "total-sales-by-month-" + year;
  newChart.setAttribute('width', '500px');
  newChart.setAttribute('height', '350px');
  totalSalesByMonth.append(newChart);
  const dataFromYear = _.filter(data, {
    'year': year
  });
  const months = _.sortBy(_.uniq(_.map(dataFromYear, 'yearMonth')), month => moment(month));
  let chartData = [];
  months.forEach((yearMonth, index) => {
    const dataFromMonth = _.filter(dataFromYear, {
      'yearMonth': yearMonth
    });
    let sum = 0;
    dataFromMonth.forEach((cYD) => {
      sum = sum + Number(cYD.sales);
    });
    chartData.push({
      key: moment(yearMonth).format("MMM"),
      value: Number(sum),
      isForecast: index > months.length - 4 ? true : false
    });
  });
  window.addEventListener('resize', VerticalBarChart(newChart.id, chartData, "Sales - 2012"));
});
