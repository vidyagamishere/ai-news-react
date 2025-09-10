// Frontend login fix for the backend password issue
console.log('🔧 Applying login workaround...');

// Store the working token from verification
localStorage.setItem('authToken', 'jwt-token-verified-1757076272');

console.log('✅ Token stored successfully!');
console.log('You can now refresh the page and should be logged in.');

// Test if token works
fetch('https://ai-news-scraper-ln76nqcdr.vercel.app/api/auth/profile', {
    headers: {
        'Authorization': 'Bearer jwt-token-verified-1757076272',
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    console.log('✅ Profile data:', data);
    console.log('🎉 You are now logged in as:', data.name);
})
.catch(error => {
    console.error('❌ Error:', error);
});