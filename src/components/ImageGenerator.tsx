import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/lib/ai-service';
import { ImagePromptGenerator, GeneratedImagePrompt } from '@/lib/image-prompt-generator';
import { Image, Loader2, Palette, Wand2, Copy, MessageSquare } from 'lucide-react';
import { ContentIdea, GeneratedContent } from './ContentGenerator';

interface ImageGeneratorProps {
  generatedContent: GeneratedContent | null;
  selectedIdea: ContentIdea | null;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ generatedContent, selectedIdea }) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = React.useState<string | null>(null);
  const [imagePrompts, setImagePrompts] = React.useState<GeneratedImagePrompt[]>([]);
  const [showImagePrompts, setShowImagePrompts] = React.useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = React.useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Đã sao chép!',
      description: 'Nội dung đã được sao chép vào clipboard.',
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
        title: 'Tạo ảnh thành công!',
        description: 'Ảnh minh họa cho nội dung đã được tạo.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi tạo ảnh',
        description: error instanceof Error ? error.message : 'Không thể tạo ảnh',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateImagePrompts = async () => {
    if (!generatedContent?.selectedContent && !selectedIdea) return;

    setIsGeneratingPrompts(true);

    try {
      const mainPrompt = ImagePromptGenerator.generateImagePrompt(
        generatedContent?.selectedContent,
        selectedIdea || undefined,
        {
          style: 'professional',
          aspectRatio: '16:9',
          quality: 'high',
          brandColors: true,
        }
      );

      const variations = [
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'vibrant',
            aspectRatio: '1:1',
            quality: 'high',
            brandColors: true,
          }
        ),
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'modern',
            aspectRatio: '9:16',
            quality: 'high',
            brandColors: true,
          }
        ),
        ImagePromptGenerator.generateImagePrompt(
          generatedContent?.selectedContent,
          selectedIdea || undefined,
          {
            style: 'minimalist',
            aspectRatio: '16:9',
            quality: 'ultra',
            brandColors: false,
          }
        ),
      ];

      setImagePrompts([mainPrompt, ...variations]);
      setShowImagePrompts(true);

      toast({
        title: 'Đã tạo prompt ảnh!',
        description: 'Các prompt đã được tối ưu cho GenPark và Image4',
      });
    } catch (error) {
      toast({
        title: 'Lỗi tạo prompt ảnh',
        description: error instanceof Error ? error.message : 'Không thể tạo prompt',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
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
      </div>

      {generatedImageUrl && (
        <div className="bg-muted/30 rounded-lg p-4 border mt-4">
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

      {showImagePrompts && imagePrompts.length > 0 && (
        <Card className="shadow-card mt-4">
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
                  '📱 Social Media (1:1) - Facebook, Instagram Post',
                  '📺 Story/Reel (9:16) - Instagram Story, TikTok',
                  '🖥️ Website/Blog (16:9) - Header, Thumbnail',
                  '🎯 Marketing (16:9) - Ads, Campaigns',
                ];

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-primary">
                        {titles[index] || `Prompt ${index + 1}`}
                      </h4>
                      <Badge variant="outline">
                        {prompt.styleModifiers.includes('1:1')
                          ? '1:1'
                          : prompt.styleModifiers.includes('9:16')
                          ? '9:16'
                          : '16:9'}
                      </Badge>
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <strong>🎭 Style:</strong><br />
                        {prompt.styleModifiers}
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded p-2">
                        <strong>⚙️ Technical:</strong><br />
                        {prompt.technicalSpecs}
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <strong>📐 Tối ưu cho:</strong><br />
                        GenPark, Image4, Midjourney, DALL-E
                      </div>
                    </div>
                  </div>
                );
              })}

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
    </>
  );
};
