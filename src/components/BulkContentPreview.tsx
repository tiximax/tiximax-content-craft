import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/lib/ai-service';
import { ContentRequest, GeneratedContent } from './ContentGenerator';
import { Copy, Download, Loader2, Zap, Cog } from 'lucide-react';

interface BulkContentPreviewProps {
  generatedContent: GeneratedContent | null;
  contentRequest: ContentRequest | null;
  onCopy: (content: string) => void;
  onDownload: (content: string, filename: string) => void;
}

export const BulkContentPreview: React.FC<BulkContentPreviewProps> = ({
  generatedContent,
  contentRequest,
  onCopy,
  onDownload,
}) => {
  const { toast } = useToast();
  const [isBulkGenerating, setIsBulkGenerating] = React.useState(false);
  const [bulkContent, setBulkContent] = React.useState<{ [key: string]: string }>({});
  const [showBulkResults, setShowBulkResults] = React.useState(false);
  const [loadingStage, setLoadingStage] = React.useState('');

  const handleBulkGenerate = async () => {
    if (!generatedContent?.ideas || !contentRequest) return;

    setIsBulkGenerating(true);
    try {
      const stages = [
        'Đang phân tích insights từ Gemini...',
        'Đang tạo nội dung với OpenAI...',
        'Đang tối ưu theo cấu hình kênh...',
        'Đang kiểm tra chất lượng nội dung...',
        'Hoàn tất!',
      ];

      for (let i = 0; i < stages.length - 1; i++) {
        setLoadingStage(stages[i]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const results = await aiService.generateBulkContent(generatedContent.ideas, contentRequest);
      setBulkContent(results);
      setShowBulkResults(true);
      setLoadingStage(stages[stages.length - 1]);

      toast({
        title: 'Tạo nội dung đồng loạt thành công!',
        description: `Đã tạo ${Object.keys(results).length} nội dung hoàn thiện.`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi tạo nội dung đồng loạt',
        description: error instanceof Error ? error.message : 'Không thể tạo nội dung',
        variant: 'destructive',
      });
    } finally {
      setIsBulkGenerating(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="hero"
        size="sm"
        onClick={handleBulkGenerate}
        disabled={isBulkGenerating}
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
                        <Button variant="outline" size="sm" onClick={() => onCopy(content)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Sao chép
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(content, `${idea.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`)}
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

      {isBulkGenerating && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <Zap className="w-6 h-6 text-yellow-500" />
                <Cog className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Đang tạo nội dung đồng loạt...</h3>
            <p className="text-muted-foreground mb-4">
              {loadingStage || 'Vui lòng đợi, AI đang xử lý tất cả ý tưởng...'}
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span className="text-primary font-medium">Nghiên cứu</span>
                <span className="text-primary font-medium">Sáng tạo</span>
                <span className="text-primary font-medium">Tối ưu</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
