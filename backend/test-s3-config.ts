import { config } from 'dotenv'
import s3Services from './src/services/s3.services'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

config()

// Test S3 configuration
async function testS3Configuration() {
  console.log('🔍 Testing S3 configuration...\n')

  try {
    // Check if all required environment variables are set
    const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME']

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:')
      missingVars.forEach((varName) => {
        console.error(`   - ${varName}`)
      })
      console.log('\n📝 Please check your .env file and ensure all AWS credentials are set.')
      return false
    }

    console.log('✅ All required environment variables are set')
    console.log(`   - Region: ${process.env.AWS_REGION}`)
    console.log(`   - Bucket: ${process.env.AWS_S3_BUCKET_NAME}\n`)

    // Test AWS credentials by listing buckets
    console.log('🔐 Testing AWS credentials...')
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })

    try {
      const command = new ListBucketsCommand({})
      const result = await s3Client.send(command)
      console.log('✅ AWS credentials are valid')
      console.log(`   - Found ${result.Buckets?.length || 0} buckets`)

      // Check if our specific bucket exists
      const ourBucket = result.Buckets?.find((bucket) => bucket.Name === process.env.AWS_S3_BUCKET_NAME)
      if (ourBucket) {
        console.log(`✅ Target bucket '${process.env.AWS_S3_BUCKET_NAME}' exists`)
      } else {
        console.log(`❌ Target bucket '${process.env.AWS_S3_BUCKET_NAME}' not found`)
        console.log('Available buckets:')
        result.Buckets?.forEach((bucket) => {
          console.log(`   - ${bucket.Name}`)
        })
        return false
      }
    } catch (credentialError) {
      console.error('❌ AWS credentials test failed:', (credentialError as Error).message)
      return false
    }

    // Test S3 service initialization
    console.log('\n🏗️ Testing S3 service initialization...')
    try {
      // This will test the constructor and validation
      console.log('✅ S3 service initialized successfully')

      // Test key generation
      const testKey = s3Services.generateImageKey('test-image.jpg')
      console.log(`✅ Generated test key: ${testKey}`)

      // Test URL generation
      const testUrl = await s3Services.getImageUrl(testKey)
      console.log(`✅ Generated test URL: ${testUrl}`)

      // Test key extraction from URL
      const extractedKey = s3Services.extractKeyFromUrl(testUrl)
      console.log(`✅ Extracted key from URL: ${extractedKey}`)

      console.log('\n🎉 S3 configuration test completed successfully!')
      console.log('💡 You can now use the image upload APIs.')
      return true
    } catch (serviceError) {
      console.error('❌ S3 service initialization failed:', (serviceError as Error).message)
      return false
    }
  } catch (error) {
    console.error('❌ Unexpected error during S3 configuration test:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testS3Configuration().catch((error) => {
    console.error('❌ Error running S3 configuration test:', error)
    process.exit(1)
  })
}
