/**
 * 前端API测试脚本
 * 测试前端聊天API调用功能
 */

import { sendMessage } from './api/chat.js';
import axios from 'axios';

// 模拟认证token（实际使用中应该从登录获取）
const TEST_TOKEN = 'test-token-123';

/**
 * 测试前端聊天API调用
 */
async function testFrontendChatAPI() {
    console.log('=== 测试前端聊天API调用 ===');
    
    try {
        // 设置测试用的认证token
        // 注意：这里只是模拟，实际应用中token来自登录
        document.cookie = `auth-token=${TEST_TOKEN}; path=/`;
        
        console.log('正在发送测试消息...');
        
        // 测试发送消息
        const response = await sendMessage('你好，我想了解一下网络诈骗的防范方法');
        
        console.log('✅ 前端API调用成功');
        console.log('响应数据:', response.data);
        
        if (response.data.reply) {
            console.log('AI回复:', response.data.reply.substring(0, 100) + '...');
        }
        
        if (response.data.score !== undefined) {
            console.log('风险评分:', response.data.score);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 前端API调用失败:', error.message);
        
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
        
        return false;
    }
}

/**
 * 测试直接HTTP请求（不通过前端API封装）
 */
async function testDirectHTTPRequest() {
    console.log('\n=== 测试直接HTTP请求 ===');
    
    try {
        const response = await axios.post('http://localhost:8000/api/chat/', {
            message: '这是一个直接HTTP请求测试'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('✅ 直接HTTP请求成功');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        return true;
        
    } catch (error) {
        console.error('❌ 直接HTTP请求失败:', error.message);
        
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
        
        return false;
    }
}

/**
 * 测试API连通性
 */
async function testAPIConnectivity() {
    console.log('\n=== 测试API连通性 ===');
    
    try {
        // 测试后端服务器是否可访问
        const response = await axios.get('http://localhost:8000/api/chat/', {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('✅ 后端服务器可访问');
        return true;
        
    } catch (error) {
        if (error.response && error.response.status === 405) {
            // Method Not Allowed 是正常的，说明服务器在运行
            console.log('✅ 后端服务器可访问（GET方法不被允许，这是正常的）');
            return true;
        }
        
        console.error('❌ 后端服务器连接失败:', error.message);
        return false;
    }
}

/**
 * 主测试函数
 */
async function runTests() {
    console.log('开始前端API测试...\n');
    
    const results = [];
    
    // 测试API连通性
    results.push(await testAPIConnectivity());
    
    // 测试直接HTTP请求
    results.push(await testDirectHTTPRequest());
    
    // 测试前端API封装
    results.push(await testFrontendChatAPI());
    
    // 输出测试结果
    console.log('\n=== 测试结果汇总 ===');
    console.log(`API连通性测试: ${results[0] ? '✅ 通过' : '❌ 失败'}`);
    console.log(`直接HTTP请求测试: ${results[1] ? '✅ 通过' : '❌ 失败'}`);
    console.log(`前端API封装测试: ${results[2] ? '✅ 通过' : '❌ 失败'}`);
    
    const successCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    console.log(`\n总体结果: ${successCount}/${totalCount} 项测试通过`);
    
    if (successCount === totalCount) {
        console.log('🎉 所有前端API测试通过！');
    } else {
        console.log('⚠️ 部分测试失败，请检查配置');
    }
    
    return successCount === totalCount;
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
    // 将测试函数暴露到全局作用域
    window.runFrontendAPITests = runTests;
    console.log('前端API测试函数已加载，请在浏览器控制台中运行: runFrontendAPITests()');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
}