import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Download, Eye, Lightbulb, Target, MessageSquare, ArrowRight } from 'lucide-react';
import { ContentRequest, ContentIdea, GeneratedContent } from './ContentGenerator';
import { ContentFeedback } from './ContentFeedback';
import { useToast } from '@/hooks/use-toast';
import { FeedbackSystem } from '@/lib/feedback-system';
import { ImageGenerator } from './ImageGenerator';
import { BulkContentPreview } from './BulkContentPreview';

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
  const [showFeedback, setShowFeedback] = React.useState(false);

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

        {generatedContent && (
          <BulkContentPreview
            generatedContent={generatedContent}
            contentRequest={contentRequest}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
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

                <ImageGenerator
                  generatedContent={generatedContent}
                  selectedIdea={selectedIdea}
                />

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

      {/* Generated Image Prompts */}>
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

      {/* Bulk Generated Content */}>
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
      {isLoading && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Đang tạo nội dung chi tiết...</h3>
            <p className="text-muted-foreground">
              Gemini đang cung cấp insights mới nhất, OpenAI đang sáng tạo nội dung...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};