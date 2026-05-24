import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ViewController {

  @Get(['/', '*'])
  @Render('index')
  async render() {
    // 简化版本 - 不需要飞书平台数据
    return {
      __platform__: '{}',
    };
  }
}
