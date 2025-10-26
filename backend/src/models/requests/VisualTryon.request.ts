import { Request } from 'express'

export interface TryonOneStopReqBody {
  garment_image_url: string
  mode?: 'performance' | 'balanced' | 'quality'
  num_samples?: number
  output_format?: 'png' | 'jpeg'
  category?: 'auto' | 'tops' | 'bottoms' | 'one-pieces'
  segmentation_free?: boolean | string
  moderation_level?: 'conservative' | 'permissive' | 'none'
  garment_photo_type?: 'auto' | 'flat-lay' | 'model'
  seed?: number
}

export interface TryonOneStopRequest extends Request {
  file: Express.Multer.File
  body: TryonOneStopReqBody
}

// Legacy interface for backward compatibility
export interface AnalysysVisualTryonReqBody {
  file: Express.Multer.File
  garment_image_url: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     TryonOneStopReqBody:
 *       type: object
 *       required:
 *         - garment_image_url
 *       properties:
 *         garment_image_url:
 *           type: string
 *           description: URL của ảnh quần áo cần thử
 *           example: "https://example.com/garment.jpg"
 *         mode:
 *           type: string
 *           enum: [performance, balanced, quality]
 *           default: balanced
 *           description: Chế độ xử lý - ảnh hưởng đến tốc độ vs chất lượng
 *         num_samples:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           default: 1
 *           description: Số lượng ảnh kết quả được tạo
 *         output_format:
 *           type: string
 *           enum: [png, jpeg]
 *           default: jpeg
 *           description: Định dạng ảnh đầu ra
 *         category:
 *           type: string
 *           enum: [auto, tops, bottoms, one-pieces]
 *           default: auto
 *           description: Loại quần áo để tự động detect
 *         segmentation_free:
 *           type: boolean
 *           description: Fitting trực tiếp không cần phân đoạn quần áo
 *         moderation_level:
 *           type: string
 *           enum: [conservative, permissive, none]
 *           description: Mức độ kiểm duyệt nội dung
 *         garment_photo_type:
 *           type: string
 *           enum: [auto, flat-lay, model]
 *           default: auto
 *           description: Loại ảnh quần áo để tối ưu xử lý
 *         seed:
 *           type: integer
 *           minimum: 0
 *           maximum: 4294967295
 *           description: Random seed để có kết quả tái tạo được
 */
