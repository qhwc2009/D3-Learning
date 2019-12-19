import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';
import { uuid } from 'utils/utils';
import Chart from 'Chart/Chart';
import css from './LineChart.module.scss';

function LineChart({ config, className = '' }) {
  const chartId = useRef(uuid());

  const chartRef = useRef(new Chart());

  useEffect(() => {
    // 得到chart container, 并设置给chart.box
    const box = d3.select(`#${chartId.current}`);
    const chart = chartRef.current;
    chart.box(box);

    // 设置一下配置参数
    chart.margins(config.margins);

    // 拿出data
    const data = _.get(config, 'data', []) || [];

    const parseDate = d3.timeParse('%Y-%m-%d');
    // x
    const x = d3
      .scaleUtc()
      .domain(d3.extent(data, d => parseDate(d.date)))
      .range([0, chart.getBodyWidth()]);

    // y
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([chart.getBodyHeight(), 0]);

    // line
    const line = d3
      .line()
      .defined(d => !Number.isNaN(+d.value))
      .x(d => {
        return x(parseDate(d.date));
      })
      .y(d => {
        return y(d.value);
      });

    // xAxis
    const xAxis = g =>
      g
        .attr('class', 'line-chart-xaxis')
        .attr('transform', `translate(${chart.bodyX()}, ${chart.bodyY() + chart.getBodyHeight()})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(chart.width() / 80)
            .tickSizeOuter(0),
        );

    // yAxis
    const yAxis = g =>
      g
        .attr('class', 'line-chart-yaxis')
        .attr('transform', `translate(${chart.bodyX()}, ${chart.bodyY()})`)
        .call(d3.axisLeft(y))
        // .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('$ Close'),
        );

    chart.renderAxis = function() {
      chart
        .svg()
        .select('.line-chart-xaxis')
        .remove();
      chart
        .svg()
        .select('.line-chart-yaxis')
        .remove();

      chart
        .svg()
        .append('g')
        .call(xAxis);
        
      chart
        .svg()
        .append('g')
        .call(yAxis);
    };

    chart.renderLine = function() {
      chart
        .svg()
        .select('.line-chart-line-defined')
        .remove();
      chart
        .svg()
        .select('.line-chart-line')
        .remove();
      chart
        .body()
        .append('path')
        .attr('class', 'line-chart-line-defined')
        .datum(data.filter(line.defined()))
        .attr('stroke', config.hoverColor)
        .attr('fill', 'none')
        .attr('d', line);
      chart
        .body()
        .append('path')
        .attr('class', 'line-chart-line')
        .datum(data)
        .attr('stroke', config.lineColor)
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('d', line);
    };

    chart.render = function() {
      chart.renderAxis();
      chart.renderLine();
    };

    chart.renderChart();
  }, [config]);

  return <div id={chartId.current} className={c(css.linechart, className, 'line-chart-box')}></div>;
}

LineChart.propTypes = {
  config: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default LineChart;
