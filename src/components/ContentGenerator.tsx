import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Copy, Download, Settings } from 'lucide-react';
import { ContentForm } from './ContentForm';
import { ContentPreview } from './ContentPreview';
import { ApiSettings } from './ApiSettings';
import { ChannelManager } from './ChannelManager';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/lib/ai-service';

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('form');
  const [contentRequest, setContentRequest] = useState<ContentRequest | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  const handleFormSubmit = async (request: ContentRequest) => {
    setContentRequest(request);
    setIsGenerating(true);
    
    try {
      const ideas = await aiService.generateContentIdeas(request);
      setGeneratedContent({ ideas });
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Lỗi tạo nội dung",
        description: error instanceof Error ? error.message : "Không thể tạo ý tưởng nội dung",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIdeaSelect = async (idea: ContentIdea) => {
    if (!contentRequest) return;
    
    setSelectedIdea(idea);
    setIsGenerating(true);
    
    try {
      const detailedContent = await aiService.generateDetailedContent(idea, contentRequest);
      setGeneratedContent(prev => prev ? {
        ...prev,
        selectedContent: detailedContent
      } : null);
    } catch (error) {
      console.error('Error generating detailed content:', error);
      toast({
        title: "Lỗi tạo nội dung",
        description: error instanceof Error ? error.message : "Không thể tạo nội dung chi tiết",
        variant: "destructive"
      });
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Thiết lập nội dung
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Preview & Chỉnh sửa
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quản lý kênh
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
          <TabsContent value="channels">
            <ChannelManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};