import axios from 'axios';
import {  APIDatabase } from '../types/api.js';

/**
 * API 数据服务类
 * 负责从远程加载和管理 API 数据
 */
export class ApiService {
  private apiDatabase: APIDatabase = {};
  private lastSync: Date | null = null;
  
  // 获取 API 数据的 URL
  private getApiDataUrl(): string {
    return 'https://weilei.site/apis.json';
  }

  /**
   * 获取 API 数据库
   */
  public getApiDatabase(): APIDatabase {
    return this.apiDatabase;
  }

  /**
   * 获取上次同步时间
   */
  public getLastSync(): Date | null {
    return this.lastSync;
  }

  /**
   * 确保数据已同步
   */
  public async ensureDataSynced(): Promise<void> {
    if (!this.lastSync || Object.keys(this.apiDatabase).length === 0) {
      // 数据未加载或为空，开始从远程获取数据
      await this.syncRepositoryData(false);
    }
  }

  /**
   * 从远程 URL 加载 API 数据
   */
  public async loadApiData(): Promise<APIDatabase | null> {
    try {
      // 从 URL 加载数据
      const response = await axios.get(this.getApiDataUrl());
      
      if (response.status === 200 && response.data) {
        // 成功从远程获取数据
        return response.data;
      } else {
        console.error(`请求返回状态码: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('从远程加载 API 数据失败:', error);
      return null;
    }
  }

  /**
   * 从远程 URL 同步数据
   */
  public async syncRepositoryData(force: boolean): Promise<{ success: boolean; message: string }> {
    try {
      // 开始同步数据
      if (!force && this.lastSync && (Date.now() - this.lastSync.getTime()) < 3600000) { // 1小时内不重复同步
        // 数据已是最新，无需重新同步
        return {
          success: true,
          message: '数据已是最新，无需重新同步'
        };
      }

      // 从远程 URL 加载数据
      const apiData = await this.loadApiData();
      
      if (apiData) {
        this.apiDatabase = apiData;
        this.lastSync = new Date();
        
        const categories = Object.keys(apiData);
        const totalAPIs = Object.values(this.apiDatabase).reduce((sum, data) => sum + data.count, 0);
        
        return {
          success: true,
          message: `从远程加载数据成功！共加载 ${categories.length} 个分类，${totalAPIs} 个API`
        };
      } else {
        return {
          success: false,
          message: `无法从 ${this.getApiDataUrl()} 获取数据`
        };
      }
    } catch (error) {
      console.error('同步数据失败:', error);
      return {
        success: false,
        message: `加载数据失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
