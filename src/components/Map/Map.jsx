import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';
import * as geo from 'd3-geo';
import * as d3Color from 'd3-scale-chromatic';

import { uuid } from 'utils/utils';
import Chart from 'Chart/Chart';
import css from './Map.module.scss';

function Map({ config, className = '' }) {
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

    // 拿出map data
    const mapData = _.get(config, 'data', {}) || {};
    const cityData = _.get(config, 'cityData', []) || [];

    // 设置投影函数
    const projection = geo
      .geoMercator()
      .scale(750)
      .center([105, 38])
      .translate([chart.getBodyWidth() / 2, chart.getBodyHeight() / 2]);

    // 设置路径生成器
    const path = geo.geoPath(projection);

    // 创建颜色比例尺
    const colors = d3.scaleOrdinal(d3Color.schemeRdYlGn[11]);
    // const colors = getRandomColor16;

    // 加载地图json并生成地图
    chart.renderMap = function() {
      if (!mapData.features) {
        return;
      }
      chart
        .body()
        .selectAll('.map-path')
        .remove();
      chart
        .body()
        .selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('class', 'map-path')
        .attr('d', path)
        .attr('fill', (d, i) => colors(i))
        .attr('stroke', 'lightGray')
        .attr('stroke-width', 1)
        .append('title')
        .attr('')
    };

    // 渲染城市
    chart.renderCity = function() {
      chart
        .body()
        .selectAll('.map-city')
        .data(cityData)
        .enter()
        .append('g')
        .attr('class', 'map-city')
        .attr('transform', d => {
          const coor = projection([d.log, d.lat]);
          return `translate(${coor[0]}, ${coor[1]})`;
        })
        .append('circle')
        .attr('r', 4)
        .attr('fill', 'blue')
        .attr('class', 'map-city-point');
    };

    // 添加事件互动
    chart.addEvent = function() {
      const tooltip = d3.select('#china-map-tooltip');
      chart
        .body()
        .selectAll('.map-city')
        .on('mouseover', function(d) {
          tooltip
            .html('当前城市: ' + d.name)
            .style('left', d3.event.pageX + 20 + 'px')
            .style('top', d3.event.pageY + 20 + 'px')
            .style('opacity', 1);

          d3.select(this)
            .select('circle')
            .transition()
            .duration(150)
            .attr('r', 8);
        })
        .on('mouseout', function() {
          tooltip.style('opacity', 0);
          d3.select(this)
            .select('circle')
            .transition()
            .duration(150)
            .attr('r', 4);
        });
    };

    chart.render = function() {
      chart.renderMap();
      chart.renderCity();
      chart.addEvent();
    };

    chart.renderChart();
  }, [config]);

  return <div ref={chartContainer} id={chartId.current} className={c(css.map, className, 'map-chart-map')}></div>;
}

Map.propTypes = {
  config: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default Map;
