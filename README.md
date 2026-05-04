# VoidAuth

自托管单点登录（SSO）和 OIDC 认证服务。

## 功能特性

- OIDC Provider
- 多应用 SSO
- 用户管理
- MFA 支持
- SQLite 存储（无需外部数据库）
- 中文界面

## 快速部署

```bash
docker run -d -p 3000:3000 -e DB_ADAPTER=sqlite -v $(pwd)/db:/app/db --name voidauth wsng911/voidauth:latest
```

访问 `http://localhost:3000`
