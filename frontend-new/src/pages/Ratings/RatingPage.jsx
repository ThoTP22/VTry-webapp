import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Input, Button, Rate, List, Avatar, Typography, Space, Popconfirm, message, Spin, Empty, Progress, Tag, Segmented } from 'antd';
import { DeleteOutlined, UserOutlined, StarFilled } from '@ant-design/icons';
import RatingsAPI from '../../api/ratingsAPI';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const RatingPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await RatingsAPI.getAllRatings();
      setRatings(data?.ratings || []);
    } catch (err) {
      message.error(err.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const canDelete = (ratingItem) => {
    if (!user) return false;
    const isOwner = ratingItem?.user?._id === user?._id;
    const isAdmin = user?.role === 'admin';
    return isOwner || isAdmin;
  };

  const onCreate = async (values) => {
    try {
      setSubmitting(true);
      const payload = { rating: values.rating, comment: values.comment?.trim() || '' };
      await RatingsAPI.createRating(payload);
      message.success('Rating created successfully');
      form.resetFields();
      await fetchRatings();
    } catch (err) {
      message.error(err.message || 'Failed to create rating');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await RatingsAPI.deleteRating(id);
      message.success('Rating deleted successfully');
      await fetchRatings();
    } catch (err) {
      message.error(err.message || 'Failed to delete rating');
    }
  };

  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  const distribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      const val = Number(r.rating) || 0;
      if (dist[val] !== undefined) dist[val] += 1;
    });
    return dist;
  }, [ratings]);

  const averageRoundedHalf = useMemo(() => {
    return Math.round(averageRating * 2) / 2;
  }, [averageRating]);

  const ratingTooltips = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

  const sortedRatings = useMemo(() => {
    return [...ratings].sort((a, b) => {
      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [ratings]);

  const filteredRatings = useMemo(() => {
    if (ratingFilter === 0) return sortedRatings;
    return sortedRatings.filter((r) => Number(r.rating) === ratingFilter);
  }, [sortedRatings, ratingFilter]);

  const filterOptions = useMemo(() => {
    return [
      { label: `All (${ratings.length})`, value: 0 },
      ...[5, 4, 3, 2, 1].map((star) => ({
        label: `${star}★ (${distribution[star] || 0})`,
        value: star
      }))
    ];
  }, [ratings.length, distribution]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="mb-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <StarFilled className="text-yellow-500 text-3xl" />
            <div>
              <div className="flex items-baseline gap-2">
                <Title level={2} className="!m-0">{averageRating}</Title>
                <Text type="secondary">/ 5.0</Text>
              </div>
              <Rate allowHalf disabled value={averageRoundedHalf} />
              <div className="mt-1">
                <Text type="secondary">
                  {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
                </Text>
              </div>
            </div>
          </div>
          <div className="w-full md:max-w-md">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const percent = ratings.length ? Math.round((count / ratings.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <Text className="w-10 text-right">{star}★</Text>
                  <Progress className="flex-1" percent={percent} showInfo={false} />
                  <Text type="secondary" className="w-10 text-right">{count}</Text>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Create rating */}
      <Card className="mb-6 shadow-soft">
        <Title level={4}>Leave a rating</Title>
        {!user && (
          <Text type="secondary">Please log in to submit a rating.</Text>
        )}
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          onFinish={onCreate}
          disabled={!user || authLoading}
        >
          <Form.Item name="rating" label="Your rating" rules={[{ required: true, message: 'Please select a rating' }]}>
            <Rate allowClear defaultValue={0} tooltips={ratingTooltips} />
          </Form.Item>
          <Form.Item name="comment" label="Comment" rules={[{ max: 500, message: 'Max 500 characters' }]}>
            <Input.TextArea rows={4} placeholder="Share your thoughts..." allowClear showCount maxLength={500} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={!user}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Ratings list */}
      <Card className="shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 !mb-4">
          <Title level={4} className="!mb-0">Recent ratings</Title>
          <Segmented value={ratingFilter} onChange={setRatingFilter} options={filterOptions} />
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : filteredRatings.length === 0 ? (
          <Empty description="No ratings yet" />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={filteredRatings}
            split
            pagination={{ pageSize: 5, showSizeChanger: false }}
            renderItem={(item) => (
              <List.Item
                key={item._id}
                actions={canDelete(item) ? [
                  <Popconfirm
                    key="delete"
                    title="Delete rating"
                    description="Are you sure you want to delete this rating?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => onDelete(item._id)}
                  >
                    <Button danger type="text" icon={<DeleteOutlined />}>Delete</Button>
                  </Popconfirm>
                ] : []}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space direction="vertical" size={0}>
                      <Space size="small" wrap>
                        <Text strong>{item?.user?.fullname || item?.user?.email || 'User'}</Text>
                        {(user && item?.user?._id === user?._id) && <Tag color="blue">You</Tag>}
                      </Space>
                      <Rate disabled value={Number(item.rating) || 0} />
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      {item.comment && <Text className="whitespace-pre-line">{item.comment}</Text>}
                      <Text type="secondary">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default RatingPage;
