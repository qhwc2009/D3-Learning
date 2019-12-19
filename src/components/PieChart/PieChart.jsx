import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';
import { uuid } from 'utils/utils';
import Chart from 'Chart/Chart';
import css from './PieChart.module.scss';

function PieChart({ config, className = '' }) {
  const chartId = useRef(uuid());

  const chartRef = useRef(new Chart());

  const chartContainer = useRef();

  useEffect(() => {
    // 得到chart container, 并设置给chart.box
    const box = d3.select(`#${chartId.current}`);
    const chart = chartRef.current;
    chart.box(box);

    // 设置一下配置参数
    chart.margins(config.margins);
    const height = chartContainer.current.offsetHeight;
    const width = chartContainer.current.offsetWidth;
    chart.width(width);
    chart.height(height);

    // 拿出data
    const data = _.get(config, 'data', []) || [];

    // 得到color方法
    const color = d3
      .scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse()); // TODO: 有可能要加入d3-scale-chromatic模块

    // 得到弧线生成器
    const arc = d3
      .arc()
      .innerRadius(Math.min(chart.getBodyWidth(), chart.getBodyHeight()) / 4 - 1)
      .outerRadius(Math.min(chart.getBodyWidth(), chart.getBodyHeight()) / 2 - 1);

    // 得到饼形上的label所在的弧线生成器
    const arcLabelRadius = (Math.min(chart.getBodyWidth(), chart.getBodyHeight()) / 2) * 0.8;
    const arcLabel = d3
      .arc()
      .innerRadius(arcLabelRadius)
      .outerRadius(arcLabelRadius);

    // 得到饼形数据集生成器
    const pie = d3
      .pie()
      .sort(null)
      .value(d => d.value);

    // 渲染图形
    chart.renderPie = function() {
      // 得到饼形图数据集
      const arcs = pie(data);

      chart
        .body()
        .select('.pie-chart-pie')
        .remove();
      chart
        .body()
        .select('.pie-chart-pie-label')
        .remove();

      // 把饼形图加到svg的body中
      chart
        .body()
        .append('g')
        .attr('transform', `translate(${chart.getBodyWidth() / 2}, ${chart.getBodyHeight() / 2})`)
        .attr('class', 'pie-chart-pie')
        .attr('stroke', 'white')
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', d => color(d.data.name))
        .attr('d', arc)
        .append('title')
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

      chart
        .body()
        .append('g')
        .attr('transform', `translate(${chart.getBodyWidth() / 2}, ${chart.getBodyHeight() / 2})`)
        .attr('class', 'pie-chart-pie-label')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append('tspan'))
        .attr('y', '-0.4em')
        .attr('font-weight', 'bold')
        .text(d => d.data.name)
        .call(text =>
          text
            .filter(d => d.endAngle - d.startAngle > 0.25)
            .append('tspan')
            .attr('x', 0)
            .attr('y', '0.7em')
            .attr('fill-opacity', 0.7)
            .text(d => d.data.value.toLocaleString()),
        );
    };

    chart.render = function() {
      // chart.svg().attr('viewBox', [-chart.width() / 2, -chart.height() / 2, chart.width(), chart.height()]);
      chart.renderPie();
    };

    chart.renderChart();
  }, [config]);

  return <div ref={chartContainer} id={chartId.current} className={c(css.piechart, className, 'pie-chart-box')}></div>;
}

PieChart.propTypes = {
  config: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default PieChart;
