#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PublicAPIsServer } from './server/server.js';

/**
 * 主入口文件
 * 初始化并启动公共API服务器
 */
async function main() {
  try {
    
    // 创建服务器实例
    const server = new PublicAPIsServer();
    
    // 创建标准输入/输出传输层
    const transport = new StdioServerTransport();
    
    // 启动服务器
    await server.start(transport);
    
    console.log('公共API服务器已成功启动');
  } catch (error) {
    console.error('启动服务器时出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
