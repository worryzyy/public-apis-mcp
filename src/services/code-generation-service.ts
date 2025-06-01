import { APIEntry, ToolResponse } from '../types/api.js';
import { ApiService } from './api-service.js';
import { FormatterService } from './formatter-service.js';

/**
 * 代码生成服务类
 * 负责生成API集成代码示例
 */
export class CodeGenerationService {
  private apiService: ApiService;
  private formatterService: FormatterService;

  constructor(apiService: ApiService, formatterService: FormatterService) {
    this.apiService = apiService;
    this.formatterService = formatterService;
  }

  /**
   * 生成API集成代码
   */
  public async generateAPIIntegrationCode(apiName: string, language: string): Promise<ToolResponse> {
    const apiDatabase = this.apiService.getApiDatabase();
    
    // 首先找到API详情
    let targetAPI: APIEntry | null = null;
    for (const categoryData of Object.values(apiDatabase)) {
      const api = categoryData.entries.find(entry => 
        entry.API.toLowerCase() === apiName.toLowerCase()
      );
      
      if (api) {
        targetAPI = api;
        break;
      }
    }
    
    if (!targetAPI) {
      return {
        content: [{
          type: 'text',
          text: `未找到名为 "${apiName}" 的API`
        }]
      };
    }
    
    // 获取认证头信息
    const authHeader = this.formatterService.getAuthHeader(targetAPI.Auth);
    
    // 根据语言生成代码
    let code = '';
    let explanation = '';
    
    switch (language.toLowerCase()) {
      case 'javascript':
        code = this.generateJavaScriptCode(targetAPI, authHeader);
        explanation = this.generateJavaScriptExplanation(targetAPI);
        break;
      
      case 'python':
        code = this.generatePythonCode(targetAPI, authHeader);
        explanation = this.generatePythonExplanation(targetAPI);
        break;
      
      case 'curl':
        code = this.generateCurlCode(targetAPI, authHeader);
        explanation = this.generateCurlExplanation(targetAPI);
        break;
      
      default:
        return {
          content: [{
            type: 'text',
            text: `不支持的语言: ${language}。支持的语言有: javascript, python, curl`
          }]
        };
    }
    
    return {
      content: [{
        type: 'text',
        text: `# ${targetAPI.API} 集成代码 (${language})\n\n` +
              `## API 信息\n\n` +
              `- **描述**: ${targetAPI.Description}\n` +
              `- **认证**: ${targetAPI.Auth}\n` +
              `- **HTTPS**: ${targetAPI.HTTPS ? '是' : '否'}\n` +
              `- **CORS**: ${targetAPI.Cors}\n` +
              `- **链接**: ${targetAPI.Link}\n\n` +
              `## 代码示例\n\n` +
              `\`\`\`${language}\n${code}\n\`\`\`\n\n` +
              `## 使用说明\n\n${explanation}`
      }]
    };
  }

  /**
   * 生成 JavaScript 代码
   */
  private generateJavaScriptCode(api: APIEntry, authHeader: { setup: string; header: string; curl: string }): string {
    const baseUrl = api.Link.includes('http') ? api.Link : `https://${api.Link}`;
    const endpoint = '/api/resource'; // 示例端点
    
    let authCode = '';
    let headers = '';
    
    if (api.Auth !== 'No') {
      if (api.Auth === 'apiKey') {
        headers = `  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },`;
      } else if (api.Auth === 'OAuth') {
        headers = `  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },`;
      } else if (api.Auth === 'X-Mashape-Key') {
        headers = `  headers: {
    'X-Mashape-Key': 'YOUR_MASHAPE_KEY',
    'Content-Type': 'application/json'
  },`;
      } else if (api.Auth === 'User-Agent') {
        headers = `  headers: {
    'User-Agent': 'YOUR_APP_NAME',
    'Content-Type': 'application/json'
  },`;
      }
    } else {
      headers = `  headers: {
    'Content-Type': 'application/json'
  },`;
    }
    
    return `// 使用 fetch API 调用 ${api.API}
async function fetchData() {
  try {
    const response = await fetch('${baseUrl}${endpoint}', {
      method: 'GET',
${headers}
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log('API 返回数据:', data);
    return data;
  } catch (error) {
    console.error('调用 API 时出错:', error);
  }
}

// 调用函数
fetchData();

// 使用 axios 库的替代方案
// npm install axios
/*
const axios = require('axios');

async function fetchDataWithAxios() {
  try {
    const response = await axios({
      method: 'GET',
      url: '${baseUrl}${endpoint}',
${headers.replace(/^  /gm, '      ')}
    });
    
    console.log('API 返回数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('调用 API 时出错:', error);
  }
}

fetchDataWithAxios();
*/`;
  }

  /**
   * 生成 JavaScript 说明
   */
  private generateJavaScriptExplanation(api: APIEntry): string {
    let explanation = `1. 此代码示例展示了如何使用原生 fetch API 和 axios 库调用 ${api.API}。\n`;
    
    if (api.Auth !== 'No') {
      explanation += `2. 在使用前，请替换代码中的 'YOUR_${api.Auth.toUpperCase().replace(/-/g, '_')}' 为您的实际认证信息。\n`;
    }
    
    explanation += `3. 示例中使用的是 GET 请求，您可能需要根据 API 文档调整请求方法和参数。\n`;
    explanation += `4. 确保在生产环境中妥善保管您的认证凭据，不要将其硬编码在客户端代码中。\n`;
    
    if (api.HTTPS) {
      explanation += `5. 此 API 支持 HTTPS，确保在生产环境中使用安全连接。\n`;
    } else {
      explanation += `5. 注意：此 API 不支持 HTTPS，在生产环境中使用时需要注意安全问题。\n`;
    }
    
    if (api.Cors === 'yes') {
      explanation += `6. 此 API 支持 CORS，可以直接从浏览器前端调用。\n`;
    } else if (api.Cors === 'no') {
      explanation += `6. 此 API 不支持 CORS，在浏览器环境中需要通过后端代理调用。\n`;
    } else {
      explanation += `6. 此 API 的 CORS 支持状态未知，可能需要通过后端代理调用。\n`;
    }
    
    return explanation;
  }

  /**
   * 生成 Python 代码
   */
  private generatePythonCode(api: APIEntry, authHeader: { setup: string; header: string; curl: string }): string {
    const baseUrl = api.Link.includes('http') ? api.Link : `https://${api.Link}`;
    const endpoint = '/api/resource'; // 示例端点
    
    let headers = '';
    
    if (api.Auth !== 'No') {
      if (api.Auth === 'apiKey') {
        headers = `headers = {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
}`;
      } else if (api.Auth === 'OAuth') {
        headers = `headers = {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
}`;
      } else if (api.Auth === 'X-Mashape-Key') {
        headers = `headers = {
    'X-Mashape-Key': 'YOUR_MASHAPE_KEY',
    'Content-Type': 'application/json'
}`;
      } else if (api.Auth === 'User-Agent') {
        headers = `headers = {
    'User-Agent': 'YOUR_APP_NAME',
    'Content-Type': 'application/json'
}`;
      }
    } else {
      headers = `headers = {
    'Content-Type': 'application/json'
}`;
    }
    
    return `import requests
import json

# 设置 API 端点
url = '${baseUrl}${endpoint}'

# 设置请求头
${headers}

# 发送 GET 请求
try:
    response = requests.get(url, headers=headers)
    
    # 检查响应状态
    response.raise_for_status()
    
    # 解析 JSON 响应
    data = response.json()
    print('API 返回数据:', json.dumps(data, indent=2))
    
except requests.exceptions.HTTPError as errh:
    print('HTTP Error:', errh)
except requests.exceptions.ConnectionError as errc:
    print('Error Connecting:', errc)
except requests.exceptions.Timeout as errt:
    print('Timeout Error:', errt)
except requests.exceptions.RequestException as err:
    print('Something went wrong:', err)

# 使用 aiohttp 的异步替代方案
'''
import aiohttp
import asyncio

async def fetch_data_async():
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    print('API 返回数据:', json.dumps(data, indent=2))
                    return data
                else:
                    print(f'Error: {response.status}')
                    return None
        except Exception as e:
            print(f'发生错误: {e}')
            return None

# 运行异步函数
asyncio.run(fetch_data_async())
'''`;
  }

  /**
   * 生成 Python 说明
   */
  private generatePythonExplanation(api: APIEntry): string {
    let explanation = `1. 此代码示例展示了如何使用 requests 库和 aiohttp 库（异步）调用 ${api.API}。\n`;
    
    if (api.Auth !== 'No') {
      explanation += `2. 在使用前，请替换代码中的 'YOUR_${api.Auth.toUpperCase().replace(/-/g, '_')}' 为您的实际认证信息。\n`;
    }
    
    explanation += `3. 示例中使用的是 GET 请求，您可能需要根据 API 文档调整请求方法和参数。\n`;
    explanation += `4. 确保在生产环境中妥善保管您的认证凭据，可以使用环境变量或配置文件。\n`;
    
    if (api.HTTPS) {
      explanation += `5. 此 API 支持 HTTPS，确保在生产环境中使用安全连接。\n`;
    } else {
      explanation += `5. 注意：此 API 不支持 HTTPS，在生产环境中使用时需要注意安全问题。\n`;
    }
    
    explanation += `6. 代码包含了错误处理，能够捕获并显示不同类型的请求错误。\n`;
    explanation += `7. 如果需要异步处理，可以使用注释中的 aiohttp 示例代码。\n`;
    
    return explanation;
  }

  /**
   * 生成 cURL 代码
   */
  private generateCurlCode(api: APIEntry, authHeader: { setup: string; header: string; curl: string }): string {
    const baseUrl = api.Link.includes('http') ? api.Link : `https://${api.Link}`;
    const endpoint = '/api/resource'; // 示例端点
    
    let headers = '';
    
    if (api.Auth !== 'No') {
      if (api.Auth === 'apiKey') {
        headers = `-H "X-API-Key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\`;
      } else if (api.Auth === 'OAuth') {
        headers = `-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
-H "Content-Type: application/json" \\`;
      } else if (api.Auth === 'X-Mashape-Key') {
        headers = `-H "X-Mashape-Key: YOUR_MASHAPE_KEY" \\
-H "Content-Type: application/json" \\`;
      } else if (api.Auth === 'User-Agent') {
        headers = `-H "User-Agent: YOUR_APP_NAME" \\
-H "Content-Type: application/json" \\`;
      }
    } else {
      headers = `-H "Content-Type: application/json" \\`;
    }
    
    return `# 基本 GET 请求
curl -X GET "${baseUrl}${endpoint}" \\
${headers}
-v

# 带查询参数的 GET 请求
curl -X GET "${baseUrl}${endpoint}?param1=value1&param2=value2" \\
${headers}
-v

# POST 请求示例
curl -X POST "${baseUrl}${endpoint}" \\
${headers}
-d '{
  "key1": "value1",
  "key2": "value2"
}' \\
-v

# 保存响应到文件
curl -X GET "${baseUrl}${endpoint}" \\
${headers}
-o response.json`;
  }

  /**
   * 生成 cURL 说明
   */
  private generateCurlExplanation(api: APIEntry): string {
    let explanation = `1. 此代码示例展示了如何使用 cURL 命令行工具调用 ${api.API}。\n`;
    
    if (api.Auth !== 'No') {
      explanation += `2. 在使用前，请替换命令中的 'YOUR_${api.Auth.toUpperCase().replace(/-/g, '_')}' 为您的实际认证信息。\n`;
    }
    
    explanation += `3. 示例包含了 GET 和 POST 请求，您可能需要根据 API 文档调整请求方法和参数。\n`;
    explanation += `4. -v 参数启用详细输出，可以查看完整的请求和响应头信息。\n`;
    explanation += `5. 最后一个示例展示了如何将 API 响应保存到文件中。\n`;
    
    if (api.HTTPS) {
      explanation += `6. 此 API 支持 HTTPS，确保使用安全连接。\n`;
    } else {
      explanation += `6. 注意：此 API 不支持 HTTPS，使用时需要注意安全问题。\n`;
    }
    
    return explanation;
  }
}
