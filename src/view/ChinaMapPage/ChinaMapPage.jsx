import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Map from 'components/Map/Map';
import css from './ChinaMapPage.module.scss';

function ChinaMapPage() {
  const [mapData, setMapData] = useState({});
  const [cityData, setCityData] = useState({});

  useEffect(() => {
    const readCSV = async () => {
      try {
        const mapJson = await d3.json(process.env.PUBLIC_URL + './china.json');
        setMapData(mapJson);
        const cityJson = await d3.json(process.env.PUBLIC_URL + './city.json');
        setCityData(cityJson);
      } catch (e) {
        // eslint-disable-next-line
        console.log('e: ', e);
      }
    };
    readCSV();
  }, []);

  const config = useMemo(
    () => ({
      data: mapData,
      cityData: _.get(cityData, 'cities', []),
      title: '中国地图',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      textColor: 'black',
      gridColor: 'gray',
      animateDuration: 1000,
    }),
    [mapData, cityData],
  );

  return (
    <div className={css.chinaMapPage}>
      <Map config={config} />
      <div id="china-map-tooltip"></div>
    </div>
  );
}

export default ChinaMapPage;
