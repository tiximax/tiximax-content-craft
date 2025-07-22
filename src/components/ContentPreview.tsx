import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy, Download, Eye, Lightbulb, Target, Users, MessageSquare, ArrowRight, Image, Zap, Clock, Search, Cog } from 'lucide-react';
import { ContentRequest, ContentIdea, GeneratedContent } from './ContentGenerator';
import { ContentFeedback } from './ContentFeedback';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/lib/ai-service';
import { FeedbackSystem } from '@/lib/feedback-system';

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
                  onClick={() => handleCopy(generatedContent.selectedContent!)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(
                    generatedContent.selectedContent!, 
                    `tiximax-content-${Date.now()}.txt`
                  )}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
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
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatedContent.selectedContent}
                </pre>
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