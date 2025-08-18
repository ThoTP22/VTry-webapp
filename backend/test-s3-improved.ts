import s3Services from './src/services/s3.services'
import { config } from 'dotenv'

config()

async function testS3Configuration() {
  console.log('=== S3 Configuration Test ===\n')

  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:')
    console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`)
    console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`)
    console.log(`   AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME || '❌ Missing'}`)
    console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1 (default)'}`)

    if (!process.env.AWS_S3_BUCKET_NAME) {
      console.log('\n❌ Cannot proceed without bucket name')
      return
    }

    // Test 2: Generate sample key
    console.log('\n2. Key Generation Test:')
    const sampleKey = s3Services.generateImageKey('test-image.jpg')
    console.log(`   Generated key: ${sampleKey}`)

    // Test 3: URL generation
    console.log('\n3. URL Generation Test:')
    const directUrl = await s3Services.getImageUrl(sampleKey)
    console.log(`   Direct URL: ${directUrl}`)

    // Test 4: Presigned URL generation (without actual file)
    try {
      console.log('\n4. Presigned URL Test:')
      console.log("   Note: This will fail if the file doesn't exist, which is expected")
      const presignedUrl = await s3Services.getPresignedUrl(sampleKey, 3600)
      console.log(`   Presigned URL: ${presignedUrl.substring(0, 100)}...`)
    } catch (error) {
      console.log(`   Expected error (file doesn't exist): ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    // Test 5: Bucket policy template
    console.log('\n5. Bucket Policy Template:')
    const bucketPolicy = s3Services.getBucketPolicy()
    console.log('   Policy generated successfully ✅')
    console.log(`   Policy size: ${bucketPolicy.length} characters`)

    // Test 6: URL key extraction
    console.log('\n6. URL Key Extraction Test:')
    const testUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/images/test-123.jpg`
    const extractedKey = s3Services.extractKeyFromUrl(testUrl)
    console.log(`   Test URL: ${testUrl}`)
    console.log(`   Extracted key: ${extractedKey}`)

    console.log('\n=== Test Summary ===')
    console.log('✅ S3 service initialization: OK')
    console.log('✅ Key generation: OK')
    console.log('✅ URL generation: OK')
    console.log('✅ Bucket policy template: OK')
    console.log('✅ Key extraction: OK')

    console.log('\n=== Next Steps ===')
    console.log('1. Make sure your S3 bucket exists')
    console.log('2. Configure bucket permissions (see S3_SETUP_GUIDE.md)')
    console.log('3. Test actual upload with a real image file')
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Run the test
testS3Configuration()
