import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';
import { uuid } from 'utils/utils';
import Chart from 'Chart/Chart';
import css from './BarChat.module.scss';

function BarChart({ config, className = '' }) {
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

    // 尺度转换一下
    const scaleX = d3
      .scaleBand()
      .domain(data.map(d => d.date))
      .range([0, chart.getBodyWidth()])
      .padding(config.barPadding);
    chart.scaleX(scaleX);
    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.money)])
      .range([chart.getBodyHeight(), 0]);
    chart.scaleY(scaleY);

    // 渲染柱形
    chart.renderBars = function() {
      const bars = chart
        .body()
        .selectAll('.bar-chart-bar')
        .data(data);
      bars
        .enter()
        .append('rect')
        .attr('class', 'bar-chart-bar')
        .merge(bars)
        .attr('x', d => chart.scaleX()(d.date))
        .attr('y', chart.scaleY()(0))
        .attr('width', chart.scaleX().bandwidth())
        .attr('height', 0)
        .attr('fill', config.barColor)
        .transition()
        .duration(config.animateDuration)
        .attr('height', d => chart.getBodyHeight() - chart.scaleY()(d.money))
        .attr('y', d => chart.scaleY()(d.money));
      bars.exit().remove();
    };

    // 渲染坐标轴
    chart.renderX = function() {
      chart.svg().select('.bar-chart-xaxis').remove()
      // d3.select(`#${chartId.current} .bar-chart-xaxis`).remove();
      chart
        .svg()
        .insert('g', '.chart-body')
        .attr('transform', `translate(${chart.bodyX()}, ${chart.bodyY() + chart.getBodyHeight()})`)
        .attr('class', 'bar-chart-xaxis')
        .call(d3.axisBottom(chart.scaleX()));
    };

    chart.renderY = function() {
      chart.svg().select('.bar-chart-yaxis').remove()
      // d3.select(`#${chartId.current} .bar-chart-yaxis`).remove();
      chart
        .svg()
        .insert('g', '.chart-body')
        .attr('transform', `translate(${chart.bodyX()}, ${chart.bodyY()})`)
        .attr('class', 'bar-chart-yaxis')
        .call(d3.axisLeft(chart.scaleY()));
    };

    // 渲染X Y轴标签
    chart.renderText = function() {
      d3.select('.bar-chart-xaxis')
        .append('text')
        .attr('class', 'bar-chart-axisText')
        .attr('x', chart.getBodyWidth())
        .attr('y', 0)
        .attr('fill', config.textColor)
        .attr('dy', 30)
        .text('日期');

      d3.select('.bar-chart-yaxis')
        .append('text')
        .attr('class', 'bar-chart-axisText')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', config.textColor)
        .attr('transform', 'rotate(-90)')
        .attr('dy', -40)
        .attr('text-anchor', 'end')
        .text('每日收入 (元)');
    };

    // 渲染网格线
    chart.renderGrid = function() {
      d3.selectAll('.bar-chart-yaxis .tick').each(function(d) {
        if (config.tickShowGrid.indexOf(d) > -1) {
          d3.select(this)
            .append('line')
            .attr('class', 'bar-chart-grid')
            .attr('stroke', config.gridColor)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', chart.getBodyWidth())
            .attr('y2', 0);
        }
      });
    };

    // 汇总坐标轴相关的所有方法
    chart.renderAxis = function() {
      chart.renderX();
      chart.renderY();
      chart.renderText();
      chart.renderGrid();
    };

    // 绑定鼠标交互
    chart.addMouseOn = function() {
      // TODO: 防抖函数中 设置d3.event有问题
      // // 防抖
      // function debounce(fn, time) {
      //   let timeId = null;
      //   return function() {
      //     const context = this;
      //     const event = d3.event;
      //     timeId && clearTimeout(timeId);
      //     timeId = setTimeout(() => {
      //       d3.event = event;
      //       fn.apply(context, arguments);
      //     }, time);
      //   };
      // }

      d3.selectAll('.bar-chart-bar')
        .on('mouseover', function(d) {
          const e = d3.event;
          const position = d3.mouse(chart.svg().node());

          d3.select(e.target).attr('fill', config.hoverColor);

          chart
            .svg()
            .append('text')
            .classed('bar-chart-tip', true)
            .attr('x', position[0] + 5)
            .attr('y', position[1])
            .attr('fill', config.textColor)
            .text(`收入: ${d.money}元`);
        })
        .on('mouseleave', function() {
          const e = d3.event;
          d3.select(e.target).attr('fill', chart._colors(0)); // TODO: 是否要改成config.barColor

          d3.select('.bar-chart-tip').remove();
        })
        .on(
          'mousemove',
          // debounce(function() {
          //   const position = d3.mouse(chart.svg().node());
          //   d3.select('.bar-chart-tip')
          //     .attr('x', position[0] + 5)
          //     .attr('y', position[1] - 5);
          // }, 6),
          function() {
            const position = d3.mouse(chart.svg().node());
            d3.select('.bar-chart-tip')
              .attr('x', position[0] + 5)
              .attr('y', position[1] - 5);
          },
        );
    };

    chart.render = function() {
      chart.renderBars();
      chart.renderAxis();
      chart.addMouseOn();
    };
    chart.renderChart();
  }, [config]);

  return <div id={chartId.current} className={c(css.barchart, className, 'bar-chart-box')}></div>;
}

BarChart.propTypes = {
  config: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default BarChart;
