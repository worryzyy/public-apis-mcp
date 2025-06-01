import { ToolResponse } from '../types/api.js';
import { ApiService } from './api-service.js';
import { SearchService } from './search-service.js';
import { RecommendationService } from './recommendation-service.js';
import { CodeGenerationService } from './code-generation-service.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * 工具服务类
 * 负责处理各种工具请求
 */
export class ToolService {
  private apiService: ApiService;
  private searchService: SearchService;
  private recommendationService: RecommendationService;
  private codeGenerationService: CodeGenerationService;

  constructor(
    apiService: ApiService, 
    searchService: SearchService, 
    recommendationService: RecommendationService,
    codeGenerationService: CodeGenerationService
  ) {
    this.apiService = apiService;
    this.searchService = searchService;
    this.recommendationService = recommendationService;
    this.codeGenerationService = codeGenerationService;
  }

  /**
   * 处理工具调用
   */
  public async handleToolCall(name: string, args: Record<string, any>): Promise<ToolResponse> {
    try {
      // 确保数据已同步
      await this.apiService.ensureDataSynced();

      switch (name) {
        case 'search_apis_by_category':
          return await this.searchService.searchAPIsByCategory(String(args.category || ''), Number(args.limit || 10));
        
        case 'search_apis_by_keyword':
          return await this.searchService.searchAPIsByKeyword(String(args.keyword || ''), Number(args.limit || 10));
        
        case 'filter_apis_by_auth':
          return await this.searchService.filterAPIsByAuth(String(args.authType || ''), Number(args.limit || 10));
        
        case 'filter_apis_by_https':
          return await this.searchService.filterAPIsByHTTPS(args.httpsOnly !== false, Number(args.limit || 10));
        
        case 'filter_apis_by_cors':
          return await this.searchService.filterAPIsByCORS(String(args.corsSupport || ''), Number(args.limit || 10));
        
        case 'get_api_details':
          return await this.searchService.getAPIDetails(String(args.apiName || ''));
        
        case 'get_category_list':
          return await this.searchService.getCategoryList();
        
        case 'get_random_api':
          return await this.searchService.getRandomAPI(args.category ? String(args.category) : undefined);
        
        case 'get_api_statistics':
          return await this.searchService.getAPIStatistics();
        
        case 'analyze_auth_requirements':
          return await this.searchService.analyzeAuthRequirements();
        
        case 'recommend_apis_for_project':
          return await this.recommendationService.recommendAPIsForProject(
            String(args.projectType || ''), 
            Array.isArray(args.requirements) ? args.requirements : [], 
            Number(args.limit || 5)
          );
        
        case 'find_alternative_apis':
          return await this.recommendationService.findAlternativeAPIs(String(args.functionality || ''), Number(args.limit || 5));
        
        case 'generate_api_integration_code':
          return await this.codeGenerationService.generateAPIIntegrationCode(String(args.apiName || ''), String(args.language || 'javascript'));
        
        case 'sync_repository_data':
          const syncResult = await this.apiService.syncRepositoryData(Boolean(args.force || false));
          return {
            content: [{
              type: 'text',
              text: syncResult.message
            }]
          };
        
        case 'check_new_apis':
          return await this.recommendationService.checkNewAPIs(Number(args.days || 7));
        
        default:
          throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name}`);
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(ErrorCode.InternalError, `执行 ${name} 时出错: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取所有可用工具定义
   */
  public getToolDefinitions(): any[] {
    return [
      // API搜索和发现工具
      {
        name: 'search_apis_by_category',
        description: '根据分类搜索API',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'API分类名称（如：Animals, Anime, Business等）'
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认10',
              default: 10
            }
          },
          required: ['category']
        }
      },
      {
        name: 'search_apis_by_keyword',
        description: '通过关键词搜索API',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: '搜索关键词'
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认10',
              default: 10
            }
          },
          required: ['keyword']
        }
      },
      {
        name: 'filter_apis_by_auth',
        description: '根据认证要求筛选API',
        inputSchema: {
          type: 'object',
          properties: {
            authType: {
              type: 'string',
              enum: ['No', 'apiKey', 'OAuth', 'X-Mashape-Key', 'User-Agent'],
              description: '认证类型'
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认10',
              default: 10
            }
          },
          required: ['authType']
        }
      },
      {
        name: 'filter_apis_by_https',
        description: '筛选支持HTTPS的API',
        inputSchema: {
          type: 'object',
          properties: {
            httpsOnly: {
              type: 'boolean',
              description: '是否只返回支持HTTPS的API',
              default: true
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认10',
              default: 10
            }
          }
        }
      },
      {
        name: 'filter_apis_by_cors',
        description: '筛选支持跨域访问的API',
        inputSchema: {
          type: 'object',
          properties: {
            corsSupport: {
              type: 'string',
              enum: ['yes', 'no', 'unknown'],
              description: 'CORS支持状态'
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认10',
              default: 10
            }
          },
          required: ['corsSupport']
        }
      },
      // API详情查询工具
      {
        name: 'get_api_details',
        description: '获取特定API的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            apiName: {
              type: 'string',
              description: 'API名称'
            }
          },
          required: ['apiName']
        }
      },
      {
        name: 'get_category_list',
        description: '获取所有可用的API分类列表',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_random_api',
        description: '随机推荐一个API',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '可选：限制在特定分类内随机选择'
            }
          }
        }
      },
      // 统计分析工具
      {
        name: 'get_api_statistics',
        description: '获取API数量统计信息',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'analyze_auth_requirements',
        description: '分析不同认证方式的API分布',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      // 推荐和匹配工具
      {
        name: 'recommend_apis_for_project',
        description: '根据项目需求推荐合适的API',
        inputSchema: {
          type: 'object',
          properties: {
            projectType: {
              type: 'string',
              description: '项目类型描述（如：天气应用、社交媒体、电商等）'
            },
            requirements: {
              type: 'array',
              items: { type: 'string' },
              description: '项目需求列表'
            },
            limit: {
              type: 'number',
              description: '推荐API数量限制，默认5',
              default: 5
            }
          },
          required: ['projectType']
        }
      },
      {
        name: 'find_alternative_apis',
        description: '寻找替代API选项',
        inputSchema: {
          type: 'object',
          properties: {
            functionality: {
              type: 'string',
              description: '所需功能描述'
            },
            limit: {
              type: 'number',
              description: '返回结果数量限制，默认5',
              default: 5
            }
          },
          required: ['functionality']
        }
      },
      // 代码生成工具
      {
        name: 'generate_api_integration_code',
        description: '为选定的API生成集成代码示例',
        inputSchema: {
          type: 'object',
          properties: {
            apiName: {
              type: 'string',
              description: 'API名称'
            },
            language: {
              type: 'string',
              enum: ['javascript', 'python', 'curl'],
              description: '编程语言',
              default: 'javascript'
            }
          },
          required: ['apiName']
        }
      },
      // 数据同步功能
      {
        name: 'sync_repository_data',
        description: '从GitHub仓库同步最新的API列表',
        inputSchema: {
          type: 'object',
          properties: {
            force: {
              type: 'boolean',
              description: '是否强制重新同步',
              default: false
            }
          }
        }
      },
      {
        name: 'check_new_apis',
        description: '检查最近添加的新API',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: '检查最近几天的新增API，默认7天',
              default: 7
            }
          }
        }
      }
    ];
  }
}
