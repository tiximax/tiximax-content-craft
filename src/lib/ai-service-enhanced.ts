import { ContentRequest, ContentIdea } from '@/components/ContentGenerator';
import { ChannelConfig, getChannelConfigByName } from '@/types/channel-config';

// Enhanced AI Models configuration với dual provider support
export const AI_MODELS_ENHANCED = {
  openai: {
    'gpt-4.1-2025-04-14': 'GPT-4.1 (Latest)',
    'o4-mini-2025-04-16': 'o4-mini (Fast Reasoning)',
    'gpt-4o': 'GPT-4o (Vision)',
    'gpt-4.1-mini-2025-04-14': 'GPT-4.1 Mini'
  },
  gemini: {
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental)',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash'
  }
};

export interface EnhancedAIConfig {
  researchProvider: 'gemini';
  contentProvider: 'openai';
  geminiApiKey: string;
  openaiApiKey: string;
  geminiModel: string;
  openaiModel: string;
}

interface MarketInsight {
  trending_products: string[];
  popular_keywords_related_to_shipping: string[];
  current_sales_events: Array<{
    name: string;
    country: string;
    dates: string;
  }>;
  common_pain_points_from_new_data: string[];
  market_opportunities: string[];
}

interface EnhancedContentOutput {
  content_type: string;
  channel_selected: string;
  channel_config_applied: ChannelConfig | null;
  market_insights_used: MarketInsight;
  // For Social Media Post
  title_suggestions?: string[];
  body_content?: string;
  call_to_action?: string;
  hashtags?: string[];
  suggested_visuals_notes?: string;
  tone_applied?: string;
  notes_for_user?: string;
  // For Video Script  
  video_title_idea?: string;
  video_duration_seconds?: number;
  target_audience_focus?: string;
  tone_of_voice_script?: string;
  script_scenes?: Array<{
    scene_id: string;
    duration_seconds: number;
    visual_description: string;
    audio_description: string;
    voice_over_vietnamese: string;
    text_overlay: string;
    final_visual_overlay?: string;
  }>;
  call_to_action_script?: string;
  suggested_hashtags?: string[];
  // For Blog Post
  title?: string;
  outline?: {
    introduction: string;
    [key: string]: string;
  };
  full_content_draft?: string;
  keywords_for_seo?: string[];
  meta_description?: string;
}

export class EnhancedAIService {
  private config: EnhancedAIConfig | null = null;

  setConfig(config: EnhancedAIConfig) {
    this.config = config;
  }

  async generateContentIdeasWithInsights(
    request: ContentRequest, 
    onProgress?: (stage: string) => void
  ): Promise<ContentIdea[]> {
    if (!this.config?.geminiApiKey || !this.config?.openaiApiKey) {
      throw new Error('Vui lòng cấu hình đầy đủ API keys cho cả Gemini và OpenAI trong phần Settings');
    }

    // Step 1: Gemini nghiên cứu thị trường
    onProgress?.('🔍 Gemini đang nghiên cứu xu hướng thị trường...');
    const marketInsights = await this.getMarketInsightsFromGemini(request);
    
    // Step 2: OpenAI sáng tạo ý tưởng dựa trên insights + channel config
    onProgress?.('💡 OpenAI đang tạo ý tưởng dựa trên insights...');
    const channelConfig = getChannelConfigByName(request.channel);
    const ideas = await this.generateIdeasWithOpenAI(request, marketInsights, channelConfig);
    
    onProgress?.('✅ Hoàn tất phân tích và tạo ý tưởng!');
    return ideas;
  }

  async generateEnhancedDetailedContent(
    idea: ContentIdea, 
    request: ContentRequest,
    onProgress?: (stage: string) => void
  ): Promise<EnhancedContentOutput> {
    if (!this.config?.geminiApiKey || !this.config?.openaiApiKey) {
      throw new Error('Vui lòng cấu hình đầy đủ API keys cho cả Gemini và OpenAI');
    }

    // Step 1: Gemini cập nhật insights mới nhất cho idea cụ thể
    onProgress?.('🎯 Gemini đang nghiên cứu insights cho ý tưởng cụ thể...');
    const specificInsights = await this.getSpecificInsightsFromGemini(idea, request);
    
    // Step 2: OpenAI tạo nội dung với format chuẩn
    onProgress?.('✍️ OpenAI đang tạo nội dung theo chuẩn chuyên gia...');
    const channelConfig = getChannelConfigByName(request.channel);
    const enhancedContent = await this.createEnhancedContentWithOpenAI(idea, request, specificInsights, channelConfig);
    
    onProgress?.('🎨 Đang tối ưu nội dung theo cấu hình kênh...');
    return enhancedContent;
  }

  async generateBulkEnhancedContent(ideas: ContentIdea[], request: ContentRequest): Promise<{ [key: string]: EnhancedContentOutput }> {
    if (!this.config?.geminiApiKey || !this.config?.openaiApiKey) {
      throw new Error('Vui lòng cấu hình đầy đủ API keys');
    }

    const results: { [key: string]: EnhancedContentOutput } = {};
    
    // Chạy song song để tối ưu performance
    const promises = ideas.map(async (idea) => {
      try {
        const content = await this.generateEnhancedDetailedContent(idea, request);
        return { ideaId: idea.id, content };
      } catch (error) {
        console.error(`Error generating content for idea ${idea.id}:`, error);
        return null;
      }
    });

    const resolvedPromises = await Promise.all(promises);
    
    resolvedPromises.forEach((result) => {
      if (result) {
        results[result.ideaId] = result.content;
      }
    });

    return results;
  }

  private async getMarketInsightsFromGemini(request: ContentRequest): Promise<MarketInsight> {
    const prompt = `
Bạn là Nhà Nghiên cứu Thị trường và Tổng hợp Dữ liệu Thông minh cho Tiximax (dịch vụ mua hộ & vận chuyển quốc tế).

Dựa trên yêu cầu nội dung này:
- Kênh: ${request.channel}
- Định dạng: ${request.format}
- Từ khóa: ${request.keywords.join(', ')}
- Mục tiêu: ${request.objective}

Hãy nghiên cứu và cung cấp insights thị trường mới nhất dưới dạng JSON:

{
  "trending_products": ["Sản phẩm hot hiện tại từ Nhật/Hàn/Mỹ/Indo mà khách VN quan tâm"],
  "popular_keywords_related_to_shipping": ["Từ khóa tìm kiếm phổ biến về logistics quốc tế"],
  "current_sales_events": [{"name": "Tên event", "country": "Quốc gia", "dates": "Thời gian"}],
  "common_pain_points_from_new_data": ["Pain points gần đây từ customer feedback"],
  "market_opportunities": ["Cơ hội thị trường mới phát hiện"]
}

Focus vào xu hướng mua sắm quốc tế, vấn đề logistics, và opportunity cho Tiximax.
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config!.geminiModel}:generateContent?key=${this.config!.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
        }),
      });

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
    }
    
    // Fallback insights
    return {
      trending_products: ['K-beauty skincare', 'Gaming gear từ Nhật', 'Fashion Hàn Quốc'],
      popular_keywords_related_to_shipping: ['ship hàng nhanh', 'phí ship rẻ', 'mua hộ uy tín'],
      current_sales_events: [{ name: 'Black Friday', country: 'US', dates: 'November 2024' }],
      common_pain_points_from_new_data: ['Phí phát sinh không rõ ràng', 'Thời gian giao hàng lâu'],
      market_opportunities: ['Tăng nhu cầu mua hàng Hàn Quốc', 'Gaming market expansion']
    };
  }

  private async getSpecificInsightsFromGemini(idea: ContentIdea, request: ContentRequest): Promise<MarketInsight> {
    const prompt = `
Nghiên cứu sâu hơn cho ý tưởng nội dung cụ thể: "${idea.title}"

Target segment: ${idea.targetSegment}
Core content: ${idea.coreContent}
Insight đang khai thác: ${idea.insight}

Cung cấp insights bổ sung dưới dạng JSON:
{
  "trending_products": ["Sản phẩm cụ thể liên quan đến ý tưởng này"],
  "popular_keywords_related_to_shipping": ["Keywords phù hợp với target segment"],
  "current_sales_events": [{"name": "Event phù hợp", "country": "Quốc gia", "dates": "Timing"}],
  "common_pain_points_from_new_data": ["Pain points cụ thể cho segment này"],
  "market_opportunities": ["Opportunity cụ thể từ ý tưởng này"]
}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config!.geminiModel}:generateContent?key=${this.config!.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        }),
      });

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Gemini specific insights error:', error);
    }

    return await this.getMarketInsightsFromGemini(request);
  }

  private async generateIdeasWithOpenAI(request: ContentRequest, insights: MarketInsight, channelConfig: ChannelConfig | null): Promise<ContentIdea[]> {
    const channelConfigText = channelConfig ? JSON.stringify(channelConfig, null, 2) : 'Không có cấu hình kênh cụ thể';
    
    const prompt = `
Bạn là Chuyên gia Content Marketing 20 năm kinh nghiệm cho Tiximax.

**KIẾN THỨC NỀN TẢNG TIXIMAX:**
- USP: Dịch vụ mua hộ và vận chuyển quốc tế từ Indonesia, Nhật, Hàn, Mỹ về Việt Nam
- Đáng tin cậy, minh bạch, chuyên nghiệp
- Hỗ trợ cả cá nhân và SME/chủ shop

**INSIGHTS THỊ TRƯỜNG MỚI NHẤT:**
${JSON.stringify(insights, null, 2)}

**CẤU HÌNH KÊNH:**
${channelConfigText}

**YÊU CẦU NỘI DUNG:**
- Mục tiêu: ${request.objective}
- Giai đoạn: ${request.stage}
- Kênh: ${request.channel}
- Định dạng: ${request.format}
- Từ khóa: ${request.keywords.join(', ')}

Áp dụng quy trình 15 bước Content Marketing và cấu hình kênh để tạo 4-5 ý tưởng nội dung.

Trả về JSON array:
[{
  "id": "1",
  "title": "Tiêu đề hấp dẫn",
  "objective": "Mục tiêu rõ ràng",
  "targetSegment": "Segment cụ thể",
  "coreContent": "Nội dung cốt lõi phù hợp kênh",
  "insight": "Insight được khai thác",
  "cta": "CTA phù hợp kênh",
  "channelFormat": "Channel + format"
}]
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config!.openaiModel,
        messages: [
          { role: 'system', content: 'Bạn là Chuyên gia Content Marketing cho Tiximax với 20 năm kinh nghiệm.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse OpenAI ideas response:', error);
    }
    
    // Fallback ideas
    return [
      {
        id: '1',
        title: 'Bí Mật Order Hàng Quốc Tế Không Hề Khó',
        objective: request.objective,
        targetSegment: 'Người mới bắt đầu order hàng quốc tế',
        coreContent: 'Video hướng dẫn step-by-step order hàng với Tiximax',
        insight: 'Nỗi lo về độ phức tạp và rủi ro khi order hàng quốc tế',
        cta: 'Inbox ngay để được hỗ trợ order đầu tiên',
        channelFormat: request.channel
      }
    ];
  }

  private async createEnhancedContentWithOpenAI(
    idea: ContentIdea, 
    request: ContentRequest, 
    insights: MarketInsight, 
    channelConfig: ChannelConfig | null
  ): Promise<EnhancedContentOutput> {
    const isVideo = request.format.toLowerCase().includes('video') || 
                   request.channel.toLowerCase().includes('tiktok') ||
                   request.channel.toLowerCase().includes('youtube');
    
    const isBlog = request.format.toLowerCase().includes('blog') || 
                  request.channel.toLowerCase().includes('website');

    const channelConfigText = channelConfig ? JSON.stringify(channelConfig, null, 2) : 'Không có cấu hình kênh cụ thể';
    
    let prompt = '';
    
    if (isVideo) {
      prompt = `
Bạn là CHUYÊN GIA CONTENT MARKETING 20 NĂM KINH NGHIỆM, chuyên tạo kịch bản video viral.

**ÝT TƯỞNG ĐÃ CHỌN:**
${JSON.stringify(idea, null, 2)}

**INSIGHTS THỊ TRƯỜNG:**
${JSON.stringify(insights, null, 2)}

**CẤU HÌNH KÊNH:**
${channelConfigText}

**YÊU CẦU:**
- Từ khóa: ${request.keywords.join(', ')}
- Tone: ${request.tone.join(', ')}
- CTA: ${request.cta || idea.cta}

VIẾT KỊCH BẢN VIDEO theo format JSON:
{
  "content_type": "Video Script",
  "channel_selected": "${request.channel}",
  "video_title_idea": "Tiêu đề video viral",
  "video_duration_seconds": ${channelConfig?.key_characteristics.content_length_guideline.includes('8') ? 8 : 15},
  "target_audience_focus": "${idea.targetSegment}",
  "tone_of_voice_script": "Tone phù hợp kênh",
  "script_scenes": [
    {
      "scene_id": "SCENE_1",
      "duration_seconds": 2,
      "visual_description": "Mô tả visual chi tiết",
      "audio_description": "Nhạc nền và hiệu ứng",
      "voice_over_vietnamese": "Lời thoại Việt",
      "text_overlay": "Text hiển thị trên màn hình"
    }
  ],
  "call_to_action_script": "CTA mạnh mẽ",
  "suggested_hashtags": ["#Tiximax", "#Trending"],
  "notes_for_user": "Lưu ý khi quay"
}
`;
    } else if (isBlog) {
      const isExpertSEO = request.length === 'seo-expert' || request.format.includes('2000+');
      
      if (isExpertSEO) {
        prompt = `
Bạn là CHUYÊN GIA SEO TOP GOOGLE HÀNG ĐẦU với 20 NĂM KINH NGHIỆM.

**YÊU CẦU VIẾT BLOG 2000+ TỪ:**
${JSON.stringify(idea, null, 2)}

**INSIGHTS THỊ TRƯỜNG:**
${JSON.stringify(insights, null, 2)}

**CẤU HÌNH KÊNH:**
${channelConfigText}

VIẾT BÀI BLOG CHUẨN SEO EXPERT theo format JSON:
{
  "content_type": "Blog Post SEO Expert",
  "channel_selected": "${request.channel}",
  "title": "Tiêu đề SEO-optimized",
  "meta_description": "Meta description 150-160 ký tự",
  "outline": {
    "introduction": "Mở bài hook",
    "section_1": "Phần 1...",
    "conclusion": "Kết luận"
  },
  "full_content_draft": "BÀI BLOG ĐẦY ĐỦ 2000+ TỪ với:\n\n# Tiêu đề SEO\n\n## Mở bài (200 từ)...\n\n## Nội dung chính...\n\n## Kết luận và CTA",
  "keywords_for_seo": ["primary keyword", "secondary keywords"],
  "call_to_action": "CTA mạnh mẽ",
  "notes_for_user": "SEO tips"
}

BÀI VIẾT PHẢI ĐẠT CHUẨN SEO EXPERT LEVEL VỚI TỐI THIỂU 2000 TỪ!
`;
      } else {
        prompt = `
Bạn là CHUYÊN GIA CONTENT MARKETING viết blog chuyên nghiệp.

**ÝT TƯỞNG:**
${JSON.stringify(idea, null, 2)}

**INSIGHTS:**
${JSON.stringify(insights, null, 2)}

VIẾT BÀI BLOG theo format JSON:
{
  "content_type": "Blog Post",
  "channel_selected": "${request.channel}",
  "title": "Tiêu đề blog",
  "full_content_draft": "Bài blog đầy đủ với cấu trúc chuyên nghiệp",
  "keywords_for_seo": ["keywords"],
  "call_to_action": "CTA"
}
`;
      }
    } else {
      // Social Media Post
      prompt = `
Bạn là CHUYÊN GIA CONTENT MARKETING cho Social Media.

**ÝT TƯỞNG:**
${JSON.stringify(idea, null, 2)}

**INSIGHTS:**
${JSON.stringify(insights, null, 2)}

**CẤU HÌNH KÊNH:**
${channelConfigText}

VIẾT BÀI POST theo format JSON:
{
  "content_type": "Social Media Post",
  "channel_selected": "${request.channel}",
  "title_suggestions": ["Tiêu đề 1", "Tiêu đề 2"],
  "body_content": "Nội dung bài post đầy đủ",
  "call_to_action": "CTA phù hợp kênh",
  "hashtags": ["#Tiximax", "#Trending"],
  "suggested_visuals_notes": "Gợi ý hình ảnh",
  "tone_applied": "Tone đã áp dụng",
  "notes_for_user": "Lưu ý đăng bài"
}
`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config!.openaiModel,
        messages: [
          { role: 'system', content: 'Bạn là Chuyên gia Content Marketing hàng đầu cho Tiximax.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: isVideo ? 3000 : (isBlog && request.length === 'seo-expert' ? 6000 : 4000)
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          channel_config_applied: channelConfig,
          market_insights_used: insights
        };
      }
    } catch (error) {
      console.error('Failed to parse enhanced content response:', error);
    }
    
    // Fallback response
    return {
      content_type: 'Social Media Post',
      channel_selected: request.channel,
      channel_config_applied: channelConfig,
      market_insights_used: insights,
      body_content: `Nội dung được tạo cho: ${idea.title}\n\n${idea.coreContent}`,
      call_to_action: idea.cta,
      tone_applied: request.tone.join(', ')
    };
  }
}

export const enhancedAIService = new EnhancedAIService();