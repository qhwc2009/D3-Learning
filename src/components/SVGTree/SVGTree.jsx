import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';

import { uuid } from 'utils/utils';
import Chart from 'Chart/Chart';
import css from './SVGTree.module.scss';

function SVGTree({ config, className = '' }) {
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
    const data = _.get(config, 'data', {});

    // 树生成器
    const dy = width / 6;
    const dx = 10;
    const tree = d3.tree().nodeSize([dx, dy]);

    // 创建一个水平的 link 生成器
    const diagonal = d3
      .linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);

    // 从给定的层次结构数据构造一个根节点并为各个节点指定深度等属性
    const root = d3.hierarchy(data);
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) {
        d.children = null;
      }
    });

    // 首先把svg设置属性
    chart.renderSVG = function() {
      chart.defineBodyClip = () => {};
      if (!chart.svg()) {
        chart.svg(
          chart
            .box()
            .append('svg')
            .attr('class', 'svg-container')
            .attr('viewBox', [0, 0, width, dx])
            .style('font', '10px sans-serif')
            .style('user-select', 'none')
            .attr('width', this._width)
            .attr('height', this._height),
        );
      }
    };
    // 渲染树图
    chart.renderSVGTree = function() {
      chart.body().select('.link').remove();
      const gLink = chart
        .body()
        .append('g')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5);

      chart.body().select('.node').remove();
      const gNode = chart
        .body()
        .append('g')
        .attr('class', 'node')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');

      function update(source) {
        const duration = d3.event && d3.event.altKey ? 2500 : 250;
        // 拿到所有的1节点
        const nodes = root.descendants().reverse();
        // 拿到所有的线
        const links = root.links();

        // 计算新tree布局
        tree(root);

        // 找到最高点和最低点
        let left = root;
        let right = root;
        root.eachBefore(node => {
          if (node.x < left.x) {
            left = node;
          }
          if (node.x > right.x) {
            right = node;
          }
        });

        const height = right.x - left.x + config.margins.top + config.margins.bottom;

        const transition = chart
          .svg()
          .transition()
          .duration(duration)
          .attr('viewBox', [0, left.x - config.margins.top, width, height])
          .attr('preserveAspectRatio', 'xMinYMin meet')
          .tween('resize', window.ResizeObserver ? null : () => () => chart.svg().dispatch('toggle'));

        const node = gNode.selectAll('g').data(nodes, d => d.id);

        const nodeEnter = node
          .enter()
          .append('g')
          .attr('class', 'node-node')
          .attr('transform', d => `translate(${source.y0}, ${source.x0})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .on('click', d => {
            d.children = d.children ? null : d._children;
            update(d);
          });

        nodeEnter
          .append('circle')
          .attr('class', 'node-circle')
          .attr('r', 2.5)
          .attr('fill', d => (d._children ? '#555' : '#999'))
          .attr('stroke-width', 10);

        // 把所有节点挪到他们的新位置
        const updateNode = node.merge(nodeEnter);

        updateNode
          .transition(transition)
          .attr('transform', d => `translate(${d.y}, ${d.x})`)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1);

        chart
          .svg()
          .selectAll('text')
          .remove();

        updateNode
          .append('text')
          .attr('dy', '0.31em')
          .attr('x', d => (d.children ? -6 : 6))
          .attr('text-anchor', d => (d.children ? 'end' : 'start'))
          .text(d => d.data.name)
          .clone(true)
          .lower()
          .attr('stroke-linejoin', 'round')
          .attr('stroke-width', 3)
          .attr('stroke', 'white');

        // 应该删除的节点 挪到他们的父节点再删除
        node
          .exit()
          .transition(transition)
          .remove()
          .attr('transform', d => `translate(${source.y}, ${source.x})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0);

        // 更新链接线
        const link = gLink.selectAll('path').data(links, d => d.target.id);

        const linkEnter = link
          .enter()
          .append('path')
          .attr('class', 'link-path')
          .attr('d', d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
          });

        link
          .merge(linkEnter)
          .transition(transition)
          .attr('d', diagonal);

        link
          .exit()
          .transition(transition)
          .attr('d', d => {
            const o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
          });

        // 隐藏掉旧节点位置
        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      update(root);
    };

    chart.render = function() {
      chart.renderSVGTree();
    };

    chart.renderChart();
  }, [config]);

  return <div ref={chartContainer} id={chartId.current} className={c(css.svgTree, className, 'svg-tree')}></div>;
}

SVGTree.propTypes = {
  config: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default SVGTree;
