import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import dayjs from 'dayjs';

import LineChart from 'components/LineChart/LineChart';
import css from './LineChartPage.module.scss';

function LineChartPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const readCSV = async () => {
      try {
        const readData = await d3.csv(process.env.PUBLIC_URL + '/aapl.csv', function(d) {
          return {
            date: dayjs(d.date, 'MMM D, YYYY').format('YYYY-MM-DD'),
            value: +d.val,
          };
        });
        setData(
          readData
            .filter(d => !Number.isNaN(d.value))
            .map(d => ({
              ...d,
              value: dayjs(d.date, 'YYYY-MM-DD').month() < 3 ? undefined : d.value,
            })),
        );
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
      title: '线形图',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      barPadding: 0.15,
      lineColor: '#096dd9',
      textColor: 'black',
      gridColor: 'gray',
      hoverColor: '#40a9ff',
      animateDuration: 1000,
    }),
    [data],
  );

  return (
    <div className={css.lineChartPage}>
      <LineChart config={config} />
    </div>
  );
}

export default LineChartPage;
