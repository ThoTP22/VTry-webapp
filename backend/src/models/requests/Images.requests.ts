export interface DeleteImageByUrlReqBody {
  url: string
}

export interface UploadImageResponse {
  url: string
  key: string
  originalName: string
  size: number
  mimeType: string
}

export interface UploadMultipleImagesResponse {
  images: UploadImageResponse[]
}
