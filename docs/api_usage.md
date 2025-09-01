# 前端接口调用说明

本项目提供一组基于 Axios 的工具函数，封装于 `frontend/api/` 目录，可直接在新的前端页面中引入使用。

## 示例

```javascript
import { login, fetchProfile } from '@/api/auth';

async function example() {
  const { data } = await login('testuser', 'password');
  const profile = await fetchProfile();
  console.log(profile.data);
}
```

### 可用模块

- `api/auth.js`：注册、登录、个人资料、绑定邮箱/手机号、设置、密码修改等
- `api/achievements.js`：获取和授予成就
- `api/feedback.js`：提交反馈及附件
- `api/chat.js`：AI 反诈聊天接口
- `api/quiz.js`：题目获取与答案提交

所有函数均返回 Axios Promise，可结合 `async/await` 使用。
