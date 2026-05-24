// ---- plugin:virtual_outfit_generation_1 ----
// ============================================================
// 插件 virtual_outfit_generation_1 (虚拟换装生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface VirtualOutfitGenerationOneInput {
  /** 用户自拍照 */
  personImage: string[];
  /** 穿搭照 */
  clothingImage: string[];
}

/**
 * capabilityClient.load('virtual_outfit_generation_1').call<VirtualOutfitGenerationOneOutput>('imageToImage', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { images } = result;
 */
export interface VirtualOutfitGenerationOneOutput {
  /** [object Object] */
  images: string[];
}
// ---- end:virtual_outfit_generation_1 ----

// ---- plugin:outfit_suggestion_generate_1 ----
// ============================================================
// 插件 outfit_suggestion_generate_1 (穿搭建议生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface OutfitSuggestionGenerateOneInput {
  /** 用户穿搭需求描述，如场合、偏好、季节等信息 */
  user_demand: string;
}

/**
 * capabilityClient.load('outfit_suggestion_generate_1').call<OutfitSuggestionGenerateOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface OutfitSuggestionGenerateOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:outfit_suggestion_generate_1 ----