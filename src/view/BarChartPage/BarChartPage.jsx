import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';

import BarChart from 'components/BarChart/BarChart';
import css from './BarChartPage.module.scss';

function BarChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const readCSV = async () => {
      try {
        const readData = await d3.csv(process.env.PUBLIC_URL + './data.csv', function(d) {
          return {
            date: d.date,
            money: +d.money,
          };
        });
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
      title: '条形图',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      barPadding: 0.15,
      barColor: '#096dd9',
      textColor: 'black',
      gridColor: 'gray',
      tickShowGrid: [60, 120, 180],
      hoverColor: '#40a9ff',
      animateDuration: 1000,
    }),
    [data],
  );

  return (
    <div className={css.barChartPage}>
      <BarChart config={config} />
    </div>
  );
}

export default BarChartPage;
