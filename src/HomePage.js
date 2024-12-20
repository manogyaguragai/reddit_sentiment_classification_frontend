import React, { useState, useEffect } from 'react';
import { Table, Modal, FloatButton, Pagination, Input, Form, Button, Space, Tag, Tooltip, Spin, Progress, notification, Steps } from 'antd';
import { Link } from 'react-router-dom';
import { 
  PlusOutlined, 
  RedditOutlined, 
  LinkOutlined, 
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isSubredditModalVisible, setIsSubredditModalVisible] = useState(false);
  const [isPostUrlModalVisible, setIsPostUrlModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subredditModalState, setSubredditModalState] = useState('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [postUrlModalState, setPostUrlModalState] = useState('input');
  const [postUrlErrorMessage, setPostUrlErrorMessage] = useState('');

  useEffect(() => {
    fetchPosts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchPosts = async (pageNumber, searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/posts/all', {
        params: {
          'page_number': pageNumber,
          'documents_per_page': '10',
          'post_search_query': searchQuery,
        },
        headers: {
          'accept': 'application/json',
        },
      });
      setPosts(response.data.documents);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchSubredditPosts = async (values) => {
    setSubredditModalState('loading');

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/fetch_comments/subreddit',
        '',
        {
          params: {
            'subreddit': values.subreddit,
            'limit': values.limit,
          },
          headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      setSubredditModalState('success');
      
      setTimeout(() => {
        setIsSubredditModalVisible(false);
        setSubredditModalState('input');
        fetchPosts(currentPage, searchQuery);
      }, 2000);

    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to fetch posts from the subreddit.');
      setSubredditModalState('error');
      
      setTimeout(() => {
        setSubredditModalState('input');
      }, 2000);
    }
  };

  const onPostUrlSubmit = async (values) => {
    setPostUrlModalState('loading');

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/fetch_comments/url',
        '',
        {
          params: {
            'url': values.postUrl,
            'limit': '100',
          },
          headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      setPostUrlModalState('success');
      
      setTimeout(() => {
        setIsPostUrlModalVisible(false);
        setPostUrlModalState('input');
        fetchPosts(currentPage, searchQuery);
      }, 2000);

    } catch (error) {
      setPostUrlErrorMessage(error.response?.data?.detail || 'Failed to fetch posts from the URL.');
      setPostUrlModalState('error');
      
      setTimeout(() => {
        setPostUrlModalState('input');
      }, 2000);
    }
  };

  const columns = [
    {
      title: 'Post Title',
      dataIndex: 'post_title',
      key: 'post_title',
      render: (text, record) => (
        // Change this line to include the full post_id format
        <Link to={`/details/${record.post_id}`}>{text}</Link>
      ),
    },
    {
      title: 'Subreddit',
      dataIndex: 'subreddit',
      key: 'subreddit',
      render: (subreddit) => (
        <Tag color="default">{subreddit}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Comment Count',
      dataIndex: 'comment_count',
      key: 'comment_count',
    },
    {
      title: 'Trending Sentiment',
      dataIndex: 'trending_sentiment',
      key: 'trending_sentiment',
      render: (sentiment, record) => (
        <Tooltip title={renderSentimentBreakdown(record.sentiment_breakdown)}>
          <Tag color={getSentimentColor(sentiment)}>{sentiment}</Tag>
        </Tooltip>
      ),
    },
  ];

  const renderSentimentBreakdown = (breakdown) => (
    <div>
      <h4>Sentiment Breakdown</h4>
      {Object.entries(breakdown).map(([sentiment, count]) => (
        <div key={sentiment}>
          {sentiment}: {count}
        </div>
      ))}
    </div>
  );

  const getSentimentColor = (sentiment) => {
    const sentimentLower = sentiment.toLowerCase();
    
    if (['sad', 'dissatisfied', 'profanity'].includes(sentimentLower)) {
      return 'red';
    }
    
    if (['curious', 'satisfied', 'sarcastic'].includes(sentimentLower)) {
      return 'green';
    }
    
    if (sentimentLower === 'neutral') {
      return 'blue';
    }
    
    return 'default';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderSubredditModalContent = () => {
    switch (subredditModalState) {
      case 'loading':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <LoadingOutlined style={{ fontSize: 48, marginBottom: 24, color: '#1890ff' }} spin />
            <div style={{ fontSize: 16 }}>Fetching posts from subreddit...</div>
          </div>
        );
      
      case 'success':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 24, color: '#52c41a' }} />
            <div style={{ fontSize: 16 }}>Successfully fetched posts!</div>
          </div>
        );
      
      case 'error':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <CloseCircleOutlined style={{ fontSize: 48, marginBottom: 24, color: '#ff4d4f' }} />
            <div style={{ fontSize: 16, color: '#ff4d4f' }}>{errorMessage}</div>
          </div>
        );
      
      default:
        return (
          <Form onFinish={fetchSubredditPosts}>
            <Form.Item
              name="subreddit"
              rules={[{ required: true, message: 'Please input the subreddit name!' }]}
            >
              <Input prefix={<RedditOutlined />} placeholder="Enter subreddit name" />
            </Form.Item>
            <Form.Item
              name="limit"
              rules={[{ required: true, message: 'Please input the number of posts to fetch!' }]}
            >
              <Input type="number" placeholder="Enter limit" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Fetch Posts
              </Button>
            </Form.Item>
          </Form>
        );
    }
  };

  const renderPostUrlModalContent = () => {
    switch (postUrlModalState) {
      case 'loading':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <LoadingOutlined style={{ fontSize: 48, marginBottom: 24, color: '#1890ff' }} spin />
            <div style={{ fontSize: 16 }}>Fetching posts from URL...</div>
          </div>
        );
      
      case 'success':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 24, color: '#52c41a' }} />
            <div style={{ fontSize: 16 }}>Successfully fetched posts!</div>
          </div>
        );
      
      case 'error':
        return (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <CloseCircleOutlined style={{ fontSize: 48, marginBottom: 24, color: '#ff4d4f' }} />
            <div style={{ fontSize: 16, color: '#ff4d4f' }}>{postUrlErrorMessage}</div>
          </div>
        );
      
      default:
        return (
          <Form onFinish={onPostUrlSubmit}>
            <Form.Item
              name="postUrl"
              rules={[
                { required: true, message: 'Please input the post URL!' },
                { type: 'url', message: 'Please enter a valid URL!' }
              ]}
            >
              <Input prefix={<LinkOutlined />} placeholder="Enter post URL" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Fetch Post
              </Button>
            </Form.Item>
          </Form>
        );
    }
  };

  return (    
    <div className="home-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Steps
          progressDot        
          current={3}
          size = "small"
          items={[
            {
              title: 'Fetch Data',
              description: 'Collect Reddit comments from subreddits or specific URLs',
            },
            {
              title: 'Analyze Sentiment',
              description: 'Process comments to determine sentiment using AI',
            },
            {
              title: 'Get Analytics',
              description: 'View comprehensive insights and sentiment breakdowns',
            },
          ]}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <Input.Search
          placeholder="Search by post title"
          value={searchQuery}
          onChange={handleSearchChange}
          onSearch={() => fetchPosts(1, searchQuery)}
          enterButton
        />
      </div>

      <Spin spinning={loading} tip="Loading...">
        <Table 
          dataSource={posts} 
          columns={columns} 
          rowKey="post_id"
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <Pagination
            current={currentPage}
            total={totalPages * 10}
            pageSize={10}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </Spin>

      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{
          position: "fixed",
          right: 50,
          bottom: 50,
          zIndex: 1000,
          width: "60px",
          height: "60px", 
        }}
        icon={<PlusOutlined />}
        tooltip="Fetch Data from Reddit"
      >
        <FloatButton
          tooltip="Fetch from subreddit"
          icon={<RedditOutlined />}
          onClick={() => setIsSubredditModalVisible(true)}
        />
        <FloatButton
          tooltip="Fetch from post URL"
          icon={<LinkOutlined />}
          onClick={() => setIsPostUrlModalVisible(true)}
        />
      </FloatButton.Group>

      <Modal
        title="Fetch from Subreddit"
        open={isSubredditModalVisible}
        onCancel={() => {
          setIsSubredditModalVisible(false);
          setSubredditModalState('input');
        }}
        footer={null}
      >
        {renderSubredditModalContent()}
      </Modal>

      <Modal
        title="Fetch from Post URL"
        open={isPostUrlModalVisible}
        onCancel={() => {
          setIsPostUrlModalVisible(false);
          setPostUrlModalState('input');
        }}
        footer={null}
      >
        {renderPostUrlModalContent()}
      </Modal>
    </div>
  );
}

export default HomePage;