import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';

import { Layout, Menu } from 'antd';

import Home from 'view/Home/Home';
import BarChartPage from 'view/BarChartPage/BarChartPage';
import LineChartPage from 'view/LineChartPage/LineChartPage';
import PieChartPage from 'view/PieChartPage/PieChartPage';
import ChinaMapPage from 'view/ChinaMapPage/ChinaMapPage';
import SVGTreePage from 'view/SVGTreePage/SVGTreePage';
import css from './App.module.scss';

const { Header, Footer, Sider, Content } = Layout;

export default function App() {
  return (
    <Router basename="/d3-learn">
      <div className={css.app}>
        <Layout className={css.container}>
          <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ lineHeight: '64px' }}>
              <Menu.Item key="1">D3</Menu.Item>
            </Menu>
          </Header>
          <Layout className={css.body}>
            <Sider>
              <Menu className={css.sideBarMenu} theme="light" mode="inline" defaultSelectedKeys={['home']}>
                <Menu.Item key="home">
                  <Link className="nav-text" to="/home">
                    home
                  </Link>
                </Menu.Item>
                <Menu.Item key="bar">
                  <Link className="nav-text" to="/bar">
                    bar chart
                  </Link>
                </Menu.Item>
                <Menu.Item key="line">
                  <Link className="nav-text" to="/line">
                    line chart
                  </Link>
                </Menu.Item>
                <Menu.Item key="pie">
                  <Link className="nav-text" to="/pie">
                    pie chart
                  </Link>
                </Menu.Item>
                <Menu.Item key="map">
                  <Link className="nav-text" to="/map">
                    map chart
                  </Link>
                </Menu.Item>
                <Menu.Item key="svgTree">
                  <Link className="nav-text" to="/svg-tree">
                    svg tree
                  </Link>
                </Menu.Item>
              </Menu>
            </Sider>
            <Content>
              <Switch>
                <Route path="/home">
                  <Home />
                </Route>
                <Route path="/bar">
                  <BarChartPage />
                </Route>
                <Route path="/line">
                  <LineChartPage />
                </Route>
                <Route path="/pie">
                  <PieChartPage />
                </Route>
                <Route path="/map">
                  <ChinaMapPage />
                </Route>
                <Route path="/svg-tree">
                  <SVGTreePage />
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
              </Switch>
            </Content>
          </Layout>
          <Footer className={css.footer}>Footer</Footer>
        </Layout>
      </div>
    </Router>
  );
}
