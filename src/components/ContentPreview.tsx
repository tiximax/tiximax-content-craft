import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy, Download, Eye, Lightbulb, Target, Users, MessageSquare, ArrowRight, Image, Zap, Clock, Search, Cog, Palette, Wand2 } from 'lucide-react';
import { ContentRequest, ContentIdea, GeneratedContent } from './ContentGenerator';
import { ContentFeedback } from './ContentFeedback';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/lib/ai-service';
import { FeedbackSystem } from '@/lib/feedback-system';
import { ImagePromptGenerator, GeneratedImagePrompt, ImagePromptOptions } from '@/lib/image-prompt-generator';

interface ContentPreviewProps {
  contentRequest: ContentRequest | null;
  generatedContent: GeneratedContent | null;
  selectedIdea: ContentIdea | null;
  isLoading: boolean;
  onIdeaSelect: (idea: ContentIdea) => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentRequest,
  generatedContent,
  selectedIdea,
  isLoading,
  onIdeaSelect
}) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = React.useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = React.useState(false);
  const [bulkContent, setBulkContent] = React.useState<{ [key: string]: string }>({});
  const [showBulkResults, setShowBulkResults] = React.useState(false);
  const [loadingStage, setLoadingStage] = React.useState('');
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [imagePrompts, setImagePrompts] = React.useState<GeneratedImagePrompt[]>([]);
  const [showImagePrompts, setShowImagePrompts] = React.useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = React.useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    
    // Track analytics
    if (generatedContent?.selectedContent) {
      const contentId = `content_${Date.now()}`;
      FeedbackSystem.updateAnalytics(contentId, 'copy');
    }
    
    toast({
      title: "Đã sao chép!",
      description: "Nội dung đã được sao chép vào clipboard.",
    });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Track analytics
    if (generatedContent?.selectedContent) {
      const contentId = `content_${Date.now()}`;
      FeedbackSystem.updateAnalytics(contentId, 'download');
    }
    
    toast({
      title: "Đã tải xuống!",
      description: "File nội dung đã được tải về máy.",
    });
  };

  const handleGenerateImage = async () => {
    if (!selectedIdea) return;
    
    setIsGeneratingImage(true);
    try {
      const imagePrompt = `${selectedIdea.title} - ${selectedIdea.coreContent}`;
      const imageUrl = await aiService.generateContentImage(imagePrompt);
      setGeneratedImageUrl(imageUrl);
      
      toast({
        title: "Tạo ảnh thành công!",
        description: "Ảnh minh họa cho nội dung đã được tạo.",
      });
    } catch (error) {
      toast({
        title: "Lỗi tạo ảnh",
        description: error instanceof Error ? error.message : "Không thể tạo ảnh",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!generatedContent?.ideas || !contentRequest) return;
    
    setIsBulkGenerating(true);
    
    try {
      // Hiển thị trạng thái chi tiết
      const stages = [
        "Đang phân tích insights từ Gemini...",
        "Đang tạo nội dung với OpenAI...", 
        "Đang tối ưu theo cấu hình kênh...",
        "Đang kiểm tra chất lượng nội dung...",
        "Hoàn tất!"
      ];
      
      for (let i = 0; i < stages.length - 1; i++) {
        setLoadingStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const results = await aiService.generateBulkContent(generatedContent.ideas, contentRequest);
      setBulkContent(results);
      setShowBulkResults(true);
      setLoadingStage(stages[stages.length - 1]);
      
      toast({
        title: "Tạo nội dung đồng loạt thành công!",
        description: `Đã tạo ${Object.keys(results).length} nội dung hoàn thiện.`,
      });
    } catch (error) {
      toast({
        title: "Lỗi tạo nội dung đồng loạt",
        description: error instanceof Error ? error.message : "Không thể tạo nội dung",
        variant: "destructive"
      });
    } finally {
      setIsBulkGenerating(false);
      setLoadingStage('');
    }
  };

  const handleGenerateImagePrompts = async () => {
    if (!generatedContent?.selectedContent && !selectedIdea) return;
    
    setIsGeneratingPrompts(true);
    
    try {
      // Generate main prompt
      const mainPrompt = ImagePromptGenerator.generateImagePrompt(
        generatedContent?.selectedContent,
        selectedIdea || undefined,
        {
          style: 'professional',
          aspectRatio: '16:9',
          quality: 'high',
          brandColors: true
        }
      );

      // Generate variations for different use cases
      const variations = [
        // Social Media optimized
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'vibrant',
            aspectRatio: '1:1',
            quality: 'high',
            brandColors: true
          }
        ),
        // Story/Vertical optimized  
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'modern',
            aspectRatio: '9:16',
            quality: 'high',
            brandColors: true
          }
        ),
        // Blog/Website optimized
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'minimalist',
            aspectRatio: '16:9',
            quality: 'ultra',
            brandColors: false
          }
        )
      ];

      setImagePrompts([mainPrompt, ...variations]);
      setShowImagePrompts(true);
      
      toast({
        title: "Đã tạo prompt ảnh!",
        description: "Các prompt đã được tối ưu cho GenPark và Image4",
      });
    } catch (error) {
      toast({
        title: "Lỗi tạo prompt ảnh",
        description: error instanceof Error ? error.message : "Không thể tạo prompt",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  if (!contentRequest) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-card">
        <CardContent className="p-12 text-center">
          <Eye className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có nội dung để preview</h3>
          <p className="text-muted-foreground">
            Vui lòng điền thông tin ở tab "Thiết lập nội dung" trước để tạo nội dung.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Thông tin yêu cầu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mục tiêu</p>
              <Badge variant="outline">{contentRequest.objective}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giai đoạn</p>
              <Badge variant="outline">{contentRequest.stage}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kênh</p>
              <Badge variant="outline">{contentRequest.channel}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Định dạng</p>
              <Badge variant="outline">{contentRequest.format}</Badge>
            </div>
          </div>
          
          {contentRequest.keywords.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Từ khóa chiến lược</p>
              <div className="flex flex-wrap gap-2">
                {contentRequest.keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Ideas */}
      {generatedContent && !generatedContent.selectedContent && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Ý tưởng nội dung được đề xuất
                </CardTitle>
                <CardDescription>
                  AI đã phân tích insight khách hàng và đề xuất các ý tưởng phù hợp. Chọn một ý tưởng để tạo nội dung chi tiết.
                </CardDescription>
              </div>
              <Button 
                variant="hero"
                size="sm"
                onClick={handleBulkGenerate}
                disabled={isBulkGenerating || isLoading}
                className="px-4 py-2"
              >
                {isBulkGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Tạo đồng loạt
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.ideas.map((idea, index) => (
                <div 
                  key={idea.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onIdeaSelect(idea)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg text-primary">{idea.title}</h4>
                    <Badge variant="outline" className="ml-2">
                      Ý tưởng {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Đối tượng mục tiêu</p>
                      <p className="text-sm">{idea.targetSegment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Kênh & Định dạng</p>
                      <p className="text-sm">{idea.channelFormat}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Nội dung cốt lõi</p>
                    <p className="text-sm">{idea.coreContent}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Insight được khai thác</p>
                      <p className="text-sm font-medium text-accent">{idea.insight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Call-to-Action</p>
                      <p className="text-sm font-medium">{idea.cta}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Tạo nội dung chi tiết cho ý tưởng này
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content */}
      {generatedContent?.selectedContent && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Nội dung hoàn thiện
                </CardTitle>
                <CardDescription>
                  {selectedIdea ? `Dựa trên ý tưởng: "${selectedIdea.title}"` : 'Nội dung được tạo bởi AI'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const content = typeof generatedContent.selectedContent === 'string' 
                      ? generatedContent.selectedContent 
                      : JSON.stringify(generatedContent.selectedContent, null, 2);
                    handleCopy(content);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const content = typeof generatedContent.selectedContent === 'string' 
                      ? generatedContent.selectedContent 
                      : JSON.stringify(generatedContent.selectedContent, null, 2);
                    handleDownload(content, `tiximax-content-${Date.now()}.txt`);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateImagePrompts}
                  disabled={isGeneratingPrompts}
                >
                  {isGeneratingPrompts ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Tạo prompt ảnh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="w-4 h-4 mr-2" />
                  )}
                  Tạo ảnh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFeedback(!showFeedback)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Đánh giá
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Generated Image */}
              {generatedImageUrl && (
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Ảnh minh họa được tạo bởi AI
                  </h4>
                  <img 
                    src={generatedImageUrl} 
                    alt="AI Generated Content Image"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Generated Content */}
              <div className="bg-muted/30 rounded-lg p-6 border">
                {typeof generatedContent.selectedContent === 'string' ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedContent.selectedContent}
                  </pre>
                ) : (
                  <div className="space-y-4">
                    {/* Enhanced Content Display */}
                    {generatedContent.selectedContent?.content_type && (
                      <div className="mb-4">
                        <Badge variant="secondary" className="mb-2">
                          {generatedContent.selectedContent.content_type}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {generatedContent.selectedContent.channel_selected}
                        </Badge>
                      </div>
                    )}

                    {/* Social Media Post */}
                    {generatedContent.selectedContent?.title_suggestions && (
                      <div>
                        <h4 className="font-semibold mb-2">Gợi ý tiêu đề:</h4>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                          {generatedContent.selectedContent.title_suggestions.map((title: string, index: number) => (
                            <li key={index} className="text-sm">{title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {generatedContent.selectedContent?.body_content && (
                      <div>
                        <h4 className="font-semibold mb-2">Nội dung:</h4>
                        <div className="bg-white p-4 rounded border">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {generatedContent.selectedContent.body_content}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Video Script */}
                    {generatedContent.selectedContent?.video_title_idea && (
                      <div>
                        <h4 className="font-semibold mb-2">Tiêu đề Video:</h4>
                        <p className="text-sm mb-4 p-3 bg-primary/10 rounded">{generatedContent.selectedContent.video_title_idea}</p>
                        
                        {generatedContent.selectedContent.script_scenes && (
                          <div>
                            <h4 className="font-semibold mb-2">Kịch bản:</h4>
                            <div className="space-y-3">
                              {generatedContent.selectedContent.script_scenes.map((scene: any, index: number) => (
                                <div key={index} className="border rounded p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{scene.scene_id}</Badge>
                                    <span className="text-xs text-muted-foreground">{scene.duration_seconds}s</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <strong>Visual:</strong> {scene.visual_description}
                                    </div>
                                    <div>
                                      <strong>Audio:</strong> {scene.audio_description}
                                    </div>
                                    <div className="md:col-span-2">
                                      <strong>Lời thoại:</strong> {scene.voice_over_vietnamese}
                                    </div>
                                    {scene.text_overlay && (
                                      <div className="md:col-span-2">
                                        <strong>Text overlay:</strong> {scene.text_overlay}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Blog Post */}
                    {generatedContent.selectedContent?.title && (
                      <div>
                        <h4 className="font-semibold mb-2">Tiêu đề Blog:</h4>
                        <p className="text-lg font-medium mb-4 p-3 bg-primary/10 rounded">
                          {generatedContent.selectedContent.title}
                        </p>
                      </div>
                    )}

                    {generatedContent.selectedContent?.full_content_draft && (
                      <div>
                        <h4 className="font-semibold mb-2">Nội dung đầy đủ:</h4>
                        <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {generatedContent.selectedContent.full_content_draft}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Common Elements */}
                    {generatedContent.selectedContent?.call_to_action && (
                      <div>
                        <h4 className="font-semibold mb-2">Call to Action:</h4>
                        <p className="text-sm font-medium text-primary p-2 bg-primary/10 rounded">
                          {generatedContent.selectedContent.call_to_action}
                        </p>
                      </div>
                    )}

                    {generatedContent.selectedContent?.hashtags && (
                      <div>
                        <h4 className="font-semibold mb-2">Hashtags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.selectedContent.hashtags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.selectedContent?.keywords_for_seo && (
                      <div>
                        <h4 className="font-semibold mb-2">Keywords SEO:</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.selectedContent.keywords_for_seo.map((keyword: string, index: number) => (
                            <Badge key={index} variant="outline">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.selectedContent?.notes_for_user && (
                      <div>
                        <h4 className="font-semibold mb-2">Ghi chú:</h4>
                        <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
                          {generatedContent.selectedContent.notes_for_user}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Feedback */}
              {showFeedback && (
                <ContentFeedback
                  contentId={`content_${selectedIdea?.id || Date.now()}`}
                  content={typeof generatedContent.selectedContent === 'string' ? generatedContent.selectedContent : JSON.stringify(generatedContent.selectedContent)}
                  channelType={contentRequest?.channel || ''}
                  targetAudience={selectedIdea?.targetSegment || ''}
                  onFeedbackSubmitted={(feedback) => {
                    toast({
                      title: "Cảm ơn feedback!",
                      description: "Đánh giá của bạn sẽ giúp AI cải thiện chất lượng.",
                    });
                    setShowFeedback(false);
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Image Prompts */}
      {showImagePrompts && imagePrompts.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Prompt ảnh cho GenPark & Image4
                </CardTitle>
                <CardDescription>
                  Các prompt đã được tối ưu cho từng loại nội dung và kích thước
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowImagePrompts(false)}
              >
                Ẩn prompts
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {imagePrompts.map((prompt, index) => {
                const titles = [
                  "📱 Social Media (1:1) - Facebook, Instagram Post",
                  "📺 Story/Reel (9:16) - Instagram Story, TikTok", 
                  "🖥️ Website/Blog (16:9) - Header, Thumbnail",
                  "🎯 Marketing (16:9) - Ads, Campaigns"
                ];
                
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary">
                        {titles[index] || `Prompt ${index + 1}`}
                      </h4>
                      <Badge variant="outline">
                        {prompt.styleModifiers.includes('1:1') ? '1:1' : 
                         prompt.styleModifiers.includes('9:16') ? '9:16' : '16:9'}
                      </Badge>
                    </div>
                    
                    {/* Main Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          🎨 Main Prompt (Copy này cho GenPark/Image4):
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopy(prompt.fullPrompt)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Full
                        </Button>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {prompt.fullPrompt}
                        </pre>
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          ❌ Negative Prompt:
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopy(prompt.negativePrompt)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {prompt.negativePrompt}
                        </pre>
                      </div>
                    </div>

                    {/* Technical Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <strong>🎭 Style:</strong><br/>
                        {prompt.styleModifiers}
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded p-2">
                        <strong>⚙️ Technical:</strong><br/>
                        {prompt.technicalSpecs}
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <strong>📐 Tối ưu cho:</strong><br/>
                        GenPark, Image4, Midjourney, DALL-E
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Usage Instructions */}
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
                <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Hướng dẫn sử dụng:
                </h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>• GenPark:</strong> Copy "Main Prompt" vào ô Prompt, "Negative Prompt" vào ô Negative</p>
                  <p><strong>• Image4:</strong> Dùng Full Prompt làm mô tả chính, có thể bỏ phần technical specs</p>
                  <p><strong>• Midjourney:</strong> Thêm "--ar" vào cuối (VD: --ar 16:9 cho landscape)</p>
                  <p><strong>• DALL-E:</strong> Dùng Main Prompt, bỏ technical specs phức tạp</p>
                  <p><strong>💡 Tips:</strong> Điều chỉnh strength/CFG scale từ 7-12 để có kết quả tốt nhất</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Generated Content */}
      {showBulkResults && Object.keys(bulkContent).length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Nội dung được tạo đồng loạt
            </CardTitle>
            <CardDescription>
              Tất cả {Object.keys(bulkContent).length} ý tưởng đã được tạo thành nội dung hoàn thiện.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedContent?.ideas.map((idea) => {
                const content = bulkContent[idea.id];
                if (!content) return null;
                
                return (
                  <div key={idea.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-primary">{idea.title}</h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopy(content)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Sao chép
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(content, `${idea.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 border max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {content}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Loading State */}
      {(isLoading || isBulkGenerating) && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              {isBulkGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <Cog className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-8 h-8 text-primary animate-pulse" />
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {isBulkGenerating ? 'Đang tạo nội dung đồng loạt...' : 
               generatedContent ? 'Đang tạo nội dung chi tiết...' : 
               'AI đang nghiên cứu xu hướng thị trường...'}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {loadingStage || (
                isBulkGenerating ? 'Vui lòng đợi, AI đang xử lý tất cả ý tưởng...' :
                generatedContent ? 'Gemini đang cung cấp insights mới nhất, OpenAI đang sáng tạo nội dung...' :
                'Hệ thống đang phân tích xu hướng và tạo ý tưởng phù hợp với target audience.'
              )}
            </p>

            {/* Progress indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span className={isLoading && !generatedContent ? 'text-primary font-medium' : ''}>
                  Nghiên cứu
                </span>
                <span className={isLoading && generatedContent ? 'text-primary font-medium' : ''}>
                  Sáng tạo
                </span>
                <span className={isBulkGenerating ? 'text-primary font-medium' : ''}>
                  Tối ưu
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: isLoading && !generatedContent ? '33%' : 
                           isLoading && generatedContent ? '66%' : 
                           isBulkGenerating ? '100%' : '0%'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};