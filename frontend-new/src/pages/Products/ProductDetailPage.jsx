import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const ProductDetailPage = () => {
  return (
    <div className="container-responsive py-8">
      <Result
        status="info"
        title="Chi tiết sản phẩm"
        subTitle="Trang này đang được phát triển. Sẽ sớm có thêm thông tin chi tiết về sản phẩm và tính năng thử đồ ảo."
        extra={
          <Link to="/products">
            <Button type="primary" size="large">
              Quay lại danh sách sản phẩm
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default ProductDetailPage;
