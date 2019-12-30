import React, { useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { generateOrgChartData } from 'utils/utils';

import Tree from './Tree';

import css from './CanvasTree.module.scss';

function CanvasTree({ config = {} }) {
  const containerRef = useRef();

  const data = useMemo(() => generateOrgChartData(10), []);

  useEffect(() => {
    const tree = new Tree(containerRef.current, config);
    // eslint-disable-next-line
    console.log('containerRef width: ', containerRef.current.offsetWidth)
    // eslint-disable-next-line
    console.log('containerRef width: ', containerRef.current.offsetHeight)
    tree.draw(data);
  }, [data, config]);

  return <div ref={containerRef} className={css.canvasTree}></div>;
}

CanvasTree.propTypes = {
  config: PropTypes.object,
};

export default CanvasTree;
