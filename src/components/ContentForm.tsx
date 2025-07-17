import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, Users, MessageSquare, FileText, Clock, Megaphone } from 'lucide-react';
import { ContentRequest } from './ContentGenerator';

interface ContentFormProps {
  onSubmit: (request: ContentRequest) => void;
  isLoading: boolean;
}

export const ContentForm: React.FC<ContentFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ContentRequest>({
    objective: '',
    stage: '',
    channel: '',
    format: '',
    length: '',
    tone: [],
    keywords: [],
    exclusions: [],
    promotion: '',
    cta: ''
  });

  const objectives = [
    { value: 'awareness', label: 'Gia tăng nhận thức về thương hiệu', icon: Target },
    { value: 'interest', label: 'Khơi gợi quan tâm và cung cấp thông tin', icon: Users },
    { value: 'conversion', label: 'Thúc đẩy hành động mua hàng', icon: MessageSquare },
    { value: 'advocacy', label: 'Chăm sóc sau bán và xây dựng lòng trung thành', icon: FileText }
  ];

  const stages = [
    'Awareness - Nhận biết',
    'Consideration - Cân nhắc', 
    'Conversion - Chuyển đổi',
    'Loyalty - Trung thành'
  ];

  const channels = [
    'Facebook',
    'TikTok', 
    'Instagram',
    'Blog Website',
    'Zalo OA',
    'YouTube',
    'LinkedIn'
  ];

  const formats = [
    'Video ngắn (dưới 30s)',
    'Bài Post dài (Facebook)',
    'Bài Blog chuyên sâu (500-800 từ)',
    'Infographic',
    'Livestream Script',
    'Email Marketing',
    'Landing Page Copy'
  ];

  const toneOptions = [
    'Đáng tin cậy, chuyên nghiệp, uy tín',
    'Thân thiện, gần gũi, đồng cảm',
    'Năng động, tươi mới, bắt kịp xu hướng',
    'Hỗ trợ, hợp tác, giải pháp'
  ];

  const handleToneChange = (tone: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        tone: [...prev.tone, tone]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tone: prev.tone.filter(t => t !== tone)
      }));
    }
  };

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-primary" />
          Thiết lập thông tin nội dung
        </CardTitle>
        <CardDescription className="text-base">
          Điền thông tin chi tiết để AI tạo ra nội dung phù hợp với insight và chân dung khách hàng Tiximax
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Objective Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Mục tiêu truyền thông chính
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {objectives.map((obj) => {
                const IconComponent = obj.icon;
                return (
                  <div
                    key={obj.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.objective === obj.value
                        ? 'border-primary bg-primary/5 shadow-card'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, objective: obj.value }))}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span className="font-medium">{obj.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage & Channel Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Giai đoạn hành trình khách hàng</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giai đoạn..." />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">Kênh truyền thông</Label>
              <Select value={formData.channel} onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kênh..." />
                </SelectTrigger>
                <SelectContent>
                  {channels.map(channel => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Format & Length */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Định dạng nội dung</Label>
              <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn định dạng..." />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">Độ dài nội dung</Label>
              <Select value={formData.length} onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ dài..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Ngắn (dưới 150 từ)</SelectItem>
                  <SelectItem value="medium">Trung bình (300-500 từ)</SelectItem>
                  <SelectItem value="long">Dài (trên 800 từ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Phong cách ngôn ngữ (chọn tối đa 2)</Label>
            <div className="space-y-3">
              {toneOptions.map(tone => (
                <div key={tone} className="flex items-center space-x-2">
                  <Checkbox 
                    id={tone}
                    checked={formData.tone.includes(tone)}
                    onCheckedChange={(checked) => handleToneChange(tone, !!checked)}
                    disabled={!formData.tone.includes(tone) && formData.tone.length >= 2}
                  />
                  <Label htmlFor={tone} className="text-sm cursor-pointer">
                    {tone}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Từ khóa chiến lược</Label>
            <div className="space-y-3">
              <Input
                placeholder='Nhập từ khóa và nhấn Enter (VD: "mua hộ Nhật", "ship hàng Hàn Quốc")'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleKeywordAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map(keyword => (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleKeywordRemove(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Promotion & CTA */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Chương trình ưu đãi (nếu có)</Label>
              <Textarea
                placeholder="VD: Giảm 30% phí dịch vụ cho đơn đầu tiên"
                value={formData.promotion}
                onChange={(e) => setFormData(prev => ({ ...prev, promotion: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">Call-to-Action mong muốn</Label>
              <Textarea
                placeholder="VD: Chat ngay với chuyên gia Tiximax, Truy cập website Tiximax.vn"
                value={formData.cta}
                onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              variant="hero"
              size="lg"
              disabled={isLoading || !formData.objective || !formData.stage || !formData.channel}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang tạo nội dung...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tạo nội dung với AI
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};