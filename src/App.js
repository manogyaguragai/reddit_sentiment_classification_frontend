import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import HomePage from './HomePage';
import './styles.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="App" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header style={{ backgroundColor: 'white', padding: 0 }}>
          <div className="logo" />
          <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']} style={{ justifyContent: 'center' }}>
            <Menu.Item key="1">
              <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                Reddit Sentiment Analyzer
              </Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content" style={{ padding: '24px', minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
