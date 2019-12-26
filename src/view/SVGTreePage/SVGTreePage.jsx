import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';

import SVGTree from 'components/SVGTree/SVGTree';
import css from './SVGTreePage.module.scss';

function SVGTreePage() {
  const [data, setData] = useState({});

  useEffect(() => {
    const readJson = async () => {
      try {
        const treeJson = await d3.json(process.env.PUBLIC_URL + './flare-2.json');
        setData(treeJson);
      } catch (e) {
        // eslint-disable-next-line
        console.log('e: ', e);
      }
    };
    readJson();
  }, []);

  const config = useMemo(
    () => ({
      data: data,
      title: '树状图',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      textColor: 'black',
      gridColor: 'gray',
      animateDuration: 1000,
    }),
    [data],
  );

  return (
    <div className={css.svgTreePage}>
      <SVGTree config={config} />
    </div>
  );
}

export default SVGTreePage;
