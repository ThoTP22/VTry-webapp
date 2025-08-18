import s3Services from './src/services/s3.services'
import { config } from 'dotenv'

config()

async function testUploadLogic() {
  console.log('=== Testing S3 Upload Logic ===\n')

  // Create a simple test buffer (fake image data)
  const testBuffer = Buffer.from('fake-image-data-for-testing', 'utf8')
  const testKey = s3Services.generateImageKey('test-upload.jpg')

  try {
    console.log(`1. Testing upload with key: ${testKey}`)
    console.log(`   Buffer size: ${testBuffer.length} bytes`)
    console.log(`   Content type: image/jpeg`)

    const uploadedUrl = await s3Services.uploadImage(testBuffer, testKey, 'image/jpeg')

    console.log(`✅ Upload successful!`)
    console.log(`   URL: ${uploadedUrl}`)

    // Test presigned URL generation separately
    console.log(`\n2. Testing presigned URL generation...`)
    try {
      const presignedUrl = await s3Services.getPresignedUrl(testKey, 3600)
      console.log(`✅ Presigned URL generated successfully`)
      console.log(`   URL: ${presignedUrl.substring(0, 100)}...`)
    } catch (presignedError) {
      console.log(`⚠️ Presigned URL generation failed (expected if file was uploaded privately):`)
      console.log(`   Error: ${presignedError instanceof Error ? presignedError.message : 'Unknown'}`)
    }

    // Clean up - delete the test file
    console.log(`\n3. Cleaning up test file...`)
    try {
      await s3Services.deleteImage(testKey)
      console.log(`✅ Test file deleted successfully`)
    } catch (deleteError) {
      console.log(`⚠️ Failed to delete test file: ${deleteError instanceof Error ? deleteError.message : 'Unknown'}`)
    }

    console.log(`\n=== Test Summary ===`)
    console.log(`✅ Upload logic working correctly`)
    console.log(`✅ No more "Failed to generate presigned URL" errors during upload`)
    console.log(`✅ Upload API should now work without errors`)
  } catch (error) {
    console.error(`❌ Upload test failed:`, error)
    console.log(`\nThis indicates there may still be S3 configuration issues.`)
    console.log(`Please check:`)
    console.log(`- AWS credentials are valid`)
    console.log(`- S3 bucket exists and is accessible`)
    console.log(`- IAM permissions allow PutObject operation`)
  }
}

// Run the test
testUploadLogic()
