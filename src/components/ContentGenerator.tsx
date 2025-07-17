import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Copy, Download, Settings } from 'lucide-react';
import { ContentForm } from './ContentForm';
import { ContentPreview } from './ContentPreview';
import { ApiSettings } from './ApiSettings';

export interface ContentRequest {
  objective: string;
  stage: string;
  channel: string;
  format: string;
  length: string;
  tone: string[];
  keywords: string[];
  exclusions: string[];
  promotion?: string;
  cta?: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  objective: string;
  targetSegment: string;
  coreContent: string;
  insight: string;
  cta: string;
  channelFormat: string;
}

export interface GeneratedContent {
  ideas: ContentIdea[];
  selectedContent?: string;
}

export const ContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [contentRequest, setContentRequest] = useState<ContentRequest | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  const handleFormSubmit = async (request: ContentRequest) => {
    setContentRequest(request);
    setIsGenerating(true);
    
    try {
      // Simulate AI generation - will be replaced with actual API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockIdeas: ContentIdea[] = [
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
        }
      ];
      
      setGeneratedContent({ ideas: mockIdeas });
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIdeaSelect = async (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setIsGenerating(true);
    
    try {
      // Simulate detailed content generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const detailedContent = `
# ${idea.title}

## Hook (Câu mở đầu hấp dẫn)
Bạn có biết rằng 90% người Việt mua mỹ phẩm Hàn Quốc online đều gặp phải ít nhất 1 trong 3 vấn đề này không?

## Vấn đề (Pain Points)
❌ Hàng giả tràn lan, không biết nguồn nào tin được
❌ Giá bị đội lên gấp 2-3 lần so với giá gốc tại Hàn
❌ Thời gian chờ đợi quá lâu, không rõ hàng về khi nào

## Giải pháp (Tiximax Solution)
✅ **Nguồn gốc 100% chính hãng**: Mua trực tiếp từ các cửa hàng uy tín tại Seoul
✅ **Giá gốc + phí dịch vụ minh bạch**: Tiết kiệm 40-60% so với mua trong nước  
✅ **Theo dõi real-time**: Biết chính xác hàng đang ở đâu, về khi nào

## Thông tin bổ trợ
📊 **Số liệu thực tế**: Tiximax đã hỗ trợ 10,000+ đơn hàng từ Hàn Quốc với tỷ lệ hài lòng 98.5%
🏆 **Cam kết**: Hoàn tiền 100% nếu hàng không đúng như mô tả

## Call to Action
💬 **DM ngay để được tư vấn miễn phí** về dịch vụ mua hộ Hàn Quốc!
🎁 **Ưu đãi đặc biệt**: Giảm 30% phí dịch vụ cho 100 khách hàng đầu tiên trong tháng này!

#TiximaxKorea #MuaHoHanQuoc #MyPhamHan #AuthenticKBeauty
      `;
      
      setGeneratedContent(prev => prev ? {
        ...prev,
        selectedContent: detailedContent
      } : null);
    } catch (error) {
      console.error('Error generating detailed content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Tiximax Content Generator
              </h1>
              <p className="text-lg opacity-90">
                AI-Powered Content Creation Tool for Logistics & E-commerce
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Multi-Platform
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Thiết lập nội dung
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Preview & Chỉnh sửa
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Cài đặt AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <ContentForm 
              onSubmit={handleFormSubmit}
              isLoading={isGenerating}
            />
          </TabsContent>

          <TabsContent value="preview">
            <ContentPreview
              contentRequest={contentRequest}
              generatedContent={generatedContent}
              selectedIdea={selectedIdea}
              isLoading={isGenerating}
              onIdeaSelect={handleIdeaSelect}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ApiSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};