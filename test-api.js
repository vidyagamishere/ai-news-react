// Simple test to verify API connection works
const API_BASE_URL = 'https://ai-news-scraper.vercel.app';

async function testAPIConnection() {
  console.log('Testing API connection to:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Components:', Object.keys(healthData.components).filter(k => healthData.components[k]));
    
    // Test digest endpoint
    console.log('\n2. Testing digest endpoint...');
    const digestResponse = await fetch(`${API_BASE_URL}/api/digest`);
    const digestData = await digestResponse.json();
    console.log('✅ Digest loaded:', digestData.badge);
    console.log('   Articles:', digestData.content.blog.length);
    console.log('   Audio:', digestData.content.audio.length);
    console.log('   Videos:', digestData.content.video.length);
    console.log('   Total Updates:', digestData.summary.metrics.totalUpdates);
    
    // Test sources endpoint
    console.log('\n3. Testing sources endpoint...');
    const sourcesResponse = await fetch(`${API_BASE_URL}/api/sources`);
    const sourcesData = await sourcesResponse.json();
    console.log('✅ Sources loaded:', sourcesData.enabled_count, 'of', sourcesData.total_count);
    
    console.log('\n🎉 All API endpoints working correctly!');
    console.log('\nYour React frontend should work perfectly with this backend.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Backend is deployed and running');
    console.log('2. URL is correct:', API_BASE_URL);
    console.log('3. CORS is properly configured');
  }
}

// Run the test
testAPIConnection();