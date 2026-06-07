import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 火山引擎图片换装服务 (豆包图生图 API)
 *
 * 接口文档: https://www.volcengine.com/docs/86081/1660173
 * 同步转异步模式:
 *   1. CVSubmitTask  - 提交任务, 获取 task_id
 *   2. CVGetResult   - 查询结果, 获取生成图片
 *
 * API 端点: https://visual.volcengineapi.com
 * Action=CVSubmitTask&Version=2022-08-31
 */
@Injectable()
export class VolcengineTryonService {
  private readonly logger = new Logger(VolcengineTryonService.name);
  private readonly endpoint = 'https://visual.volcengineapi.com';
  private readonly host = 'visual.volcengineapi.com';
  private readonly region = 'cn-north-1';
  private readonly service = 'cv';

  private sign(key: Buffer | string, msg: string): Buffer {
    return crypto.createHmac('sha256', key).update(msg).digest();
  }

  private getSignatureKey(
    secretKey: string,
    dateStamp: string,
    regionName: string,
    serviceName: string,
  ): Buffer {
    const kDate = this.sign(Buffer.from(secretKey, 'utf-8'), dateStamp);
    const kRegion = this.sign(kDate, regionName);
    const kService = this.sign(kRegion, serviceName);
    return this.sign(kService, 'request');
  }

  private formatQuery(parameters: Record<string, string>): string {
    return Object.keys(parameters)
      .sort()
      .map((key) => `${key}=${parameters[key]}`)
      .join('&');
  }

  /**
   * 调用火山引擎 API (签名 + 请求)
   */
  private async callApi(
    accessKey: string,
    secretKey: string,
    action: string,
    bodyParams: Record<string, unknown>,
  ): Promise<{ code: number; data: any; message: string }> {
    const now = new Date();
    const currentDate =
      now.getUTCFullYear().toString() +
      (now.getUTCMonth() + 1).toString().padStart(2, '0') +
      now.getUTCDate().toString().padStart(2, '0') +
      'T' +
      now.getUTCHours().toString().padStart(2, '0') +
      now.getUTCMinutes().toString().padStart(2, '0') +
      now.getUTCSeconds().toString().padStart(2, '0') +
      'Z';
    const dateStamp = currentDate.substring(0, 8);

    const reqBody = JSON.stringify(bodyParams);
    const reqQuery = this.formatQuery({ Action: action, Version: '2022-08-31' });
    const payloadHash = crypto.createHash('sha256').update(reqBody).digest('hex');
    const contentType = 'application/json';

    const canonicalHeaders =
      'content-type:' + contentType + '\n' +
      'host:' + this.host + '\n' +
      'x-content-sha256:' + payloadHash + '\n' +
      'x-date:' + currentDate + '\n';
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';

    const canonicalRequest = [
      'POST', '/', reqQuery, canonicalHeaders, signedHeaders, payloadHash,
    ].join('\n');

    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/request`;
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = [algorithm, currentDate, credentialScope, hashedCanonicalRequest].join('\n');

    const signingKey = this.getSignatureKey(secretKey, dateStamp, this.region, this.service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorization =
      `${algorithm} Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await axios.post(
      `${this.endpoint}?${reqQuery}`,
      bodyParams,
      {
        headers: {
          'X-Date': currentDate,
          'Authorization': authorization,
          'X-Content-Sha256': payloadHash,
          'Content-Type': contentType,
        },
        timeout: 60000,
      },
    );

    return response.data;
  }

  /**
   * 将本地图片转为 base64
   */
  private async imageUrlToBase64(url: string): Promise<string> {
    // 如果是本地 localhost URL，直接读文件
    const localMatch = url.match(/http:\/\/localhost:\d+\/uploads\/(.+)/);
    if (localMatch) {
      const filePath = path.join(process.cwd(), 'uploads', localMatch[1]);
      const buffer = fs.readFileSync(filePath);
      return buffer.toString('base64');
    }

    // 远程 URL：下载后转 base64
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return Buffer.from(response.data).toString('base64');
  }

  /**
   * 调用火山引擎虚拟换装 API (同步转异步)
   *
   * 步骤:
   * 1. CVSubmitTask - 提交换装任务, 获得 task_id
   * 2. CVGetResult  - 轮询查询结果, 获取生成图片
   */
  async generateVirtualTryon(
    personImageUrl: string,
    clothingImageUrl: string,
    clothingType: 'upper' | 'bottom' | 'full' = 'full',
  ): Promise<string> {
    try {
      const accessKey = process.env.VOLCENGINE_ACCESS_KEY;
      const secretKey = process.env.VOLCENGINE_SECRET_KEY;

      if (!accessKey || !secretKey) {
        this.logger.warn('未配置火山引擎 API Key，使用 Mock 模式');
        return this.getMockResult(clothingImageUrl);
      }

      // 总是转 base64（localStorage/localhost URL 火山引擎无法访问）
      this.logger.log('转换图片为 base64...');
      const personBase64 = await this.imageUrlToBase64(personImageUrl);
      const clothingBase64 = await this.imageUrlToBase64(clothingImageUrl);

      // ---- Step 1: 提交任务 (CVSubmitTask) ----
      this.logger.log('Step 1: 提交换装任务 (CVSubmitTask)');

      const submitBody: Record<string, unknown> = {
        req_key: 'dressing_diffusionV2',
        req_image_store_type: 0, // base64 模式
        binary_data_base64: [personBase64, clothingBase64],
        garment: {
          data: [
            {
              type: clothingType,
            },
          ],
        },
        inference_config: {
          keep_head: true,
        },
      };

      this.logger.log(`请求参数: req_key=${submitBody.req_key}, 使用 base64 模式`);
      this.logger.log(`模特图大小: ${personBase64.length} 字符, 服装图大小: ${clothingBase64.length} 字符`);

      const submitResult = await this.callApi(accessKey, secretKey, 'CVSubmitTask', submitBody);
      this.logger.log(`提交任务响应: code=${submitResult.code}, message=${JSON.stringify(submitResult.message)}`);

      if (submitResult.code !== 10000) {
        throw new Error(
          `提交任务失败: code=${submitResult.code}, message=${JSON.stringify(submitResult.message)}`,
        );
      }

      const taskId: string = submitResult.data?.task_id;
      if (!taskId) {
        throw new Error(`未获取到 task_id, 响应: ${JSON.stringify(submitResult)}`);
      }

      this.logger.log(`任务已提交, task_id=${taskId}`);

      // ---- Step 2: 轮询查询结果 ----
      this.logger.log('Step 2: 轮询查询换装结果 (CVGetResult)');

      const getResultBody = {
        req_key: 'dressing_diffusionV2',
        task_id: taskId,
      };

      // Vercel 免费版限 60s，用 10 次轮询 × 5s = 50s 留有缓冲
      const maxRetries = process.env.VERCEL ? 10 : 24;
      for (let i = 0; i < maxRetries; i++) {
        await this.delay(5000);

        const resultData = await this.callApi(accessKey, secretKey, 'CVGetResult', getResultBody);
        const status = resultData.data?.status;
        this.logger.log(`轮询 ${i + 1}/${maxRetries}: code=${resultData.code}, status=${status}`);

        if (resultData.code === 10000 && status === 'done') {
          // 从 image_urls 数组取第一张结果图
          const imageUrl = resultData.data?.image_urls?.[0];

          if (imageUrl) {
            this.logger.log(`换装成功! imageUrl=${imageUrl}`);
            return imageUrl;
          }

          // 也可能是 base64 返回
          const base64Image = resultData.data?.binary_data_base64?.[0];
          if (base64Image) {
            this.logger.log(`换装成功! (base64, 长度=${base64Image.length})`);
            return 'data:image/png;base64,' + base64Image;
          }

          this.logger.log(`status=done 但未找到图片: ${JSON.stringify(resultData.data).substring(0, 300)}`);
        }

        // code=10001 表示还在处理中，继续轮询
      }

      throw new Error(`换装任务超时: task_id=${taskId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`火山引擎 API 调用失败: ${errMsg}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`HTTP ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
      }

      this.logger.log('降级使用 Mock 结果');
      return this.getMockResult(clothingImageUrl);
    }
  }

  private async getMockResult(clothingImageUrl: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return clothingImageUrl;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<boolean> {
    return !!(
      process.env.VOLCENGINE_ACCESS_KEY && process.env.VOLCENGINE_SECRET_KEY
    );
  }
}
