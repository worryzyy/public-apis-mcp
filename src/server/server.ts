import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ApiService } from '../services/api-service.js';
import { FormatterService } from '../services/formatter-service.js';
import { SearchService } from '../services/search-service.js';
import { RecommendationService } from '../services/recommendation-service.js';
import { CodeGenerationService } from '../services/code-generation-service.js';
import { ToolService } from '../services/tool-service.js';

/**
 * 公共API服务器类
 * 负责初始化服务器和处理请求
 */
export class PublicAPIsServer {
  private server: Server;
  private apiService: ApiService;
  private formatterService: FormatterService;
  private searchService: SearchService;
  private recommendationService: RecommendationService;
  private codeGenerationService: CodeGenerationService;
  private toolService: ToolService;

  constructor() {
    // 初始化服务
    this.apiService = new ApiService();
    this.formatterService = new FormatterService();
    this.searchService = new SearchService(this.apiService, this.formatterService);
    this.recommendationService = new RecommendationService(this.apiService, this.formatterService);
    this.codeGenerationService = new CodeGenerationService(this.apiService, this.formatterService);
    this.toolService = new ToolService(
      this.apiService, 
      this.searchService, 
      this.recommendationService, 
      this.codeGenerationService
    );

    // 初始化服务器
    this.server = new Server(
      {
        name: 'public-apis-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupRequestHandlers();
    this.setupErrorHandling();
  }

  /**
   * 设置请求处理器
   */
  private setupRequestHandlers(): void {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.toolService.getToolDefinitions()
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      const response = await this.toolService.handleToolCall(name, args);
      // 将 ToolResponse 转换为 MCP SDK 期望的格式
      return {
        // 返回工具调用结果
        result: response
      };
    });
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * 启动服务器
   */
  public async start(transport: any): Promise<void> {
    await this.server.connect(transport);
    console.log('公共API服务器已启动');
  }

  /**
   * 关闭服务器
   */
  public async close(): Promise<void> {
    await this.server.close();
    console.log('公共API服务器已关闭');
  }
}
