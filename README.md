# Public APIs MCP Server

一个基于 Model Context Protocol (MCP) 的公共 API 服务器，提供对 [public-apis](https://github.com/public-apis/public-apis) 数据库的智能访问和管理功能。

## 🚀 项目简介

Public APIs MCP Server 是一个专业的 MCP 服务器实现，旨在为开发者提供便捷的公共 API 发现、搜索和集成服务。通过标准化的 MCP 协议，您可以轻松地在各种 AI 助手和开发工具中集成丰富的公共 API 资源。

### 核心特性

- 🔍 **智能搜索**: 支持按分类、关键词、认证方式等多维度搜索 API
- 🛡️ **安全筛选**: 提供 HTTPS 支持、CORS 配置等安全性筛选
- 🎯 **智能推荐**: 基于项目需求智能推荐最适合的 API
- 💻 **代码生成**: 自动生成多种编程语言的 API 集成代码
- 📊 **统计分析**: 提供详细的 API 数据统计和分析
- 🔄 **实时同步**: 支持从 GitHub 仓库同步最新的 API 数据

## 📦 安装

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 快速安装

```bash
# 克隆项目
git clone https://github.com/worryzyy/public-apis-mcp.git
cd public-apis-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务器
npm start
```

### 开发模式

```bash
# 开发模式启动（支持热重载）
npm run dev
```

## 🛠️ 使用方法

### 基本配置

服务器启动后，会通过标准输入/输出与 MCP 客户端进行通信。您可以在支持 MCP 协议的 AI 助手或开发工具中配置此服务器。

### MCP 客户端配置示例

```json
{
	"mcpServers": {
		"public-apis-mcp": {
			"command": "node",
			"args": ["path/to/public-apis-mcp/dist/index.js"]
		}
	}
}
```

或者

```json
{
	"mcpServers": {
		"public-apis-mcp": {
			"command": "npx",
			"args": ["-y", "public-apis-mcp"]
		}
	}
}
```

## 🔧 可用工具

### API 搜索和发现

#### `search_apis_by_category`

根据分类搜索 API

**参数:**

- `category` (string, 必需): API 分类名称
- `limit` (number, 可选): 返回结果数量限制，默认 10

**示例:**

```javascript
{
  "category": "Weather",
  "limit": 5
}
```

#### `search_apis_by_keyword`

通过关键词搜索 API

**参数:**

- `keyword` (string, 必需): 搜索关键词
- `limit` (number, 可选): 返回结果数量限制，默认 10

#### `filter_apis_by_auth`

根据认证要求筛选 API

**参数:**

- `authType` (string, 必需): 认证类型 (`No`, `apiKey`, `OAuth`, `X-Mashape-Key`, `User-Agent`)
- `limit` (number, 可选): 返回结果数量限制，默认 10

#### `filter_apis_by_https`

筛选支持 HTTPS 的 API

**参数:**

- `httpsOnly` (boolean, 可选): 是否只返回支持 HTTPS 的 API，默认 true
- `limit` (number, 可选): 返回结果数量限制，默认 10

#### `filter_apis_by_cors`

筛选支持跨域访问的 API

**参数:**

- `corsSupport` (string, 必需): CORS 支持状态 (`yes`, `no`, `unknown`)
- `limit` (number, 可选): 返回结果数量限制，默认 10

### API 详情和统计

#### `get_api_details`

获取特定 API 的详细信息

**参数:**

- `apiName` (string, 必需): API 名称

#### `get_category_list`

获取所有可用的 API 分类列表

#### `get_random_api`

随机推荐一个 API

**参数:**

- `category` (string, 可选): 限制在特定分类内随机选择

#### `get_api_statistics`

获取 API 数量统计信息

#### `analyze_auth_requirements`

分析不同认证方式的 API 分布

### 智能推荐

#### `recommend_apis_for_project`

根据项目需求推荐合适的 API

**参数:**

- `projectType` (string, 必需): 项目类型描述
- `requirements` (array, 可选): 项目需求列表
- `limit` (number, 可选): 推荐 API 数量限制，默认 5

#### `find_alternative_apis`

寻找替代 API 选项

**参数:**

- `functionality` (string, 必需): 所需功能描述
- `limit` (number, 可选): 返回结果数量限制，默认 5

### 代码生成

#### `generate_api_integration_code`

为选定的 API 生成集成代码示例

**参数:**

- `apiName` (string, 必需): API 名称
- `language` (string, 可选): 编程语言 (`javascript`, `python`, `curl`)，默认 javascript

### 数据管理

#### `sync_repository_data`

从 GitHub 仓库同步最新的 API 列表

> **重要说明**: 此接口目前采用手动同步机制，将 [public-apis](https://github.com/public-apis/public-apis) 仓库的最新数据同步到本地服务器。这种设计确保了数据的稳定性和访问速度，避免了频繁请求 GitHub API 可能导致的限流问题。

**工作原理:**

- 手动触发从 GitHub 仓库拉取最新的 API 数据
- 将数据缓存到本地服务器，提高查询性能
- 支持增量更新和强制全量同步两种模式
- 同步完成后会返回详细的同步状态报告

**参数:**

- `force` (boolean, 可选): 是否强制重新同步，默认 false
  - `false`: 仅在数据过期时进行增量同步
  - `true`: 强制进行全量数据同步，忽略本地缓存

**使用建议:**

- 建议在首次使用前执行一次强制同步 (`force: true`)
- 日常使用中可定期执行增量同步以获取最新数据
- 如发现数据异常，可使用强制同步重置本地缓存

#### `check_new_apis`

检查最近添加的新 API

**参数:**

- `days` (number, 可选): 检查最近几天的新增 API，默认 7 天

## 📁 项目结构

```
public-apis-mcp/
├── src/
│   ├── index.ts                    # 主入口文件
│   ├── server/
│   │   └── server.ts              # MCP服务器实现
│   ├── services/
│   │   ├── api-service.ts         # API数据管理服务
│   │   ├── search-service.ts      # 搜索功能服务
│   │   ├── tool-service.ts        # 工具调用处理服务
│   │   ├── code-generation-service.ts  # 代码生成服务
│   │   ├── recommendation-service.ts   # 推荐算法服务
│   │   └── formatter-service.ts   # 数据格式化服务
│   └── types/
│       └── api.ts                 # TypeScript类型定义
├── dist/                          # 编译输出目录
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript配置
└── README.md                      # 项目文档
```

## 🔧 开发

### 技术栈

- **TypeScript**: 类型安全的 JavaScript 超集
- **Node.js**: JavaScript 运行时环境
- **MCP SDK**: Model Context Protocol 软件开发工具包
- **Axios**: HTTP 客户端库
- **Zod**: TypeScript 优先的模式验证库

### 构建和测试

```bash
# 编译TypeScript
npm run build

# 运行测试
npm test

# 开发模式（热重载）
npm run dev
```

### 代码规范

项目遵循以下开发规范：

- 使用 TypeScript 进行类型安全开发
- 采用模块化架构设计
- 完善的错误处理机制
- 详细的代码注释和文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献流程

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [public-apis](https://github.com/public-apis/public-apis) - 提供丰富的公共 API 数据源

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/worryzyy/public-apis-mcp/issues)

---

**注意**: 本项目仍在积极开发中，API 可能会发生变化。建议在生产环境使用前仔细测试。
