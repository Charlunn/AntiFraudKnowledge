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
try {
        // 设置测试用的认证token
        // 注意：这里只是模拟，实际应用中token来自登录
        document.cookie = `auth-token=${TEST_TOKEN}; path=/`;
// 测试发送消息
        const response = await sendMessage('你好，我想了解一下网络诈骗的防范方法');
if (response.data.reply) {
}
        
        if (response.data.score !== undefined) {
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
try {
        const response = await axios.post('http://localhost:8000/api/chat/', {
            message: '这是一个直接HTTP请求测试'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
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
try {
        // 测试后端服务器是否可访问
        const response = await axios.get('http://localhost:8000/api/chat/', {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
return true;
        
    } catch (error) {
        if (error.response && error.response.status === 405) {
            // Method Not Allowed 是正常的，说明服务器在运行
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
const results = [];
    
    // 测试API连通性
    results.push(await testAPIConnectivity());
    
    // 测试直接HTTP请求
    results.push(await testDirectHTTPRequest());
    
    // 测试前端API封装
    results.push(await testFrontendChatAPI());
    
    // 输出测试结果
const successCount = results.filter(r => r).length;
    const totalCount = results.length;
if (successCount === totalCount) {
} else {
}
    
    return successCount === totalCount;
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
    // 将测试函数暴露到全局作用域
    window.runFrontendAPITests = runTests;
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
}