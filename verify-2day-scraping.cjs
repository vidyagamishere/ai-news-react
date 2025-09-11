#!/usr/bin/env node

/**
 * Script to verify 2-day content scraping configuration
 * This script tests the API endpoints to confirm content filtering is working
 */

const axios = require('axios');

const API_BASE = process.env.VITE_API_BASE || 'https://ai-news-scraper-m286ri1yf.vercel.app';

async function verifyScrapingDays() {
    console.log('🔍 Verifying 2-day content scraping configuration...\n');

    try {
        // Test 1: Check default digest endpoint
        console.log('1️⃣ Testing default digest endpoint...');
        const defaultResponse = await axios.get(`${API_BASE}/api/digest`);
        const defaultData = defaultResponse.data;
        
        console.log(`   📊 Scraping Days from API: ${defaultData.summary?.metrics?.scrapingDays || 'Not found'}`);
        console.log(`   📰 Total Articles: ${defaultData.summary?.metrics?.totalUpdates || 0}`);
        console.log(`   🔄 Sources Scraped: ${defaultData.summary?.metrics?.sourcesScraped || 0}`);

        // Test 2: Check digest with explicit 2-day parameter
        console.log('\n2️⃣ Testing digest with days=2 parameter...');
        const twoDayResponse = await axios.get(`${API_BASE}/api/digest?days=2`);
        const twoDayData = twoDayResponse.data;
        
        console.log(`   📊 Scraping Days: ${twoDayData.summary?.metrics?.scrapingDays || 'Not found'}`);
        console.log(`   📰 Total Articles: ${twoDayData.summary?.metrics?.totalUpdates || 0}`);

        // Test 3: Analyze article timestamps
        console.log('\n3️⃣ Analyzing article timestamps...');
        const articles = [
            ...(twoDayData.topStories || []),
            ...(twoDayData.content?.blog || []),
            ...(twoDayData.content?.audio || []),
            ...(twoDayData.content?.video || [])
        ];

        if (articles.length > 0) {
            const now = new Date();
            const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
            
            let articlesWithinTwoDays = 0;
            let articlesOlderThanTwoDays = 0;
            let articlesWithTimestamps = 0;

            articles.forEach((article, index) => {
                if (article.published_date) {
                    articlesWithTimestamps++;
                    const publishedDate = new Date(article.published_date);
                    
                    if (index < 5) { // Show first 5 articles for verification
                        console.log(`   📅 Article ${index + 1}: "${article.title?.substring(0, 50)}..." - ${publishedDate.toLocaleDateString()}`);
                    }
                    
                    if (publishedDate >= twoDaysAgo) {
                        articlesWithinTwoDays++;
                    } else {
                        articlesOlderThanTwoDays++;
                    }
                } else if (article.time) {
                    console.log(`   📅 Article ${index + 1}: "${article.title?.substring(0, 50)}..." - ${article.time}`);
                }
            });

            console.log(`\n   ✅ Articles within 2 days: ${articlesWithinTwoDays}`);
            console.log(`   ❌ Articles older than 2 days: ${articlesOlderThanTwoDays}`);
            console.log(`   📊 Articles with timestamps: ${articlesWithTimestamps}/${articles.length}`);

            // Verification result
            if (articlesOlderThanTwoDays === 0 && articlesWithinTwoDays > 0) {
                console.log('\n🎉 ✅ 2-DAY FILTERING IS WORKING CORRECTLY!');
            } else if (articlesOlderThanTwoDays > 0) {
                console.log('\n⚠️  ❌ Found articles older than 2 days - filtering may not be working');
            } else {
                console.log('\n🤔 ⚠️  Unable to determine filtering status (no timestamped articles)');
            }
        } else {
            console.log('   ⚠️  No articles found to analyze');
        }

        // Test 4: Compare with 7-day scraping
        console.log('\n4️⃣ Comparing with 7-day scraping...');
        const sevenDayResponse = await axios.get(`${API_BASE}/api/digest?days=7`);
        const sevenDayData = sevenDayResponse.data;
        
        const twoDayArticleCount = twoDayData.summary?.metrics?.totalUpdates || 0;
        const sevenDayArticleCount = sevenDayData.summary?.metrics?.totalUpdates || 0;
        
        console.log(`   📰 2-day scraping: ${twoDayArticleCount} articles`);
        console.log(`   📰 7-day scraping: ${sevenDayArticleCount} articles`);
        
        if (twoDayArticleCount <= sevenDayArticleCount) {
            console.log('   ✅ 2-day scraping returns fewer or equal articles (expected)');
        } else {
            console.log('   ⚠️  2-day scraping returns more articles than 7-day (unexpected)');
        }

        // Test 5: Check environment configuration
        console.log('\n5️⃣ Environment configuration check...');
        console.log(`   🔧 API Base URL: ${API_BASE}`);
        
        if (defaultData.summary?.metrics?.scrapingDays === 2) {
            console.log('   ✅ Environment variable CONTENT_SCRAPING_DAYS is set to 2');
        } else {
            console.log('   ⚠️  Environment variable CONTENT_SCRAPING_DAYS is not set to 2');
            console.log('   💡 To fix: Set CONTENT_SCRAPING_DAYS=2 in your Vercel environment variables');
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Additional utility functions for manual verification
function printVerificationInstructions() {
    console.log('\n📋 MANUAL VERIFICATION METHODS:');
    console.log('1. Check Vercel environment variables:');
    console.log('   - Go to Vercel dashboard > Project > Settings > Environment Variables');
    console.log('   - Ensure CONTENT_SCRAPING_DAYS is set to "2"');
    console.log('');
    console.log('2. Test API endpoints manually:');
    console.log(`   - ${API_BASE}/api/digest (default configuration)`);
    console.log(`   - ${API_BASE}/api/digest?days=2 (explicit 2-day filter)`);
    console.log(`   - ${API_BASE}/api/digest?days=7 (7-day comparison)`);
    console.log('');
    console.log('3. Look for these indicators:');
    console.log('   - summary.metrics.scrapingDays should be 2');
    console.log('   - Article published_date should be within last 2 days');
    console.log('   - Total article count should be lower than 7-day scraping');
    console.log('');
    console.log('4. Archive verification:');
    console.log(`   - ${API_BASE}/api/archive/stats (check archive settings)`);
    console.log(`   - ${API_BASE}/api/archive/settings (view current configuration)`);
}

// Run the verification
verifyScrapingDays().then(() => {
    printVerificationInstructions();
}).catch(console.error);