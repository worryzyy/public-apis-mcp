import { APIEntry, ToolResponse } from '../types/api.js';
import { ApiService } from './api-service.js';
import { FormatterService } from './formatter-service.js';

/**
 * API 推荐服务类
 * 负责 API 推荐和匹配功能
 */
export class RecommendationService {
  private apiService: ApiService;
  private formatterService: FormatterService;

  constructor(apiService: ApiService, formatterService: FormatterService) {
    this.apiService = apiService;
    this.formatterService = formatterService;
  }

  /**
   * 为项目推荐API
   */
  public async recommendAPIsForProject(projectType: string, requirements: string[] = [], limit: number): Promise<ToolResponse> {
    const apiDatabase = this.apiService.getApiDatabase();
    const recommendations: APIEntry[] = [];
    const projectTypeLower = projectType.toLowerCase();

    // 基于项目类型和需求的关键词映射
    const keywordMappings: { [key: string]: string[] } = {
      '天气应用': ['weather', 'forecast', 'climate', 'temperature'],
      '社交媒体': ['social', 'media', 'twitter', 'facebook', 'instagram'],
      '电商': ['commerce', 'product', 'shop', 'payment', 'ecommerce'],
      '新闻应用': ['news', 'article', 'media', 'rss'],
      '游戏': ['game', 'score', 'player', 'entertainment'],
      '教育': ['education', 'learning', 'school', 'course', 'academic'],
      '健康': ['health', 'fitness', 'medical', 'nutrition'],
      '旅行': ['travel', 'flight', 'hotel', 'booking', 'destination'],
      '金融': ['finance', 'banking', 'currency', 'stock', 'payment'],
      '音乐': ['music', 'audio', 'song', 'artist', 'playlist'],
      '视频': ['video', 'streaming', 'movie', 'film', 'tv'],
      '地图': ['map', 'location', 'geocoding', 'navigation', 'place'],
      '聊天机器人': ['chat', 'bot', 'ai', 'message', 'conversation'],
      '数据分析': ['data', 'analytics', 'statistics', 'visualization'],
      '开发工具': ['development', 'tool', 'code', 'programming'],
      '安全': ['security', 'authentication', 'encryption', 'protection']
    };

    // 获取与项目类型相关的关键词
    let relevantKeywords: string[] = [];
    for (const [type, keywords] of Object.entries(keywordMappings)) {
      if (type.toLowerCase().includes(projectTypeLower) || projectTypeLower.includes(type.toLowerCase())) {
        relevantKeywords = relevantKeywords.concat(keywords);
      }
    }

    // 添加用户提供的需求作为关键词
    relevantKeywords = relevantKeywords.concat(requirements);

    // 如果没有找到相关关键词，使用项目类型作为关键词
    if (relevantKeywords.length === 0) {
      relevantKeywords.push(projectType);
    }

    // 为每个API计算相关性得分
    const scoredApis: { api: APIEntry; score: number }[] = [];

    for (const categoryData of Object.values(apiDatabase)) {
      for (const api of categoryData.entries) {
        let score = 0;
        const apiText = `${api.API} ${api.Description} ${api.Category}`.toLowerCase();

        // 计算关键词匹配得分
        for (const keyword of relevantKeywords) {
          if (apiText.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }

        // 如果API有得分，添加到列表
        if (score > 0) {
          scoredApis.push({ api, score });
        }
      }
    }

    // 按得分排序并获取前N个结果
    scoredApis.sort((a, b) => b.score - a.score);
    const topApis = scoredApis.slice(0, limit);

    if (topApis.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `未找到适合 "${projectType}" 项目的API推荐。请尝试提供更具体的项目类型或需求。`
        }]
      };
    }

    const recommendationsText = topApis.map((item, index) => 
      `### ${index + 1}. ${item.api.API}\n` +
      `**相关度**: ${item.score}\n` +
      `**描述**: ${item.api.Description}\n` +
      `**认证**: ${item.api.Auth}\n` +
      `**链接**: ${item.api.Link}\n`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `为 "${projectType}" 项目推荐的API：\n\n${recommendationsText}`
      }]
    };
  }

  /**
   * 寻找替代API
   */
  public async findAlternativeAPIs(functionality: string, limit: number): Promise<ToolResponse> {
    const apiDatabase = this.apiService.getApiDatabase();
    const alternatives: APIEntry[] = [];
    const functionalityLower = functionality.toLowerCase();

    // 为每个API计算与功能相关性得分
    const scoredApis: { api: APIEntry; score: number }[] = [];

    for (const categoryData of Object.values(apiDatabase)) {
      for (const api of categoryData.entries) {
        let score = 0;
        const apiText = `${api.API} ${api.Description} ${api.Category}`.toLowerCase();

        // 简单计算关键词匹配
        const keywords = functionalityLower.split(/\s+/);
        for (const keyword of keywords) {
          if (keyword.length > 2 && apiText.includes(keyword)) { // 忽略太短的词
            score += 1;
          }
        }

        // 如果API有得分，添加到列表
        if (score > 0) {
          scoredApis.push({ api, score });
        }
      }
    }

    // 按得分排序并获取前N个结果
    scoredApis.sort((a, b) => b.score - a.score);
    const topAlternatives = scoredApis.slice(0, limit);

    if (topAlternatives.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `未找到与 "${functionality}" 功能相关的替代API。请尝试使用不同的描述。`
        }]
      };
    }

    const alternativesText = topAlternatives.map((item, index) => 
      `### ${index + 1}. ${item.api.API}\n` +
      `**相关度**: ${item.score}\n` +
      `**描述**: ${item.api.Description}\n` +
      `**认证**: ${item.api.Auth}\n` +
      `**链接**: ${item.api.Link}\n`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `与 "${functionality}" 功能相关的API：\n\n${alternativesText}`
      }]
    };
  }

  /**
   * 检查新API
   */
  public async checkNewAPIs(days: number): Promise<ToolResponse> {
    const apiDatabase = this.apiService.getApiDatabase();
    // 由于我们无法获取真实的添加时间，这里模拟返回一些最近的API
    const allAPIs: APIEntry[] = [];
    for (const categoryData of Object.values(apiDatabase)) {
      allAPIs.push(...categoryData.entries);
    }
    
    // 随机选择一些API作为"新添加"的
    const totalToShow = Math.min(10, Math.ceil(allAPIs.length * 0.05)); // 最多显示10个，或总数的5%
    const shuffled = [...allAPIs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, totalToShow);
    
    return {
      content: [{
        type: 'text',
        text: `最近${days}天添加的API（模拟数据）：\n\n` +
              selected.map((api, index) => `${index + 1}. ${api.API} - ${api.Description}`).join('\n')
      }]
    };
  }
}
