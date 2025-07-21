import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings, Edit, Trash2, Save, X, Tv, Users, Globe, MessageSquare } from 'lucide-react';
import { ChannelConfig, DEFAULT_CHANNEL_CONFIGS } from '@/types/channel-config';
import { useToast } from '@/hooks/use-toast';

interface ChannelManagerProps {
  onChannelSelect?: (channelConfig: ChannelConfig) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({ onChannelSelect }) => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<ChannelConfig[]>(DEFAULT_CHANNEL_CONFIGS);
  const [editingChannel, setEditingChannel] = useState<ChannelConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const platformIcons = {
    'Social Media': Users,
    'Video Sharing': Tv,
    'Blog/Website': Globe,
    'Professional Network': Users,
    'Messaging Platform': MessageSquare,
  };

  const createNewChannel = (): ChannelConfig => ({
    channel_id: `custom_${Date.now()}`,
    channel_name: 'Kênh mới',
    platform_type: 'Social Media',
    audience_demographics_focus: '',
    key_characteristics: {
      tone_of_voice_priority: [],
      content_length_guideline: '',
      visual_style_guideline: '',
      common_formats: [],
      hashtag_strategy: '',
      call_to_action_preference: '',
      link_placement_guideline: ''
    },
    specific_examples_or_notes: ''
  });

  const handleCreateNew = () => {
    const newChannel = createNewChannel();
    setEditingChannel(newChannel);
    setIsCreating(true);
  };

  const handleEdit = (channel: ChannelConfig) => {
    setEditingChannel({ ...channel });
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!editingChannel) return;
    
    if (isCreating) {
      setChannels(prev => [...prev, editingChannel]);
      toast({
        title: "Đã tạo kênh mới!",
        description: `Kênh "${editingChannel.channel_name}" đã được thêm vào hệ thống.`,
      });
    } else {
      setChannels(prev => prev.map(ch => 
        ch.channel_id === editingChannel.channel_id ? editingChannel : ch
      ));
      toast({
        title: "Đã cập nhật kênh!",
        description: `Cấu hình kênh "${editingChannel.channel_name}" đã được lưu.`,
      });
    }
    
    setEditingChannel(null);
    setIsCreating(false);
  };

  const handleDelete = (channelId: string) => {
    const channel = channels.find(ch => ch.channel_id === channelId);
    setChannels(prev => prev.filter(ch => ch.channel_id !== channelId));
    toast({
      title: "Đã xóa kênh!",
      description: `Kênh "${channel?.channel_name}" đã được xóa khỏi hệ thống.`,
      variant: "destructive"
    });
  };

  const handleCancel = () => {
    setEditingChannel(null);
    setIsCreating(false);
  };

  const handleChannelSelect = (channel: ChannelConfig) => {
    setSelectedChannel(channel.channel_id);
    onChannelSelect?.(channel);
    toast({
      title: "Đã chọn kênh!",
      description: `Cấu hình cho "${channel.channel_name}" sẽ được áp dụng khi tạo nội dung.`,
    });
  };

  const updateEditingChannel = (field: string, value: any) => {
    if (!editingChannel) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditingChannel(prev => ({
        ...prev!,
        [parent]: {
          ...(prev![parent as keyof ChannelConfig] as any),
          [child]: value
        }
      }));
    } else {
      setEditingChannel(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const addArrayItem = (field: string, item: string) => {
    if (!editingChannel || !item.trim()) return;
    
    const currentArray = field.includes('.') 
      ? (editingChannel.key_characteristics[field.split('.')[1] as keyof typeof editingChannel.key_characteristics] as unknown as string[])
      : (editingChannel[field as keyof ChannelConfig] as unknown as string[]);
    
    if (Array.isArray(currentArray) && !currentArray.includes(item.trim())) {
      updateEditingChannel(field, [...currentArray, item.trim()]);
    }
  };

  const removeArrayItem = (field: string, item: string) => {
    if (!editingChannel) return;
    
    const currentArray = field.includes('.') 
      ? (editingChannel.key_characteristics[field.split('.')[1] as keyof typeof editingChannel.key_characteristics] as unknown as string[])
      : (editingChannel[field as keyof ChannelConfig] as unknown as string[]);
    
    if (Array.isArray(currentArray)) {
      updateEditingChannel(field, currentArray.filter(i => i !== item));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quản lý cấu hình kênh
              </CardTitle>
              <CardDescription>
                Tùy chỉnh đặc điểm từng kênh mạng xã hội để AI tạo nội dung phù hợp nhất
              </CardDescription>
            </div>
            <Button variant="hero" onClick={handleCreateNew} disabled={!!editingChannel}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo kênh mới
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Channel List */}
      {!editingChannel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const IconComponent = platformIcons[channel.platform_type];
            const isSelected = selectedChannel === channel.channel_id;
            
            return (
              <Card 
                key={channel.channel_id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5 shadow-card' : ''
                }`}
                onClick={() => handleChannelSelect(channel)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{channel.channel_name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(channel);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!DEFAULT_CHANNEL_CONFIGS.find(dc => dc.channel_id === channel.channel_id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(channel.channel_id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">{channel.platform_type}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Đối tượng:</p>
                      <p className="text-sm">{channel.audience_demographics_focus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Độ dài nội dung:</p>
                      <p className="text-sm">{channel.key_characteristics.content_length_guideline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tone ưu tiên:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {channel.key_characteristics.tone_of_voice_priority.slice(0, 2).map(tone => (
                          <Badge key={tone} variant="secondary" className="text-xs">{tone}</Badge>
                        ))}
                        {channel.key_characteristics.tone_of_voice_priority.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{channel.key_characteristics.tone_of_voice_priority.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit/Create Form */}
      {editingChannel && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isCreating ? 'Tạo kênh mới' : `Chỉnh sửa: ${editingChannel.channel_name}`}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
                <Button variant="hero" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên kênh hiển thị</Label>
                <Input
                  value={editingChannel.channel_name}
                  onChange={(e) => updateEditingChannel('channel_name', e.target.value)}
                  placeholder="VD: TikTok Official"
                />
              </div>
              <div className="space-y-2">
                <Label>Loại nền tảng</Label>
                <Select 
                  value={editingChannel.platform_type} 
                  onValueChange={(value) => updateEditingChannel('platform_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Video Sharing">Video Sharing</SelectItem>
                    <SelectItem value="Blog/Website">Blog/Website</SelectItem>
                    <SelectItem value="Professional Network">Professional Network</SelectItem>
                    <SelectItem value="Messaging Platform">Messaging Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Đặc điểm đối tượng người dùng</Label>
              <Textarea
                value={editingChannel.audience_demographics_focus}
                onChange={(e) => updateEditingChannel('audience_demographics_focus', e.target.value)}
                placeholder="VD: Gen Z, yêu thích giải trí và xu hướng..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Key Characteristics */}
            <div className="space-y-4">
              <h4 className="font-semibold">Đặc điểm chính của kênh</h4>
              
              {/* Tone of Voice */}
              <div className="space-y-2">
                <Label>Tone of Voice ưu tiên</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Thêm tone..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('key_characteristics.tone_of_voice_priority', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingChannel.key_characteristics.tone_of_voice_priority.map(tone => (
                    <Badge 
                      key={tone} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeArrayItem('key_characteristics.tone_of_voice_priority', tone)}
                    >
                      {tone} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Length */}
              <div className="space-y-2">
                <Label>Hướng dẫn độ dài nội dung</Label>
                <Input
                  value={editingChannel.key_characteristics.content_length_guideline}
                  onChange={(e) => updateEditingChannel('key_characteristics.content_length_guideline', e.target.value)}
                  placeholder="VD: Ngắn gọn, dưới 150 từ"
                />
              </div>

              {/* Visual Style */}
              <div className="space-y-2">
                <Label>Hướng dẫn phong cách visual</Label>
                <Textarea
                  value={editingChannel.key_characteristics.visual_style_guideline}
                  onChange={(e) => updateEditingChannel('key_characteristics.visual_style_guideline', e.target.value)}
                  placeholder="VD: Video nhanh, màu sắc tươi sáng..."
                  rows={2}
                />
              </div>

              {/* Common Formats */}
              <div className="space-y-2">
                <Label>Định dạng phổ biến</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Thêm định dạng..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('key_characteristics.common_formats', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingChannel.key_characteristics.common_formats.map(format => (
                    <Badge 
                      key={format} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeArrayItem('key_characteristics.common_formats', format)}
                    >
                      {format} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hashtag Strategy */}
              <div className="space-y-2">
                <Label>Chiến lược hashtag</Label>
                <Input
                  value={editingChannel.key_characteristics.hashtag_strategy}
                  onChange={(e) => updateEditingChannel('key_characteristics.hashtag_strategy', e.target.value)}
                  placeholder="VD: Sử dụng hashtag trending, tối đa 5-7 hashtags"
                />
              </div>

              {/* CTA Preference */}
              <div className="space-y-2">
                <Label>Preference Call-to-Action</Label>
                <Textarea
                  value={editingChannel.key_characteristics.call_to_action_preference}
                  onChange={(e) => updateEditingChannel('key_characteristics.call_to_action_preference', e.target.value)}
                  placeholder="VD: Trực tiếp, kêu gọi inbox/ghé link bio"
                  rows={2}
                />
              </div>

              {/* Character Limit */}
              <div className="space-y-2">
                <Label>Giới hạn ký tự (nếu có)</Label>
                <Input
                  type="number"
                  value={editingChannel.key_characteristics.character_limit || ''}
                  onChange={(e) => updateEditingChannel('key_characteristics.character_limit', 
                    e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="VD: 2200"
                />
              </div>

              {/* Link Placement */}
              <div className="space-y-2">
                <Label>Hướng dẫn đặt link</Label>
                <Input
                  value={editingChannel.key_characteristics.link_placement_guideline}
                  onChange={(e) => updateEditingChannel('key_characteristics.link_placement_guideline', e.target.value)}
                  placeholder="VD: Trong comment đầu tiên / link Bio"
                />
              </div>
            </div>

            <Separator />

            {/* Specific Notes */}
            <div className="space-y-2">
              <Label>Ghi chú đặc biệt cho kênh này</Label>
              <Textarea
                value={editingChannel.specific_examples_or_notes}
                onChange={(e) => updateEditingChannel('specific_examples_or_notes', e.target.value)}
                placeholder="VD: Cần sử dụng nhạc trending, có phụ đề Việt Nam..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};