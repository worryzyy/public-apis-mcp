import { APIEntry, APIData, APIDatabase, ToolResponse } from '../types/api.js'
import { ApiService } from './api-service.js'
import { FormatterService } from './formatter-service.js'

/**
 * API 搜索服务类
 * 负责各种 API 搜索和筛选功能
 */
export class SearchService {
	private apiService: ApiService
	private formatterService: FormatterService

	constructor(apiService: ApiService, formatterService: FormatterService) {
		this.apiService = apiService
		this.formatterService = formatterService
	}

	/**
	 * 按分类搜索API
	 */
	public async searchAPIsByCategory(
		category: string,
		limit: number
	): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const categoryData = apiDatabase[category]

		if (!categoryData) {
			// 模糊匹配分类名称
			const availableCategories = Object.keys(apiDatabase)
			const matchedCategory = availableCategories.find((cat) =>
				cat.toLowerCase().includes(category.toLowerCase())
			)

			if (matchedCategory) {
				const results = apiDatabase[matchedCategory].entries.slice(0, limit)
				return {
					content: [
						{
							type: 'text',
							text:
								`找到分类 "${matchedCategory}"，共 ${apiDatabase[matchedCategory].count} 个API：\n\n` +
								results
									.map((api) => this.formatterService.formatAPIEntry(api))
									.join('\n\n')
						}
					]
				}
			}

			return {
				content: [
					{
						type: 'text',
						text: `未找到分类 "${category}"。可用分类：${availableCategories.join(
							', '
						)}`
					}
				]
			}
		}

		const results = categoryData.entries.slice(0, limit)
		return {
			content: [
				{
					type: 'text',
					text:
						`${category} 分类中的API（显示前${limit}个，共${categoryData.count}个）：\n\n` +
						results
							.map((api) => this.formatterService.formatAPIEntry(api))
							.join('\n\n')
				}
			]
		}
	}

	/**
	 * 按关键词搜索API
	 */
	public async searchAPIsByKeyword(
		keyword: string,
		limit: number
	): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const results: APIEntry[] = []
		const searchTerm = keyword.toLowerCase()

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				if (
					api.API.toLowerCase().includes(searchTerm) ||
					api.Description.toLowerCase().includes(searchTerm)
				) {
					results.push(api)
					if (results.length >= limit) break
				}
			}
			if (results.length >= limit) break
		}

		if (results.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: `未找到包含关键词 "${keyword}" 的API`
					}
				]
			}
		}

		return {
			content: [
				{
					type: 'text',
					text:
						`包含关键词 "${keyword}" 的API（共找到${results.length}个）：\n\n` +
						results
							.map((api) => this.formatterService.formatAPIEntry(api))
							.join('\n\n')
				}
			]
		}
	}

	/**
	 * 按认证类型筛选API
	 */
	public async filterAPIsByAuth(
		authType: string,
		limit: number
	): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const results: APIEntry[] = []

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				if (api.Auth.toLowerCase() === authType.toLowerCase()) {
					results.push(api)
					if (results.length >= limit) break
				}
			}
			if (results.length >= limit) break
		}

		if (results.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: `未找到认证类型为 "${authType}" 的API`
					}
				]
			}
		}

		return {
			content: [
				{
					type: 'text',
					text:
						`认证类型为 "${authType}" 的API（共找到${results.length}个）：\n\n` +
						results
							.map((api) => this.formatterService.formatAPIEntry(api))
							.join('\n\n')
				}
			]
		}
	}

	/**
	 * 按HTTPS支持筛选API
	 */
	public async filterAPIsByHTTPS(
		httpsOnly: boolean,
		limit: number
	): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const results: APIEntry[] = []

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				if (api.HTTPS === httpsOnly) {
					results.push(api)
					if (results.length >= limit) break
				}
			}
			if (results.length >= limit) break
		}

		const httpsStatus = httpsOnly ? '支持' : '不支持'

		return {
			content: [
				{
					type: 'text',
					text:
						`${httpsStatus} HTTPS 的API（显示前${limit}个）：\n\n` +
						results
							.map((api) => this.formatterService.formatAPIEntry(api))
							.join('\n\n')
				}
			]
		}
	}

	/**
	 * 按CORS支持筛选API
	 */
	public async filterAPIsByCORS(
		corsSupport: string,
		limit: number
	): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const results: APIEntry[] = []

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				if (api.Cors.toLowerCase() === corsSupport.toLowerCase()) {
					results.push(api)
					if (results.length >= limit) break
				}
			}
			if (results.length >= limit) break
		}

		return {
			content: [
				{
					type: 'text',
					text:
						`CORS支持状态为 "${corsSupport}" 的API（显示前${limit}个）：\n\n` +
						results
							.map((api) => this.formatterService.formatAPIEntry(api))
							.join('\n\n')
				}
			]
		}
	}

	/**
	 * 获取API详细信息
	 */
	public async getAPIDetails(apiName: string): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()

		for (const categoryData of Object.values(apiDatabase)) {
			const api = categoryData.entries.find(
				(entry) => entry.API.toLowerCase() === apiName.toLowerCase()
			)

			if (api) {
				return {
					content: [
						{
							type: 'text',
							text: this.formatterService.formatAPIDetails(api)
						}
					]
				}
			}
		}

		return {
			content: [
				{
					type: 'text',
					text: `未找到名为 "${apiName}" 的API`
				}
			]
		}
	}

	/**
	 * 获取分类列表
	 */
	public async getCategoryList(): Promise<ToolResponse> {
		try {
			const apiDatabase = this.apiService.getApiDatabase()

			if (!apiDatabase || typeof apiDatabase !== 'object') {
				return {
					content: [
						{
							type: 'text',
							text: 'API数据库未初始化，请稍后重试'
						}
					]
				}
			}

			const categories = Object.keys(apiDatabase).sort()

			if (categories.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: '暂无可用的API分类，数据可能正在加载中'
						}
					]
				}
			}

			const categoryInfo = categories.map(
				(category) => `${category} (${apiDatabase[category]?.count || 0}个API)`
			)

			return {
				content: [
					{
						type: 'text',
						text: `可用的API分类（共${
							categories.length
						}个）：\n\n${categoryInfo.join('\n')}`
					}
				]
			}
		} catch (error) {
			console.error('获取分类列表时出错:', error)
			return {
				isError: true,
				content: [
					{
						type: 'text',
						text: `获取分类列表时出错: ${
							error instanceof Error ? error.message : String(error)
						}`
					}
				]
			}
		}
	}

	/**
	 * 获取随机API
	 */
	public async getRandomAPI(category?: string): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		let apis: APIEntry[] = []

		if (category) {
			if (!apiDatabase[category]) {
				return {
					content: [
						{
							type: 'text',
							text: `未找到分类 "${category}"`
						}
					]
				}
			}

			apis = apiDatabase[category].entries
		} else {
			// 从所有分类中收集API
			for (const categoryData of Object.values(apiDatabase)) {
				apis = apis.concat(categoryData.entries)
			}
		}

		if (apis.length === 0) {
			return {
				content: [
					{
						type: 'text',
						text: '没有可用的API'
					}
				]
			}
		}

		// 随机选择一个API
		const randomIndex = Math.floor(Math.random() * apis.length)
		const randomAPI = apis[randomIndex]

		return {
			content: [
				{
					type: 'text',
					text: `随机推荐的API：\n\n${this.formatterService.formatAPIDetails(
						randomAPI
					)}`
				}
			]
		}
	}

	/**
	 * 获取API统计信息
	 */
	public async getAPIStatistics(): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const categories = Object.keys(apiDatabase)
		const totalAPIs = Object.values(apiDatabase).reduce(
			(sum, data) => sum + data.count,
			0
		)

		// 计算认证类型分布
		const authTypes: { [key: string]: number } = {}
		// 计算HTTPS支持分布
		let httpsCount = 0
		// 计算CORS支持分布
		const corsTypes: { [key: string]: number } = {}

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				// 统计认证类型
				if (!authTypes[api.Auth]) {
					authTypes[api.Auth] = 0
				}
				authTypes[api.Auth]++

				// 统计HTTPS支持
				if (api.HTTPS) {
					httpsCount++
				}

				// 统计CORS支持
				if (!corsTypes[api.Cors]) {
					corsTypes[api.Cors] = 0
				}
				corsTypes[api.Cors]++
			}
		}

		const authInfo = Object.entries(authTypes)
			.sort((a, b) => b[1] - a[1])
			.map(
				([type, count]) =>
					`${type}: ${count}个 (${((count / totalAPIs) * 100).toFixed(1)}%)`
			)
			.join('\n')

		const corsInfo = Object.entries(corsTypes)
			.sort((a, b) => b[1] - a[1])
			.map(
				([type, count]) =>
					`${type}: ${count}个 (${((count / totalAPIs) * 100).toFixed(1)}%)`
			)
			.join('\n')

		return {
			content: [
				{
					type: 'text',
					text:
						`API统计信息：\n\n` +
						`总分类数：${categories.length}\n` +
						`总API数：${totalAPIs}\n\n` +
						`认证类型分布：\n${authInfo}\n\n` +
						`HTTPS支持：${httpsCount}个 (${(
							(httpsCount / totalAPIs) *
							100
						).toFixed(1)}%)\n\n` +
						`CORS支持分布：\n${corsInfo}`
				}
			]
		}
	}

	/**
	 * 分析认证要求
	 */
	public async analyzeAuthRequirements(): Promise<ToolResponse> {
		const apiDatabase = this.apiService.getApiDatabase()
		const authAnalysis: { [key: string]: { count: number; apis: string[] } } =
			{}

		for (const categoryData of Object.values(apiDatabase)) {
			for (const api of categoryData.entries) {
				if (!authAnalysis[api.Auth]) {
					authAnalysis[api.Auth] = { count: 0, apis: [] }
				}

				authAnalysis[api.Auth].count++

				if (authAnalysis[api.Auth].apis.length < 5) {
					// 每种认证类型最多列出5个示例
					authAnalysis[api.Auth].apis.push(api.API)
				}
			}
		}

		const totalAPIs = Object.values(apiDatabase).reduce(
			(sum, data) => sum + data.count,
			0
		)

		let analysisText = `API认证要求分析：\n\n`

		for (const [authType, data] of Object.entries(authAnalysis).sort(
			(a, b) => b[1].count - a[1].count
		)) {
			const percentage = ((data.count / totalAPIs) * 100).toFixed(1)
			analysisText += `${authType}：${data.count}个API (${percentage}%)\n`
			analysisText += `示例：${data.apis.join(', ')}\n\n`
		}

		return {
			content: [
				{
					type: 'text',
					text: analysisText
				}
			]
		}
	}
}
