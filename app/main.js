import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';

import VerticalBarChart from './VerticalBarChart';
import HorizontalBar from './HorizontalBarChart';

require('./main.css'); // will build CSS from SASS 3 file

// const chartWidth = 400;
// const chartHeight = 300;

const yearlySalesByCategoryContainer = document.getElementById("yearly-sales-by-category-container");
const totalSalesByMonth = document.getElementById("total-sales-by-month-container");
const totalSalesByCategory = document.getElementById("total-sales-year-by-category-container");

let categoriesIds = [];

d3.csv("./data/data.csv", (d) => {
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
  const chart1Year = "2012";
  let chart1Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chart1Element.id = "total-sales-by-month-" + chart1Year;
  chart1Element.setAttribute('width', '500px');
  chart1Element.setAttribute('height', '350px');
  totalSalesByMonth.append(chart1Element);
  const dataFromYear = _.filter(data, {
    'year': chart1Year
  });
  const chart1Months = _.sortBy(_.uniq(_.map(dataFromYear, 'yearMonth')), month => moment(month));
  let chart1Data = [];
  chart1Months.forEach((yearMonth, index) => {
    const dataFromMonth = _.filter(dataFromYear, {
      'yearMonth': yearMonth
    });
    let sum = 0;
    dataFromMonth.forEach((cYD) => {
      sum = sum + Number(cYD.sales);
    });
    chart1Data.push({
      key: moment(yearMonth).format("MMM"),
      value: Number(sum),
      isForecast: index > chart1Months.length - 4 ? true : false
    });
  });
  window.addEventListener('resize', VerticalBarChart(chart1Element.id, chart1Data, "Sales - 2012"));

  //Sales/Category Chart (2012)
  let chart2Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chart2Element.id = "total-sales-by-category-" + chart1Year;
  chart2Element.setAttribute('width', '700px');
  chart2Element.setAttribute('height', '400px');
  totalSalesByCategory.append(chart2Element);
  const chart2Categories = _.uniq(_.map(dataFromYear, 'categoryName'));
  let chart2Data = [];
  chart2Categories.forEach((categoryName, index) => {
    const dataFromCategory = _.filter(dataFromYear, {
      'categoryName': categoryName
    });
    let sum = 0;
    dataFromCategory.forEach((cYD) => {
      sum = sum + Number(cYD.sales);
    });
    chart2Data.push({
      key: categoryName,
      value: Number(sum),
      isForecast: false
    });
  });
  window.addEventListener('resize', HorizontalBar(chart2Element.id, chart2Data, "Sales - 2012"));
});
