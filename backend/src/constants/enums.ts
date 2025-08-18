export enum UserVerificationStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Refunded = 'refunded'
}

export enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
  Expired = 'expired'
}

export enum PaymentMethod {
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  PayPal = 'paypal',
  BankTransfer = 'bank_transfer',
  CashOnDelivery = 'cash_on_delivery',
  PayOS = 'payos'
}

export enum VisualTryOnCategory {
  Auto = 'auto',
  Tops = 'tops',
  Bottoms = 'bottoms',
  OnePieces = 'one-pieces'
}

export enum VisualTryOnMode {
  Performance = 'performance',
  Balanced = 'balanced',
  Quality = 'quality'
}

export enum VisualTryOnModerationLevel {
  Conservative = 'conservative',
  Permissive = 'permissive',
  None = 'none'
}

export enum VisualTryOnGarmentPhotoType {
  Auto = 'auto',
  FlatLay = 'flat-lay',
  Model = 'model'
}

export enum VisualTryOnOutputFormat {
  PNG = 'png',
  JPEG = 'jpeg'
}

export enum VisualTryOnStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed'
}

export enum VisualTryOnErrorType {
  ImageLoadError = 'ImageLoadError',
  ContentModerationError = 'ContentModerationError',
  PoseError = 'PoseError',
  PipelineError = 'PipelineError',
  ThirdPartyError = 'ThirdPartyError'
}
