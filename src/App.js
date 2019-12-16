import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';

import { Layout, Menu } from 'antd';

import Home from 'view/Home/Home';
import css from './App.module.scss';

const { Header, Footer, Sider, Content } = Layout;

export default function App() {
  return (
    <Router>
      <div className={css.app}>
        <Layout className={css.container}>
          <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ lineHeight: '64px' }}>
              <Menu.Item key="1">nav 1</Menu.Item>
              <Menu.Item key="2">nav 2</Menu.Item>
              <Menu.Item key="3">nav 3</Menu.Item>
            </Menu>
          </Header>
          <Layout className={css.body}>
            <Sider>
              <Menu className={css.sideBarMenu} theme="light" mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">
                  <Link className="nav-text" to="/home">
                    home
                  </Link>
                </Menu.Item>
              </Menu>
            </Sider>
            <Content>
              <Switch>
                <Route path="/home">
                  <Home />
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
