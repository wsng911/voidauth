# voidauth Prompts

> 项目：voidauth/voidauth
> 技术栈：React + Vite 前端，Node.js + Knex + SQLite/PostgreSQL 后端，OIDC/OAuth2 SSO 认证

---

## 功能迭代

**1. 添加用户组管理功能**
在 voidauth 中添加用户组功能。管理员可以创建用户组，将用户分配到不同组，在 OIDC Token 的 claims 中包含用户组信息，下游应用可以基于用户组进行权限控制。

**2. 支持 LDAP/Active Directory 用户同步**
在 voidauth 中添加 LDAP 集成功能，支持从企业 LDAP/AD 目录同步用户账户。配置 LDAP 服务器地址和绑定凭据后，定期同步用户信息，支持 LDAP 用户直接登录 voidauth。

**3. 添加登录审计日志**
在 voidauth 中添加完整的登录审计日志功能，记录每次登录尝试（成功/失败）、登录时间、IP 地址、用户代理、使用的应用。管理员可以在后台查看和导出审计日志。

**4. 支持 WebAuthn/Passkey 无密码登录**
在 voidauth 中添加 WebAuthn 支持，允许用户注册硬件安全密钥（YubiKey）或设备生物识别（Touch ID/Face ID）作为登录方式，提供比 TOTP 更安全的无密码认证体验。

**5. 添加用户自助服务门户**
在 voidauth 中为普通用户添加自助服务门户，允许用户自行管理：修改密码、绑定/解绑 MFA 设备、查看已授权的应用列表、撤销特定应用的访问权限。

---

## Bug 修复

**6. 修复 OIDC Token 过期后应用无法自动刷新**
在 voidauth 中，当 OIDC Access Token 过期后，部分下游应用无法正确使用 Refresh Token 获取新的 Access Token，导致用户被强制重新登录。请检查 Token 刷新端点的实现，确保符合 OIDC 规范。

**7. 修复多设备同时登录时 Session 冲突**
在 voidauth 中，同一用户在多个设备同时登录时，某些操作（如修改密码）会导致其他设备的 Session 状态不一致。请实现 Session 失效广播机制，确保密码修改后所有设备的 Session 同步失效。

**8. 修复 SQLite 并发写入时数据库锁定**
在 voidauth 使用 SQLite 模式时，高并发登录请求会导致数据库锁定错误（SQLITE_BUSY）。请配置 SQLite 的 WAL 模式和适当的超时时间，减少并发写入冲突。

**9. 修复邮件验证链接在某些邮件客户端中被截断**
在 voidauth 发送的邮件验证链接中，URL 过长导致在部分邮件客户端（如 Outlook）中被自动换行截断，用户点击后跳转失败。请将验证 Token 缩短，或使用短链接服务。

**10. 修复管理员重置用户密码后用户无法登录**
在 voidauth 中，管理员通过后台重置用户密码后，用户使用新密码登录时提示密码错误。请检查密码重置流程中的哈希算法配置，确保与登录验证使用相同的 bcrypt 参数。

---

## 重构

**11. 将认证中间件统一为可复用模块**
voidauth 的认证检查逻辑分散在多个路由处理函数中。请将 Session 验证、权限检查、CSRF 防护等逻辑提取为统一的中间件模块，通过 Express 中间件链组合使用。

**12. 将数据库迁移管理规范化**
voidauth 使用 Knex 管理数据库迁移，但迁移文件命名和版本管理不够规范。请建立迁移文件命名规范（时间戳前缀）、添加迁移回滚测试、在 CI 中验证迁移的幂等性。

---

## 测试

**13. 为 OIDC 授权流程编写集成测试**
使用 Supertest 为 voidauth 的 OIDC 授权端点编写集成测试，覆盖：授权码流程（Authorization Code Flow）、Token 端点、UserInfo 端点、Token 刷新、Token 撤销。

**14. 为用户管理 API 编写集成测试**
为 voidauth 的用户管理 API 编写集成测试，覆盖：创建用户、获取用户列表、更新用户信息、重置密码、禁用/启用用户、删除用户。使用内存 SQLite 数据库隔离测试。

**15. 为 MFA 验证逻辑编写单元测试**
为 voidauth 的 TOTP MFA 验证逻辑编写单元测试，覆盖：TOTP 码生成和验证、时间窗口容错（前后 30 秒）、重放攻击防护（已使用的 TOTP 码不能重复使用）。

---

## 代码理解

**16. 解释 voidauth 的 OIDC 实现架构**
在 voidauth 中，OIDC Provider 是如何实现的？使用了哪个 OIDC 库？Authorization Code Flow 的完整流程是怎样的？如何配置下游应用（Client）？Token 的签名算法是什么？

**17. 解释 voidauth 的多数据库支持设计**
在 voidauth 中，如何通过 `DB_ADAPTER` 环境变量切换 SQLite 和 PostgreSQL？Knex 的抽象层如何屏蔽两种数据库的差异？迁移文件是否同时兼容两种数据库？

---

## DevOps

**18. 编写 GitHub Actions 多架构构建流水线**
为 voidauth 编写 `.github/workflows/docker-build.yml`，实现推送 main 分支时自动构建多架构（amd64/arm64）Docker 镜像并推送到 Docker Hub，分别缓存前端和后端的 npm 依赖。

**19. 编写 docker-compose.yml 生产部署配置**
为 voidauth 编写 `docker-compose.yml`，包含：voidauth 服务（映射 3000 端口）、配置目录挂载（`./config:/app/config`）、数据目录挂载（`./db:/app/db`）、环境变量配置（DB_ADAPTER、邮件服务）、健康检查。

**20. 编写 voidauth 与 Nginx 反向代理的集成配置**
为 voidauth 编写 Nginx 反向代理配置，包含：HTTPS 终止（Let's Encrypt）、WebSocket 代理支持、正确的 `X-Forwarded-*` 请求头传递（OIDC 回调 URL 依赖这些头）、安全响应头配置。

---

## 构建与截图命令

**构建截图：**
```bash
cd /path/to/voidauth && docker build -t voidauth-test .
```

**网页截图：**
```bash
docker run -d -p 3000:3000 -e DB_ADAPTER=sqlite --name voidauth-test voidauth-test && sleep 5 && open http://localhost:3000
```

**清理：**
```bash
docker rm -f voidauth-test && docker rmi voidauth-test
```
