import { ContentRequest, ContentIdea } from '@/components/ContentGenerator';

// AI Models configuration
export const AI_MODELS = {
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

export interface AIConfig {
  provider: 'openai' | 'gemini';
  model: string;
  apiKey: string;
}

// Mock data for development
const MOCK_IDEAS: ContentIdea[] = [
  {
    id: '1',
    title: 'Bí Mật Đằng Sau Việc Mua Hàng Hàn Quốc Giá Rẻ',
    objective: 'Tăng nhận thức về dịch vụ mua hộ Hàn Quốc',
    targetSegment: 'Cá nhân yêu thích K-beauty và thời trang Hàn',
    coreContent: 'Video TikTok ngắn kể chuyện một cô gái tìm được secret source để mua mỹ phẩm Hàn authentic với giá gốc...',
    insight: 'Nỗi đau về hàng giả và giá đội cao khi mua mỹ phẩm Hàn',
    cta: 'DM ngay để được tư vấn miễn phí',
    channelFormat: 'TikTok Video (30s)'
  },
  {
    id: '2', 
    title: 'Tại Sao Shop Nhỏ Lại Cần Đối Tác Logistics Quốc Tế?',
    objective: 'Thúc đẩy cân nhắc từ chủ shop SME',
    targetSegment: 'Chủ shop online muốn mở rộng nguồn hàng',
    coreContent: 'Bài viết blog phân tích chi phí và lợi ích khi có đối tác logistics chuyên nghiệp...',
    insight: 'Lo ngại về chi phí và độ phức tạp khi nhập hàng quốc tế',
    cta: 'Đăng ký nhận báo giá chi tiết',
    channelFormat: 'Blog Article (800 từ)'
  },
  {
    id: '3',
    title: 'Ngôn Ngữ Học Chết Tiệt - Drama Order Đồ Nhật',
    objective: 'Viral awareness về khó khăn ngôn ngữ',
    targetSegment: 'Gen Z yêu thích văn hóa Nhật Bản',
    coreContent: 'Video hài hước về những tình huống "khóc dở mếu dở" khi tự order đồ Nhật...',
    insight: 'Nỗi sợ về rào cản ngôn ngữ và thủ tục phức tạp',
    cta: 'Tag bạn bè từng gặp tình huống này',
    channelFormat: 'TikTok/Reel Viral (15s)'
  }
];

export class AIService {
  private config: AIConfig | null = null;

  setConfig(config: AIConfig) {
    this.config = config;
  }

  async generateContentIdeas(request: ContentRequest): Promise<ContentIdea[]> {
    if (!this.config?.apiKey) {
      throw new Error('Vui lòng cấu hình API key trong phần Settings trước');
    }

    const prompt = this.buildIdeaGenerationPrompt(request);
    
    try {
      if (this.config.provider === 'openai') {
        return await this.callOpenAI(prompt, 'ideas');
      } else {
        return await this.callGemini(prompt, 'ideas');
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Không thể tạo ý tưởng nội dung. Vui lòng thử lại.');
    }
  }

  async generateDetailedContent(idea: ContentIdea, request: ContentRequest): Promise<string> {
    if (!this.config?.apiKey) {
      throw new Error('Vui lòng cấu hình API key trong phần Settings trước');
    }

    const prompt = this.buildDetailedContentPrompt(idea, request);
    
    try {
      if (this.config.provider === 'openai') {
        return await this.callOpenAI(prompt, 'content');
      } else {
        return await this.callGemini(prompt, 'content');
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Không thể tạo nội dung chi tiết. Vui lòng thử lại.');
    }
  }

  private async callOpenAI(prompt: string, type: 'ideas' | 'content'): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config!.model,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia Content Marketing cho Tiximax, chuyên tạo nội dung logistics và e-commerce.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: type === 'ideas' ? 2000 : 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (type === 'ideas') {
      return this.parseIdeasFromResponse(content);
    } else {
      return content;
    }
  }

  private async callGemini(prompt: string, type: 'ideas' | 'content'): Promise<any> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config!.model}:generateContent?key=${this.config!.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: type === 'ideas' ? 2000 : 4000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    if (type === 'ideas') {
      return this.parseIdeasFromResponse(content);
    } else {
      return content;
    }
  }

  private buildIdeaGenerationPrompt(request: ContentRequest): string {
    return `
Dựa trên thông tin sau về Tiximax (dịch vụ mua hộ và vận chuyển quốc tế từ Indonesia, Nhật, Hàn, Mỹ về Việt Nam):

**Yêu cầu nội dung:**
- Mục tiêu: ${request.objective}
- Giai đoạn khách hàng: ${request.stage}
- Kênh truyền thông: ${request.channel}
- Định dạng: ${request.format}
- Độ dài: ${request.length}
- Giọng điệu: ${request.tone.join(', ')}
- Từ khóa: ${request.keywords.join(', ')}
- Loại trừ: ${request.exclusions.join(', ')}
- Ưu đãi: ${request.promotion || 'Không có'}
- CTA: ${request.cta || 'Tùy chọn'}

Hãy tạo 3-5 ý tưởng nội dung cho Tiximax, mỗi ý tưởng bao gồm:
1. **Tiêu đề**: (Hấp dẫn, khơi gợi)
2. **Mục tiêu**: (Rõ ràng, cụ thể)
3. **Đối tượng**: (Cá nhân hay SME/chủ shop)
4. **Nội dung cốt lõi**: (Thông điệp chính, tình huống)
5. **Insight**: (Nỗi đau hoặc mong muốn được khai thác)
6. **CTA**: (Kêu gọi hành động cụ thể)
7. **Định dạng phù hợp**: (Channel + format)

Trả về dưới dạng JSON array với format:
[{
  "id": "1",
  "title": "...",
  "objective": "...",
  "targetSegment": "...",
  "coreContent": "...",
  "insight": "...",
  "cta": "...",
  "channelFormat": "..."
}]
`;
  }

  private buildDetailedContentPrompt(idea: ContentIdea, request: ContentRequest): string {
    const isWebsiteBlog = request.channel.toLowerCase().includes('website') || 
                         request.channel.toLowerCase().includes('blog') ||
                         request.format.toLowerCase().includes('blog');

    if (isWebsiteBlog) {
      return this.buildBlogContentPrompt(idea, request);
    }

    return `
Dựa trên ý tưởng nội dung sau cho Tiximax:

**Ý tưởng đã chọn:**
- Tiêu đề: ${idea.title}
- Mục tiêu: ${idea.objective}
- Đối tượng: ${idea.targetSegment}
- Insight: ${idea.insight}
- Định dạng: ${idea.channelFormat}

**Yêu cầu chi tiết:**
- Độ dài: ${request.length}
- Giọng điệu: ${request.tone.join(', ')}
- Từ khóa phải có: ${request.keywords.join(', ')}
- Ưu đãi: ${request.promotion || 'Không có'}
- CTA: ${request.cta || idea.cta}

Hãy viết nội dung hoàn chỉnh theo cấu trúc:

1. **Hook** (Câu mở đầu hấp dẫn)
2. **Vấn đề** (Pain Points của khách hàng)
3. **Giải pháp** (Tiximax Solution)
4. **Thông tin bổ trợ** (Số liệu, cam kết, lợi ích)
5. **Call to Action** (Kêu gọi hành động mạnh mẽ)

Văn phong phải tự nhiên, dễ đọi, phù hợp với ${request.channel} và ${request.format}.
`;
  }

  private buildBlogContentPrompt(idea: ContentIdea, request: ContentRequest): string {
    const isExpertSEO = request.length === 'seo-expert' || request.format.toLowerCase().includes('seo 2000+');
    
    if (isExpertSEO) {
      return `
Bạn là CHUYÊN GIA SEO TOP GOOGLE HÀNG ĐẦU với 20 NĂM KINH NGHIỆM trong việc viết blog website ranking #1 trên Google.

Tôi cần bạn viết một bài blog CỰC KỲ CHUYÊN NGHIỆP, dài 2000+ từ cho Tiximax (dịch vụ mua hộ & vận chuyển quốc tế từ Indonesia, Nhật, Hàn, Mỹ về Việt Nam):

**Thông tin ý tưởng:**
- Tiêu đề: ${idea.title}
- Mục tiêu: ${idea.objective}
- Đối tượng: ${idea.targetSegment}
- Insight khách hàng: ${idea.insight}

**Yêu cầu SEO EXPERT:**
- Độ dài: TỐI THIỂU 2000 từ (không ít hơn)
- Giọng điệu: ${request.tone.join(', ')}
- Từ khóa SEO chính: ${request.keywords.join(', ')}
- Ưu đãi: ${request.promotion || 'Không có'}
- CTA mục tiêu: ${request.cta || idea.cta}

**VIẾT BÀI BLOG CHUẨN SEO EXPERT LEVEL:**

# [Tiêu đề SEO-Optimized với từ khóa chính - Long-tail keywords]

*Meta Description: [Viết meta description 150-160 ký tự hấp dẫn với từ khóa chính]*

## Mở bài (Introduction) - 200 từ
- Hook cực kỳ hấp dẫn (số liệu shock, câu hỏi đau điểm, tình huống viral)
- Tóm tắt vấn đề và pain points
- Promise rõ ràng về giá trị bài viết
- Chèn từ khóa chính tự nhiên

## Mục lục (Table of Contents)
[Liệt kê chi tiết tất cả sections với anchor links]

## 1. Thực trạng thị trường và vấn đề cốt lõi (300-400 từ)
- Phân tích sâu thị trường mua hộ quốc tế tại Việt Nam
- Số liệu thống kê cụ thể (tỷ lệ %, doanh số, khảo sát)
- Pain points chi tiết từ khảo sát thực tế
- Case study thất bại điển hình
- **[CTA nhẹ giữa bài: "Tìm hiểu giải pháp hiệu quả"]**

## 2. Phân tích nguyên nhân sâu xa (350-400 từ)
- Root cause analysis từ 5 góc độ
- Rào cản ngôn ngữ và văn hóa
- Vấn đề pháp lý và thủ tục hải quan
- Chi phí ẩn và minh bạch
- Reliability và timing issues
- So sánh với thị trường quốc tế (Singapore, Malaysia)

## 3. Giải pháp toàn diện và competitive advantages (400-500 từ)
- Giới thiệu Tiximax với USP rõ ràng
- So sánh chi tiết với 3-4 competitors lớn (bảng so sánh)
- Pricing transparency với breakdown chi phí
- Technology stack và tracking system
- Quality assurance process
- Customer service model

## 4. Hướng dẫn sử dụng dịch vụ A-Z (400-500 từ)
- Step-by-step guide với screenshots
- Tips để tối ưu chi phí và thời gian
- Những lưu ý quan trọng cho từng thị trường (Nhật, Hàn, Indonesia, Mỹ)
- Best practices từ expert team
- Common mistakes và cách tránh

## 5. Case Studies thực tế và ROI Analysis (300-400 từ)
- 3-4 case studies chi tiết với số liệu cụ thể
- ROI calculation cho từng segment khách hàng
- Testimonials với tên thật và business cụ thể
- Before/After comparison rõ ràng
- Impact measurement và success metrics

## 6. Advanced Tips cho Power Users (200-300 từ)
- Pro tips cho bulk orders
- Seasonal timing optimization
- Currency exchange strategies
- Tax implications và legal compliance
- Scaling strategies cho businesses

## 7. FAQ chuyên sâu (300-400 từ)
- 8-10 câu hỏi phức tạp từ thực tế
- Trả lời chi tiết với legal backing
- Links tới resources và guidelines
- Troubleshooting common issues

## 8. Xu hướng tương lai và strategic insights (200-300 từ)
- Market trend analysis 2024-2025
- Technology evolution (AI, blockchain)
- Regulatory changes impact
- Opportunities và challenges

## Kết luận và Call-to-Action mạnh mẽ (150-200 từ)
- Recap key takeaways
- ROI promise cụ thể
- Multiple CTAs cho different customer segments
- Contact information và channels
- Limited-time offer/bonus

## Additional Resources (100 từ)
- Related articles internal linking
- External authority links
- Tools và calculators
- Downloads và templates

**TECHNICAL SEO REQUIREMENTS:**
🎯 Keyword density: 1-2% cho primary keyword
🎯 LSI keywords: Sử dụng 15-20 related keywords tự nhiên
🎯 Heading structure: Proper H1, H2, H3 hierarchy
🎯 Internal links: 5-8 links tới related content
🎯 External links: 3-5 authority links
🎯 Image suggestions: 8-10 images với alt text
🎯 Schema markup: FAQ, Article, Organization
🎯 Mobile optimization: Tối ưu cho mobile reading

**CONTENT QUALITY STANDARDS:**
✅ Expertise: Thể hiện deep knowledge với data cụ thể
✅ Authority: Cite sources và industry reports
✅ Trustworthiness: Transparency và honest approach
✅ User Intent: Giải quyết hoàn toàn search intent
✅ Uniqueness: Góc nhìn độc đáo với insights mới
✅ Actionability: Practical steps người đọc có thể thực hiện
✅ Comprehensiveness: Cover tất cả aspects của topic

**WRITING STYLE EXPERT:**
🔥 Hook readers với controversy hoặc surprising facts
🔥 Sử dụng power words và emotional triggers
🔥 Bullet points và numbered lists cho scannability
🔥 Bold/italic cho key points và statistics
🔥 Short paragraphs (2-3 sentences) cho mobile UX
🔥 Conversational tone nhưng professional
🔥 Storytelling elements với real scenarios
🔥 Data-driven arguments với credible sources

LƯU Ý QUAN TRỌNG: Bài viết PHẢI đạt tối thiểu 2000 từ và thể hiện level chuyên gia SEO hàng đầu!
`;
    }

    return `
Bạn là CHUYÊN GIA CONTENT MARKETING 20 NĂM KINH NGHIỆM chuyên viết blog website chuyên nghiệp.

Dựa trên ý tưởng cho Tiximax (dịch vụ mua hộ & vận chuyển quốc tế từ Indonesia, Nhật, Hàn, Mỹ về Việt Nam):

**Thông tin ý tưởng:**
- Tiêu đề: ${idea.title}
- Mục tiêu: ${idea.objective}
- Đối tượng: ${idea.targetSegment}
- Insight khách hàng: ${idea.insight}

**Yêu cầu bài blog:**
- Độ dài: ${request.length}
- Giọng điệu: ${request.tone.join(', ')}
- Từ khóa SEO: ${request.keywords.join(', ')}
- Ưu đãi (nếu có): ${request.promotion || 'Không có'}
- CTA mục tiêu: ${request.cta || idea.cta}

**VIẾT BÀI BLOG WEBSITE CHUẨN CHUYÊN NGHIỆP theo cấu trúc:**

# [SEO-Optimized Title với từ khóa chính]

## Mở bài (Introduction)
- Hook hấp dẫn (thống kê, câu hỏi, tình huống)
- Overview vấn đề chính
- Promise về giá trị bài viết mang lại

## Mục lục (Table of Contents) 
[Liệt kê các phần chính trong bài]

## 1. Vấn đề cốt lõi (Core Problem)
- Phân tích sâu pain points của khách hàng
- Số liệu, thống kê minh chứng
- Case study/ví dụ thực tế

## 2. Phân tích nguyên nhân (Root Cause Analysis)
- Tại sao vấn đề này tồn tại
- Các yếu tố ảnh hưởng
- Rủi ro nếu không giải quyết

## 3. Giải pháp toàn diện (Comprehensive Solution)
- Giới thiệu giải pháp Tiximax
- So sánh với các phương án khác
- Lợi ích cụ thể cho từng đối tượng

## 4. Hướng dẫn thực hiện (Step-by-Step Guide)
- Quy trình chi tiết từ A-Z
- Tips và lưu ý quan trọng
- Kinh nghiệm thực tế

## 5. Case Study và Testimonial
- Câu chuyện thành công thực tế
- Số liệu minh chứng ROI/hiệu quả
- Feedback từ khách hàng

## 6. FAQ (Những câu hỏi thường gặp)
- 5-7 câu hỏi phổ biến nhất
- Trả lời chi tiết, thực tế
- Liên kết với dịch vụ Tiximax

## Kết luận và Call-to-Action
- Tóm tắt những điểm chính
- Khuyến khích hành động cụ thể
- Thông tin liên hệ rõ ràng

**YÊU CẦU WRITING STYLE:**
✅ Văn phong chuyên nghiệp nhưng dễ hiểu
✅ Sử dụng heading structure chuẩn SEO (H1, H2, H3)
✅ Tích hợp từ khóa tự nhiên
✅ Bullet points và numbered lists
✅ Bold/italic để nhấn mạnh
✅ Độ dài đoạn văn 2-4 câu
✅ Chèn CTA nhẹ ở giữa bài
✅ Meta description suggestions cuối bài

**TUYỆT ĐỐI TRÁNH:**
❌ Viết như social media post
❌ Quá nhiều emoji
❌ Câu văn quá ngắn, thiếu chiều sâu
❌ Thiếu cấu trúc logic
❌ Không có data/số liệu minh chứng
❌ CTA quá agressive hoặc quá spam
`;
  }

  private parseIdeasFromResponse(content: string): ContentIdea[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    // Fallback to mock data if parsing fails
    return MOCK_IDEAS;
  }

  private getMockDetailedContent(idea: ContentIdea): string {
    return `
# ${idea.title}

## Hook (Câu mở đầu hấp dẫn)
Bạn có biết rằng 90% người Việt mua hàng quốc tế online đều gặp phải ít nhất 1 trong 3 vấn đề này không?

## Vấn đề (Pain Points)
❌ Hàng giả tràn lan, không biết nguồn nào tin được
❌ Giá bị đội lên gấp 2-3 lần so với giá gốc 
❌ Thời gian chờ đợi quá lâu, không rõ hàng về khi nào

## Giải pháp (Tiximax Solution)
✅ **Nguồn gốc 100% chính hãng**: Mua trực tiếp từ các cửa hàng uy tín
✅ **Giá gốc + phí dịch vụ minh bạch**: Tiết kiệm 40-60% so với mua trong nước  
✅ **Theo dõi real-time**: Biết chính xác hàng đang ở đâu, về khi nào

## Thông tin bổ trợ
📊 **Số liệu thực tế**: Tiximax đã hỗ trợ 10,000+ đơn hàng với tỷ lệ hài lòng 98.5%
🏆 **Cam kết**: Hoàn tiền 100% nếu hàng không đúng như mô tả

## Call to Action
💬 **DM ngay để được tư vấn miễn phí** về dịch vụ mua hộ!
🎁 **Ưu đãi đặc biệt**: Giảm 30% phí dịch vụ cho 100 khách hàng đầu tiên!

#TiximaxLogistics #MuaHoQuocTe #ShipHangNuocNgoai
`;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config?.apiKey) {
      return { success: false, message: 'Chưa cấu hình API key' };
    }

    try {
      const testPrompt = 'Hello, this is a test message.';
      
      if (this.config.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 10
          }),
        });

        if (response.ok) {
          return { success: true, message: `Kết nối thành công với ${AI_MODELS.openai[this.config.model as keyof typeof AI_MODELS.openai]}` };
        } else {
          return { success: false, message: `OpenAI API Error: ${response.status}` };
        }
      } else {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
            generationConfig: { maxOutputTokens: 10 }
          }),
        });

        if (response.ok) {
          return { success: true, message: `Kết nối thành công với ${AI_MODELS.gemini[this.config.model as keyof typeof AI_MODELS.gemini]}` };
        } else {
          return { success: false, message: `Gemini API Error: ${response.status}` };
        }
      }
    } catch (error) {
      return { success: false, message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async generateContentImage(prompt: string): Promise<string> {
    if (!this.config?.apiKey) {
      throw new Error('Vui lòng cấu hình API key trong phần Settings trước');
    }

    if (this.config.provider !== 'openai') {
      throw new Error('Tạo ảnh chỉ hỗ trợ với OpenAI');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create a professional image for content marketing: ${prompt}. Make it visually appealing, modern, and suitable for logistics/e-commerce business.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Image API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Không thể tạo ảnh. Vui lòng thử lại.');
    }
  }

  async generateBulkContent(ideas: ContentIdea[], request: ContentRequest): Promise<{ [key: string]: string }> {
    if (!this.config?.apiKey) {
      throw new Error('Vui lòng cấu hình API key trong phần Settings trước');
    }

    const results: { [key: string]: string } = {};
    
    // Tạo tất cả content đồng loạt với Promise.all
    const contentPromises = ideas.map(async (idea) => {
      try {
        const content = await this.generateDetailedContent(idea, request);
        return { id: idea.id, content };
      } catch (error) {
        console.error(`Failed to generate content for idea ${idea.id}:`, error);
        return { id: idea.id, content: `Lỗi tạo nội dung: ${error instanceof Error ? error.message : 'Unknown error'}` };
      }
    });

    const contentResults = await Promise.all(contentPromises);
    
    // Gộp kết quả vào object
    contentResults.forEach(result => {
      results[result.id] = result.content;
    });

    return results;
  }
}

export const aiService = new AIService();