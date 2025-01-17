import React, { useState, useEffect } from 'react';
import { Table, Modal, FloatButton, Pagination, Input, Form, Button, Space, Tag, Tooltip, Spin, Progress, notification, Steps, Select } from 'antd';
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
  const [subredditOptions, setSubredditOptions] = useState([]);
  const [sentimentOptions, setSentimentOptions] = useState([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  useEffect(() => {
    fetchPosts(currentPage, searchQuery);
    fetchSubreddits();
    fetchSentiments();
  }, [currentPage, searchQuery, selectedSubreddit, selectedSentiment]);

  const fetchSubreddits = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/subreddits');
      const options = [
        { label: 'All Subreddits', value: null },
        ...response.data.map(subreddit => ({
          label: subreddit,
          value: subreddit,
        }))
      ];
      setSubredditOptions(options);
    } catch (error) {
      console.error('Error fetching subreddits:', error);
    }
  };

  const fetchSentiments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/sentiments');
      const options = [
        { label: 'All Sentiments', value: null },
        ...response.data.map(sentiment => ({
          label: sentiment,
          value: sentiment,
        })),
      ];
      setSentimentOptions(options);
    } catch (error) {
      console.error('Error fetching sentiments:', error);
    }
  };

  const handleSubredditChange = (value) => {
    setSelectedSubreddit(value);
    setCurrentPage(1);
  };
  
  const handleSentimentChange = (value) => {
    setSelectedSentiment(value);
    setCurrentPage(1);
  };

  const fetchPosts = async (pageNumber, searchQuery) => {
    setLoading(true);
    try {
      const params = {
        'page_number': pageNumber,
        'documents_per_page': '10',
        'post_search_query': searchQuery,
      };

      if (selectedSubreddit) {
        params.subreddit = selectedSubreddit;
      }

      if (selectedSentiment) {
        params.sentiment = selectedSentiment;
      }

      const response = await axios.get('http://127.0.0.1:8000/posts/all', {
        params,
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

  return (    
    <div className="home-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Steps
          progressDot        
          current={3}
          size="small"
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
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        marginBottom: '16px', 
        gap: '16px',
        alignItems: 'center' 
      }}>
        <div style={{ flex: 1 }}>
          <Input.Search
            placeholder="Search by post title"
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={() => {
              setCurrentPage(1);
              fetchPosts(1, searchQuery);
            }}
            enterButton
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 0 }}>
          <Select
            value={selectedSubreddit}
            onChange={handleSubredditChange}
            options={subredditOptions}
            style={{ width: 200 }}
            placeholder="Select Subreddit"
            allowClear
          />
        </div>
        <div style={{ flex: 0 }}>
          <Select
            value={selectedSentiment}
            onChange={handleSentimentChange}
            options={sentimentOptions}
            style={{ width: 200 }}
            placeholder="Select Sentiment"
            allowClear
          />
        </div>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={posts}
        pagination={false}
        rowKey="post_id"
      />
      
      <Pagination
        current={currentPage}
        total={totalPages * 10}
        pageSize={10}
        onChange={handlePageChange}
        showSizeChanger={false}
        style={{ marginTop: '16px', textAlign: 'center' }}
      />

      <FloatButton.Group
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <FloatButton
          icon={<RedditOutlined />}
          tooltip="Fetch by Subreddit"
          onClick={() => setIsSubredditModalVisible(true)}
        />
        <FloatButton
          icon={<LinkOutlined />}
          tooltip="Fetch by URL"
          onClick={() => setIsPostUrlModalVisible(true)}
        />
      </FloatButton.Group>

      <Modal
        title="Fetch Reddit Comments by Subreddit"
        visible={isSubredditModalVisible}
        onCancel={() => setIsSubredditModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={fetchSubredditPosts}
        >
          <Form.Item
            name="subreddit"
            label="Subreddit"
            rules={[{ required: true, message: 'Please enter a subreddit!' }]}
          >
            <Input placeholder="e.g. r/learnprogramming" />
          </Form.Item>
          <Form.Item
            name="limit"
            label="Limit"
            initialValue={100}
            rules={[{ required: true, message: 'Please specify the limit!' }]}
          >
            <Input type="number" />
          </Form.Item>
          {subredditModalState === 'loading' && <Spin />}
          {subredditModalState === 'error' && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={subredditModalState === 'loading'}>
              Fetch Posts
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Fetch Reddit Comments by URL"
        visible={isPostUrlModalVisible}
        onCancel={() => setIsPostUrlModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={onPostUrlSubmit}
        >
          <Form.Item
            name="postUrl"
            label="Post URL"
            rules={[{ required: true, message: 'Please enter a Reddit post URL!' }]}
          >
            <Input placeholder="e.g. https://www.reddit.com/r/learnprogramming/comments/xyz" />
          </Form.Item>
          {postUrlModalState === 'loading' && <Spin />}
          {postUrlModalState === 'error' && <p style={{ color: 'red' }}>{postUrlErrorMessage}</p>}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={postUrlModalState === 'loading'}>
              Fetch Comments
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HomePage;