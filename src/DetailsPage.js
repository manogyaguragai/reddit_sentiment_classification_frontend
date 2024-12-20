import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  Spin,
  Typography,
  Tag,
  Pagination,
  Layout,
  Card,
  Row,
  Col,
} from 'antd';
import axios from 'axios';
import { Bar } from '@ant-design/charts';

const { Title } = Typography;
const { Content } = Layout;

function DetailsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [postTitle, setPostTitle] = useState(''); // Post title stored only once
  const [chartData, setChartData] = useState([]);
  const { id } = useParams();

  // Fetch comments and post details
  const fetchComments = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/posts/${id}`, {
        params: {
          page_number: page,
          documents_per_page: pageSize,
        },
        headers: {
          accept: 'application/json',
        },
      });

      setComments(response.data.documents);

      // Set the post title directly from the first document's response
      if (response.data.documents.length > 0) {
        setPostTitle(response.data.documents[0].post_title);
      }

      setPagination({
        current: response.data.current_page,
        pageSize: pageSize,
        total: response.data.total_documents,
      });
    } catch (err) {
      setError('Failed to fetch comments. Please try again later.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bar chart data
  const fetchChartData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/posts/${id}/chart`, {
        headers: { accept: 'application/json' },
      });

      if (response.data && response.data.length > 0) {
        // Ensure that all sentiment categories are represented, even with count = 0
        const sentimentCategories = [
          'Neutral', 'Satisfied', 'Dissatisfied', 'Sarcastic', 'Curious', 'Sad', 'Profanity',
        ];

        const chartData = sentimentCategories.map((sentiment) => {
          const sentimentData = response.data.find(item => item.sentiment === sentiment);
          return {
            sentiment: sentiment,
            count: sentimentData ? sentimentData.count : 0,
          };
        });

        setChartData(chartData);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  useEffect(() => {
    fetchComments(pagination.current, pagination.pageSize);
    fetchChartData();
  }, [id, pagination.current, pagination.pageSize]);

  const handleTableChange = (page, pageSize) => {
    fetchComments(page, pageSize);
  };

  const columns = [
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Comment',
      dataIndex: 'body',
      key: 'body',
      width: '50%',
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_utc',
      key: 'created_utc',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (sentiment) => {
        const sentimentColors = {
          Neutral: 'blue',
          Curious: 'green',
          Dissatisfied: 'red',
          Satisfied: 'green',
          Sad: 'red',
          Profanity: 'red',
          Sarcastic: 'green',
        };
        return (
          <Tag color={sentimentColors[sentiment] || 'default'}>{sentiment}</Tag>
        );
      },
    },
  ];

  return (
    <Content style={{ padding: '0 50px' }}>
      <div
        className="site-layout-content"
        style={{ padding: '24px', minHeight: 280, backgroundColor: 'white' }}
      >
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={10}>
            <Card title="Post Title" bordered>
              {postTitle ? <p>{postTitle}</p> : <Spin tip="Loading post title..." />}
            </Card>
          </Col>
          <Col span={14}>
            <Card title="Post Analytics" bordered>
              {chartData.length > 0 ? (
                <Bar
                  data={chartData}
                  xField="sentiment"
                  yField="count"
                  seriesField="sentiment"
                  color={[
                    'blue',
                    'green',
                    'red',
                    'orange',
                    'purple',
                    'cyan',
                    'yellow',
                  ]}
                  height={300}
                />
              ) : (
                <Spin tip="Loading chart data..." />
              )}
            </Card>
          </Col>
        </Row>

        <Table
          dataSource={comments}
          columns={columns}
          rowKey={(record) => `${record.post_id}-${record.author}-${record.created_utc}`}
          pagination={false}
          loading={loading}
          style={{ backgroundColor: 'white' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handleTableChange}
            showTotal={(total) => `Total ${total} comments`}
            showSizeChanger={false}
          />
        </div>
      </div>
    </Content>
  );
}

export default DetailsPage;
