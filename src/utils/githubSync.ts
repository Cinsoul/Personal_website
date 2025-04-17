/**
 * GitHub同步工具函数
 * 用于将项目数据同步到GitHub仓库中
 */

// GitHub API配置
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * 配置同步参数
 */
export interface GitHubSyncOptions {
  owner: string;         // 仓库所有者用户名
  repo: string;          // 仓库名称
  token?: string;        // GitHub个人访问令牌(PAT)
  branch?: string;       // 目标分支
  message?: string;      // 提交消息
}

/**
 * GitHub同步数据接口
 */
export interface GitHubSyncData {
  data: any;             // 要同步的数据
  filename: string;      // 文件名
  options: GitHubSyncOptions; // 同步选项
}

/**
 * GitHub同步响应接口
 */
export interface GitHubSyncResponse {
  success: boolean;
  error?: string;
}

/**
 * 触发GitHub Actions工作流来同步数据
 * 
 * @param data 要同步的数据
 * @param options 同步选项
 * @returns 成功返回true，失败返回false
 */
export async function triggerGitHubActionsSync(
  data: any, 
  options: GitHubSyncOptions
): Promise<boolean>;

/**
 * 触发GitHub Actions工作流来同步数据（重载版本）
 * 
 * @param syncData 同步数据对象
 * @returns 包含成功状态和错误信息的响应对象
 */
export async function triggerGitHubActionsSync(
  syncData: GitHubSyncData
): Promise<GitHubSyncResponse>;

/**
 * 触发GitHub Actions工作流来同步数据（实现）
 */
export async function triggerGitHubActionsSync(
  dataOrSyncData: any | GitHubSyncData,
  optionsParam?: GitHubSyncOptions
): Promise<boolean | GitHubSyncResponse> {
  try {
    console.log('准备触发GitHub Actions同步工作流...');

    // 处理不同的参数格式
    let data: any;
    let options: GitHubSyncOptions;
    let isExtendedFormat = false;

    if (dataOrSyncData && typeof dataOrSyncData === 'object' && 'options' in dataOrSyncData) {
      // 使用扩展格式
      data = dataOrSyncData.data;
      options = dataOrSyncData.options;
      isExtendedFormat = true;
    } else {
      // 使用标准格式
      data = dataOrSyncData;
      options = optionsParam as GitHubSyncOptions;
    }

    // 必要参数检查
    if (!options || !options.owner || !options.repo) {
      console.error('缺少必要参数: owner, repo');
      return isExtendedFormat 
        ? { success: false, error: '缺少必要参数: owner, repo' } 
        : false;
    }

    // 获取PAT
    const token = options.token || localStorage.getItem('github_pat');
    if (!token) {
      console.error('未提供GitHub个人访问令牌(PAT)，无法进行同步');
      return isExtendedFormat 
        ? { success: false, error: '未提供GitHub个人访问令牌(PAT)，无法进行同步' } 
        : false;
    }

    // 构建API请求URL
    const apiUrl = `${GITHUB_API_BASE}/repos/${options.owner}/${options.repo}/dispatches`;

    // 准备请求数据
    const requestData = {
      event_type: 'sync-portfolio-data',
      client_payload: {
        portfolio_data: JSON.stringify(data, null, 2),
        message: options.message || '通过网页更新项目数据'
      }
    };

    // 发送请求触发工作流
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // 检查响应状态
    if (response.status === 204) {
      console.log('成功触发GitHub Actions工作流');
      return isExtendedFormat ? { success: true } : true;
    } else {
      const responseData = await response.json();
      const errorMsg = `触发GitHub Actions工作流失败: ${JSON.stringify(responseData)}`;
      console.error(errorMsg);
      return isExtendedFormat ? { success: false, error: errorMsg } : false;
    }
  } catch (error) {
    const errorMsg = `触发GitHub Actions工作流出错: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return dataOrSyncData && typeof dataOrSyncData === 'object' && 'options' in dataOrSyncData
      ? { success: false, error: errorMsg }
      : false;
  }
}

/**
 * 保存GitHub个人访问令牌(PAT)
 * 
 * @param token 个人访问令牌
 * @param rememberToken 是否记住令牌
 */
export function saveGitHubPAT(token: string, rememberToken: boolean = false): void {
  if (rememberToken) {
    localStorage.setItem('github_pat', token);
    console.log('已保存GitHub PAT到localStorage');
  } else {
    // 仅在会话中保存
    sessionStorage.setItem('github_pat', token);
    console.log('已保存GitHub PAT到sessionStorage');
  }
}

/**
 * 获取GitHub个人访问令牌(PAT)
 * 
 * @returns 已保存的PAT或null
 */
export function getGitHubPAT(): string | null {
  // 优先从sessionStorage获取
  const sessionToken = sessionStorage.getItem('github_pat');
  if (sessionToken) {
    return sessionToken;
  }
  
  // 其次从localStorage获取
  return localStorage.getItem('github_pat');
}

/**
 * 检查是否已保存GitHub个人访问令牌(PAT)
 * 
 * @returns 是否已保存PAT
 */
export function hasGitHubPAT(): boolean {
  return getGitHubPAT() !== null;
}

/**
 * 清除已保存的GitHub个人访问令牌(PAT)
 */
export function clearGitHubPAT(): void {
  sessionStorage.removeItem('github_pat');
  localStorage.removeItem('github_pat');
  console.log('已清除GitHub PAT');
}

/**
 * 获取GitHub仓库默认配置
 * 从URL中提取所有者和仓库名
 * 
 * @returns GitHub仓库配置
 */
export function getDefaultGitHubConfig(): GitHubSyncOptions {
  try {
    // 尝试从当前URL中提取GitHub仓库信息
    const url = window.location.href;
    const match = url.match(/github\.io\/([^\/]+)/);
    
    if (match && match[1]) {
      const repo = match[1];
      
      // 从localStorage获取所有者信息
      let owner = localStorage.getItem('github_owner');
      
      // 如果没有保存所有者信息，尝试猜测（通常与repo名相同）
      if (!owner) {
        owner = 'Cinsoul'; // 默认值
      }
      
      return {
        owner,
        repo,
        branch: 'main'
      };
    }
    
    // 如果无法从URL提取，返回默认值
    return {
      owner: 'Cinsoul',
      repo: 'Personal_website',
      branch: 'main'
    };
  } catch (error) {
    console.error('获取GitHub仓库配置出错:', error);
    
    // 出错时返回默认值
    return {
      owner: 'Cinsoul',
      repo: 'Personal_website',
      branch: 'main'
    };
  }
} 