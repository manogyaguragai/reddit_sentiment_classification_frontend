import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { RedditOutlined } from '@ant-design/icons';
import HomePage from './HomePage';
import DetailsPage from './DetailsPage';  
import './styles.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="App" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header style={{ backgroundColor: 'white', padding: 0 }}>
          <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']} style={{ justifyContent: 'center' }}>
            <Menu.Item key="1">
              <Link to="/" style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RedditOutlined style={{ fontSize: '24px', color: '#FF4500' }} />
                Reddit Sentiment Analyzer
              </Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content" style={{ padding: '24px', minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/details/:id" element={<DetailsPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;