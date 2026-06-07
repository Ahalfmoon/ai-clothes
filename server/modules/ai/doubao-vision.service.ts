import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 豆包大模型视觉服务
 * 使用 Ark API 对图片进行分析，生成穿搭建议
 *
 * API 文档: https://www.volcengine.com/docs/82379/1299042
 * 端点: https://ark.cn-beijing.volces.com/api/v3/chat/completions
 * 认证: Bearer Token (API Key)
 */
@Injectable()
export class DoubaoVisionService {
  private readonly logger = new Logger(DoubaoVisionService.name);
  private readonly arkEndpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  /**
   * 将图片 URL 转为 base64 data URL
   */
  private async imageToBase64DataUrl(imageUrl: string): Promise<string> {
    // 本地文件
    const localMatch = imageUrl.match(/http:\/\/localhost:\d+\/uploads\/(.+)/);
    if (localMatch) {
      const filePath = path.join(process.cwd(), 'uploads', localMatch[1]);
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).replace('.', '') || 'jpeg';
      return `data:image/${ext};base64,${buffer.toString('base64')}`;
    }

    // 已经是 data: URL
    if (imageUrl.startsWith('data:')) return imageUrl;

    // 远程 URL: 下载后转 base64
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });
      const contentType = response.headers['content-type'] || 'image/jpeg';
      return `data:${contentType};base64,${Buffer.from(response.data).toString('base64')}`;
    } catch {
      this.logger.warn(`无法下载图片: ${imageUrl}, 使用原 URL`);
      return imageUrl;
    }
  }

  /**
   * 调用豆包视觉模型分析穿搭
   */
  async analyzeOutfit(
    personImageUrl: string,
    clothingImageUrl: string,
  ): Promise<string> {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      this.logger.warn('未配置 ARK_API_KEY，使用 Mock 穿搭建议');
      return this.getMockSuggestion();
    }

    try {
      this.logger.log('调用豆包视觉模型分析穿搭...');

      // 转 base64
      const personDataUrl = await this.imageToBase64DataUrl(personImageUrl);
      const clothingDataUrl = await this.imageToBase64DataUrl(clothingImageUrl);

      const prompt = `你是一位专业的私人穿搭顾问，请仔细观察以下两张图片，给出精准、个性化的穿搭分析和建议。

## 图1：模特照片
请仔细观察图1中模特的具体特征，并基于实际观察到的内容进行分析（不要猜测，只描述你确实看到的）：
1. 身材类型：判断肩宽、腰线、胯宽的比例关系，判断属于哪种体型（梨形、苹果形、沙漏型、H型、倒三角等）
2. 身高体型：判断整体身高和胖瘦特征
3. 肤色特征：判断肤色冷暖调、深浅度
4. 当前穿着和风格：描述图中已有的穿搭风格

## 图2：服装照片
请仔细观察图2中服装的具体细节：
1. 款式版型：领型、袖型、腰线、裙长/裤长、整体廓形（A型/H型/X型等）
2. 面料质感：判断面料类型、厚薄、垂坠感、纹理
3. 颜色图案：具体颜色、图案类型、色彩饱和度
4. 设计细节：纽扣、拉链、褶皱、拼接、装饰等元素
5. 风格属性：属于哪种风格（休闲/通勤/甜美/街头/法式/新中式等）

## 综合分析（结合图1+图2，给出个性化建议）

### 版型匹配度
这件服装的版型对模特的修饰效果如何？能突出哪些优势部位？需要留意哪些部位？给出具体的理由。

### 搭配方案（3套）
针对这件服装，给出3套完整的搭配方案，每套必须包含：
- 内搭/外套具体款式建议
- 下装搭配（裤子/裙子具体版型）
- 鞋履选择（具体鞋型）
- 配饰推荐（包、首饰、帽子、腰带等）

### 颜色搭配
结合模特的肤色和服装颜色，给出最佳颜色搭配建议，说明哪些颜色最适合、哪些需要避免。

### 场景适配
根据这套穿搭的风格，推荐3个具体场景，每个场景说明整体效果和注意事项。

要求：
- 必须基于图片中实际观察到的内容，不要用套话
- 每条建议必须有具体理由
- 用中文输出，分点明确，但不要用表格
- 避免"优雅""气质""时尚"等空洞词汇，要给出实质性的具体指导`;

      const response = await axios.post(
        this.arkEndpoint,
        {
          model: 'doubao-vision-pro-32k',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: personDataUrl } },
                { type: 'image_url', image_url: { url: clothingDataUrl } },
                { type: 'text', text: prompt },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 60000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        this.logger.log('豆包视觉模型返回成功');
        return content;
      }

      this.logger.warn(`未预期的响应格式: ${JSON.stringify(response.data).substring(0, 200)}`);
      return this.getMockSuggestion();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`豆包视觉 API 调用失败: ${msg}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`HTTP ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
      }
      return this.getMockSuggestion();
    }
  }

  private getMockSuggestion(): string {
    return `> ⚠️ 当前为 Mock 模式（未配置 ARK_API_KEY），以下是示例建议。配置豆包 API Key 后可获得基于图片的精准分析。

### 版型匹配度
这件服装的廓形对多数体型都有较好的包容性，能修饰腰线并拉长腿部比例。

### 搭配方案
1. **日常通勤**：内搭白色修身针织衫 + 裸色尖头高跟鞋 + 简约链条包 + 银色细项链
2. **周末出街**：搭配浅色帆布鞋 + 草编托特包 + 金属耳环 + 细腰带束腰
3. **约会晚宴**：换黑色细跟凉鞋 + 手拿包 + 珍珠耳饰 + 叠戴手镯

### 颜色搭配
与模特肤色协调的同色系或邻近色最稳妥，避免超过3个主色调。金属配饰选银色系更显清爽。

### 场景适配
- 通勤办公：干练专业，推荐中跟鞋 + 结构感包袋
- 休闲聚会：轻松但有质感，推荐平底鞋 + 帆布包
- 商务场合：增加西装外套，提升正式感`;
  }
}
