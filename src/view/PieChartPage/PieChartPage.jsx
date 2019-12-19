import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';

import PieChart from 'components/PieChart/PieChart';
import css from './PieChartPage.module.scss';

function PieChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const readCSV = async () => {
      try {
        const readData = await d3.csv(process.env.PUBLIC_URL + './population-by-age.csv');
        setData(readData);
      } catch (e) {
        // eslint-disable-next-line
        console.log('e: ', e);
      }
    };
    readCSV();
  }, []);

  const config = useMemo(
    () => ({
      data,
      title: '饼形图',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      textColor: 'black',
      gridColor: 'gray',
      animateDuration: 1000,
    }),
    [data],
  );

  return (
    <div className={css.pieChartPage}>
      <PieChart config={config} />
    </div>
  );
}

export default PieChartPage;
