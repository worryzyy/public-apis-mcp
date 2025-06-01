import { APIEntry, AuthHeader } from '../types/api.js';

/**
 * 格式化服务类
 * 负责格式化 API 数据输出
 */
export class FormatterService {
  /**
   * 格式化 API 条目
   */
  public formatAPIEntry(api: APIEntry): string {
    return `📌 ${api.API}\n` +
           `📝 描述: ${api.Description}\n` +
           `🔑 认证: ${api.Auth}\n` +
           `🔒 HTTPS: ${api.HTTPS ? '是' : '否'}\n` +
           `🌐 CORS: ${api.Cors}\n` +
           `🔗 链接: ${api.Link}\n` +
           `📂 分类: ${api.Category}`;
  }

  /**
   * 格式化 API 详细信息
   */
  public formatAPIDetails(api: APIEntry): string {
    const authHeader = this.getAuthHeader(api.Auth);
    
    let details = `# ${api.API}\n\n` +
                  `## 基本信息\n\n` +
                  `- **描述**: ${api.Description}\n` +
                  `- **分类**: ${api.Category}\n` +
                  `- **链接**: ${api.Link}\n\n` +
                  `## 技术细节\n\n` +
                  `- **认证方式**: ${api.Auth}\n` +
                  `- **HTTPS支持**: ${api.HTTPS ? '是' : '否'}\n` +
                  `- **CORS状态**: ${api.Cors}\n\n`;
    
    if (api.Auth !== 'No') {
      details += `## 认证设置\n\n` +
                `${authHeader.setup}\n\n` +
                `## 请求示例\n\n` +
                `\`\`\`bash\n${authHeader.curl}\n\`\`\`\n\n`;
    }
    
    return details;
  }

  /**
   * 获取认证头信息
   */
  public getAuthHeader(authType: string): AuthHeader {
    switch (authType) {
      case 'apiKey':
        return {
          setup: '需要API密钥。通常需要注册账号并在开发者控制台获取API密钥。',
          header: 'X-API-Key: YOUR_API_KEY',
          curl: 'curl -H "X-API-Key: YOUR_API_KEY" https://api-endpoint.com/resource'
        };
      case 'OAuth':
        return {
          setup: '需要OAuth认证。请参考API文档完成OAuth流程获取访问令牌。',
          header: 'Authorization: Bearer YOUR_ACCESS_TOKEN',
          curl: 'curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://api-endpoint.com/resource'
        };
      case 'X-Mashape-Key':
        return {
          setup: '需要Mashape/RapidAPI密钥。请在RapidAPI平台注册并订阅此API。',
          header: 'X-Mashape-Key: YOUR_MASHAPE_KEY',
          curl: 'curl -H "X-Mashape-Key: YOUR_MASHAPE_KEY" https://api-endpoint.com/resource'
        };
      case 'User-Agent':
        return {
          setup: '需要在请求中设置User-Agent头。通常用于标识您的应用。',
          header: 'User-Agent: YOUR_APP_NAME',
          curl: 'curl -H "User-Agent: YOUR_APP_NAME" https://api-endpoint.com/resource'
        };
      default:
        return {
          setup: '无需认证。可以直接访问API。',
          header: '',
          curl: 'curl https://api-endpoint.com/resource'
        };
    }
  }
}
