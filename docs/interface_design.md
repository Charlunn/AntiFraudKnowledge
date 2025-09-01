# 接口设计

## 1. 用户系统
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应示例 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| 用户注册 | POST | `/api/users/register/` | 否 | `{username, nickname, password, password2}` | `{"message": "User registered successfully"}` |
| 用户登录 | POST | `/api/users/login/` | 否 | `{account_or_email_or_phone, password}` | `{"refresh": "", "access": ""}` |
| 刷新令牌 | POST | `/api/users/token/refresh/` | 否 | `{refresh}` | `{"access": ""}` |
| 验证令牌 | POST | `/api/users/token/verify/` | 否 | `{token}` | 无内容，200 表示有效 |
| 获取/更新个人信息 | GET/PUT | `/api/users/profile/` | 是 | `GET` 无；`PUT` 提交要更新的字段 | 返回用户信息，包括 `avatar`、`nickname`、`fraud_level` 等 |
| 修改密码 | PUT | `/api/users/change-password/` | 是 | `{old_password, new_password}` | `{"message": "Password updated successfully"}` |
| 注销登录 | POST | `/api/users/logout/` | 是 | `{refresh_token}` | `{"message": "Logout successful"}` |
| 删除账户 | DELETE | `/api/users/delete-account/` | 是 | 无 | 204 无内容 |

## 2. 知识图谱 API
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 初始图谱 | GET | `/api/graph/initial/` | 否 | 无 | 图谱节点和关系数据 |
| 条件筛选图谱 | POST | `/api/graph/filtered/` | 否 | 筛选条件 | 过滤后的图谱数据 |
| 节点详情 | GET | `/api/graph/nodes/{node_id}/` | 否 | 路径参数 `node_id` | 指定节点的详情 |

## 3. 成就系统（待实现）
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 获取成就列表 | GET | `/api/achievements/` | 是 | 无 | 用户成就及达成时间、达成率 |

## 4. 设置与反馈（待实现）
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 更新界面设置 | PUT | `/api/settings/` | 是 | `{language, theme}` | `{"message": "Settings updated"}` |
| 反馈提交 | POST | `/api/feedback/` | 否 | `{content, images, contact}` | `{"message": "Feedback received"}` |

## 5. AI 反诈测试（待实现）
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 与 AI 对话 | POST | `/api/chat/` | 是 | `{message}` | `{reply, evaluation}` |

## 6. 反诈闯关（待实现）
| 功能 | 方法 | 路径 | 认证 | 请求参数 | 响应 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 获取题目 | GET | `/api/quiz/questions/` | 是 | `?level=` | 题目列表 |
| 提交答案 | POST | `/api/quiz/submit/` | 是 | `{question_id, answer}` | `{correct, score}` |

