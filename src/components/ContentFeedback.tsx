import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ThumbsUp, ThumbsDown, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { Rating } from '@/components/ui/rating';
import { FeedbackSystem, UserFeedback } from '@/lib/feedback-system';
import { ContentSafetyService, ContentSafetyCheck, ContentQuality } from '@/lib/content-safety';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ContentFeedbackProps {
  contentId: string;
  content: string;
  channelType: string;
  targetAudience: string;
  onFeedbackSubmitted?: (feedback: UserFeedback) => void;
}

export const ContentFeedback: React.FC<ContentFeedbackProps> = ({
  contentId,
  content,
  channelType,
  targetAudience,
  onFeedbackSubmitted
}) => {
  const { toast } = useToast();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [aspects, setAspects] = useState({
    relevance: 0,
    creativity: 0,
    usefulness: 0,
    accuracy: 0
  });
  const [textFeedback, setTextFeedback] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);

  // Thực hiện kiểm tra an toàn và chất lượng nội dung
  const safetyCheck: ContentSafetyCheck = ContentSafetyService.validateContent(content);
  const qualityAssessment: ContentQuality = ContentSafetyService.assessQuality(content, channelType, targetAudience);

  const improvementOptions = [
    'Cần thêm keywords của Tiximax',
    'Tone of voice chưa phù hợp',
    'Call-to-action không rõ ràng',
    'Nội dung quá dài/ngắn',
    'Thiếu tính sáng tạo',
    'Không phù hợp với target audience',
    'Cần thêm thông tin chi tiết',
    'Format chưa tối ưu cho kênh'
  ];

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Vui lòng đánh giá",
        description: "Hãy cho điểm từ 1-5 sao cho nội dung này.",
        variant: "destructive"
      });
      return;
    }

    const feedback = FeedbackSystem.saveFeedback({
      contentId,
      rating,
      aspects,
      textFeedback: textFeedback.trim() || undefined,
      improvements: improvements.length > 0 ? improvements : undefined,
      wouldUseAgain: wouldUseAgain ?? false
    });

    onFeedbackSubmitted?.(feedback);
    setShowFeedbackForm(false);
    
    toast({
      title: "Cảm ơn phản hồi!",
      description: "Feedback của bạn sẽ giúp AI tạo nội dung tốt hơn.",
    });

    // Reset form
    setRating(0);
    setAspects({ relevance: 0, creativity: 0, usefulness: 0, accuracy: 0 });
    setTextFeedback('');
    setImprovements([]);
    setWouldUseAgain(null);
  };

  const toggleImprovement = (improvement: string) => {
    setImprovements(prev => 
      prev.includes(improvement)
        ? prev.filter(i => i !== improvement)
        : [...prev, improvement]
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Content Quality Assessment */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Đánh giá chất lượng nội dung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={cn("text-2xl font-bold", getQualityColor(qualityAssessment.score))}>
                {qualityAssessment.score}/100
              </div>
              <p className="text-sm text-muted-foreground">Điểm tổng</p>
            </div>
            <div className="text-center">
              <div className={cn("text-lg font-semibold", getQualityColor(qualityAssessment.criteria.relevance))}>
                {qualityAssessment.criteria.relevance}/100
              </div>
              <p className="text-sm text-muted-foreground">Relevance</p>
            </div>
            <div className="text-center">
              <div className={cn("text-lg font-semibold", getQualityColor(qualityAssessment.criteria.engagement))}>
                {qualityAssessment.criteria.engagement}/100
              </div>
              <p className="text-sm text-muted-foreground">Engagement</p>
            </div>
          </div>

          {qualityAssessment.feedback.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Gợi ý cải thiện:</p>
              {qualityAssessment.feedback.map((feedback, index) => (
                <p key={index} className="text-sm text-muted-foreground">• {feedback}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Safety Check */}
      {(!safetyCheck.isValid || safetyCheck.warnings.length > 0) && (
        <Card className={cn(
          "border-l-4",
          safetyCheck.severity === 'high' ? 'border-l-red-500' : 
          safetyCheck.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className={cn(
                "w-5 h-5",
                getSeverityColor(safetyCheck.severity)
              )} />
              Kiểm tra an toàn nội dung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safetyCheck.warnings.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium">Cảnh báo:</p>
                {safetyCheck.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-muted-foreground">⚠️ {warning}</p>
                ))}
              </div>
            )}

            {safetyCheck.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Đề xuất:</p>
                {safetyCheck.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm text-muted-foreground">💡 {suggestion}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Đánh giá của bạn
          </CardTitle>
          <CardDescription>
            Feedback của bạn giúp AI học hỏi và tạo nội dung tốt hơn trong tương lai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showFeedbackForm ? (
            <div className="flex gap-2">
              <Button onClick={() => setShowFeedbackForm(true)}>
                <Star className="w-4 h-4 mr-2" />
                Đánh giá nội dung
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <p className="text-sm font-medium mb-2">Đánh giá tổng thể *</p>
                <Rating value={rating} onChange={setRating} size="lg" />
              </div>

              {/* Detailed Aspects */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Đánh giá chi tiết</p>
                {Object.entries(aspects).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key === 'relevance' ? 'Phù hợp' : key === 'creativity' ? 'Sáng tạo' : key === 'usefulness' ? 'Hữu ích' : 'Chính xác'}:</span>
                    <Rating 
                      value={value} 
                      onChange={(newValue) => setAspects(prev => ({ ...prev, [key]: newValue }))} 
                    />
                  </div>
                ))}
              </div>

              {/* Text Feedback */}
              <div>
                <p className="text-sm font-medium mb-2">Nhận xét chi tiết (tuỳ chọn)</p>
                <Textarea
                  placeholder="Chia sẻ ý kiến của bạn về nội dung này..."
                  value={textFeedback}
                  onChange={(e) => setTextFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Improvement Areas */}
              <div>
                <p className="text-sm font-medium mb-2">Cần cải thiện (chọn nhiều)</p>
                <div className="flex flex-wrap gap-2">
                  {improvementOptions.map(option => (
                    <Badge
                      key={option}
                      variant={improvements.includes(option) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleImprovement(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Would Use Again */}
              <div>
                <p className="text-sm font-medium mb-2">Bạn có muốn sử dụng AI này tiếp không?</p>
                <div className="flex gap-2">
                  <Button
                    variant={wouldUseAgain === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldUseAgain(true)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Có
                  </Button>
                  <Button
                    variant={wouldUseAgain === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWouldUseAgain(false)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Không
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Submit Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSubmitFeedback}>
                  Gửi đánh giá
                </Button>
                <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                  Huỷ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};