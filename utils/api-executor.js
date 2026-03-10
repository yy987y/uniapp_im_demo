/**
 * 通用 API 执行器
 *
 * 消灭页面中 200+ 个 async apiXxx(params) 样板方法。
 * 页面只需提供 API 配置（service/method/argMode），执行器统一处理：
 *   1. SDK 实例 guard（未初始化自动报错）
 *   2. 参数从表单值到 SDK 调用签名的映射
 *   3. 调用前后自动记录日志
 *   4. 统一错误格式化
 */
import { assertNIM } from './nim-sdk.js'
import logger from './logger.js'

/**
 * API 配置 argMode 说明：
 *
 * 'positional' — SDK 方法接受位置参数，如 login(accountId, token, options)
 *   需配合 argMap: ['accountId', 'token', 'loginOption']
 *   argMap 中每个 key 从 processedParams 取值，按顺序作为调用参数
 *
 * 'object' — SDK 方法接受单个对象参数，如 getMessageList(option)
 *   直接将 processedParams 整体传入
 *
 * 'none' — SDK 方法无参数，如 getLoginUser()
 *
 * 'custom' — 需要自定义参数组装逻辑
 *   配合 buildArgs: (params, nim) => [...args]
 */

/**
 * 创建可被 ApiTester 直接使用的 API 执行函数
 *
 * @param {Object} apiConfig
 * @param {string} apiConfig.service - SDK 服务名，如 'V2NIMLoginService'
 * @param {string} apiConfig.method - 方法名，如 'login'
 * @param {string} [apiConfig.argMode='none'] - 参数模式: 'positional' | 'object' | 'none' | 'custom'
 * @param {string[]} [apiConfig.argMap] - positional 模式下的参数映射顺序
 * @param {Function} [apiConfig.buildArgs] - custom 模式下的参数构建函数 (params, nim) => args[]
 * @param {Function} [apiConfig.formatResult] - 可选的结果格式化函数 (rawResult) => displayResult
 * @returns {Function} async (processedParams) => result — 可直接赋给 ApiTester 的 :api-function
 */
export function createApiFunction(apiConfig) {
  const {
    service,
    method,
    argMode = 'none',
    argMap,
    buildArgs,
    formatResult
  } = apiConfig

  return async function executeApi(params) {
    const nim = assertNIM()

    const serviceInstance = nim[service]
    if (!serviceInstance) {
      throw new Error(`服务 ${service} 不存在，请检查 SDK 是否已正确初始化`)
    }

    const fn = serviceInstance[method]
    if (typeof fn !== 'function') {
      throw new Error(`${service}.${method} 不是一个方法`)
    }

    let args = []
    switch (argMode) {
      case 'positional':
        if (!argMap || !argMap.length) {
          throw new Error(`positional 模式需要提供 argMap`)
        }
        args = argMap.map(key => params[key])
        break
      case 'object':
        args = [params]
        break
      case 'custom':
        if (typeof buildArgs !== 'function') {
          throw new Error(`custom 模式需要提供 buildArgs 函数`)
        }
        args = buildArgs(params, nim)
        break
      case 'none':
      default:
        args = []
    }

    logger.info(`调用 ${service}.${method}`, argMode !== 'none' ? params : undefined)

    const result = await fn.apply(serviceInstance, args)

    const displayResult = formatResult ? formatResult(result) : result
    logger.success(`${service}.${method} 成功`, displayResult)

    if (displayResult !== undefined && displayResult !== null) {
      return displayResult
    }
    return { success: true }
  }
}

/**
 * 批量从 API 配置数组生成执行函数映射
 * 返回 { [apiName]: executeFunction } 对象
 *
 * @param {Array} apiConfigs - API 配置数组，每项需包含 name 字段
 * @returns {Object} { apiName: Function }
 */
export function createApiFunctions(apiConfigs) {
  const functions = {}
  apiConfigs.forEach(config => {
    if (config.name) {
      functions[config.name] = createApiFunction(config)
    }
  })
  return functions
}
