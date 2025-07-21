import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, TestTube, CheckCircle, XCircle, Loader2, Key, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, AI_MODELS, AIConfig } from '@/lib/ai-service';
import { enhancedAIService, AI_MODELS_ENHANCED, EnhancedAIConfig } from '@/lib/ai-service-enhanced';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ApiSettings: React.FC = () => {
  const { toast } = useToast();
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [selectedModel, setSelectedModel] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash-exp');
  const [openaiModel, setOpenaiModel] = useState('gpt-4.1-2025-04-14');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<{
    openai?: { status: 'success' | 'error' | 'testing'; message: string };
    gemini?: { status: 'success' | 'error' | 'testing'; message: string };
  }>({});

  // Load saved settings
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const config: AIConfig = JSON.parse(savedConfig);
        setSelectedProvider(config.provider);
        setSelectedModel(config.model);
        if (config.provider === 'openai') {
          setOpenaiKey(config.apiKey);
        } else {
          setGeminiKey(config.apiKey);
        }
        aiService.setConfig(config);
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    }
  }, []);

  // Set default model when provider changes
  useEffect(() => {
    if (selectedProvider === 'openai' && !selectedModel) {
      setSelectedModel('gpt-4.1-2025-04-14');
    } else if (selectedProvider === 'gemini' && !selectedModel) {
      setSelectedModel('gemini-2.0-flash-exp');
    }
  }, [selectedProvider, selectedModel]);

  const handleSaveConfig = () => {
    const currentKey = selectedProvider === 'openai' ? openaiKey : geminiKey;
    
    if (!currentKey || !selectedModel) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền API key và chọn model",
        variant: "destructive"
      });
      return;
    }

    const config: AIConfig = {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: currentKey
    };

    localStorage.setItem('ai-config', JSON.stringify(config));
    aiService.setConfig(config);
    
    toast({
      title: "Đã lưu cấu hình",
      description: `Sử dụng ${AI_MODELS[selectedProvider][selectedModel as keyof typeof AI_MODELS[typeof selectedProvider]]}`,
    });
  };

  const handleTestConnection = async () => {
    const currentKey = selectedProvider === 'openai' ? openaiKey : geminiKey;
    
    if (!currentKey || !selectedModel) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền API key và chọn model trước khi test",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResults(prev => ({
      ...prev,
      [selectedProvider]: { status: 'testing', message: 'Đang kiểm tra kết nối...' }
    }));

    // Configure AI service for testing
    aiService.setConfig({
      provider: selectedProvider,
      model: selectedModel,
      apiKey: currentKey
    });

    try {
      const result = await aiService.testConnection();
      setTestResults(prev => ({
        ...prev,
        [selectedProvider]: { 
          status: result.success ? 'success' : 'error', 
          message: result.message 
        }
      }));

      if (result.success) {
        toast({
          title: "Kết nối thành công",
          description: result.message,
        });
      } else {
        toast({
          title: "Kết nối thất bại",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [selectedProvider]: { 
          status: 'error', 
          message: 'Lỗi không xác định' 
        }
      }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (status?: 'success' | 'error' | 'testing') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Cài đặt AI & API
          </CardTitle>
          <CardDescription>
            Cấu hình kết nối với OpenAI và Gemini để tạo nội dung chất lượng cao với các model mới nhất
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Bảo mật:</strong> API Keys được lưu trữ cục bộ trên trình duyệt và không gửi đến server. 
          Để bảo mật tối đa, hãy xóa API Keys khi không sử dụng.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="provider">Chọn AI Provider</Label>
            <Select value={selectedProvider} onValueChange={(value: 'openai' | 'gemini') => setSelectedProvider(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model">Chọn Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn model" />
              </SelectTrigger>
              <SelectContent>
                {selectedProvider === 'openai' ? (
                  Object.entries(AI_MODELS.openai).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))
                ) : (
                  Object.entries(AI_MODELS.gemini).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-4">
          {selectedProvider === 'openai' ? (
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lấy API Key tại <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
              </p>
              
              <div className="mt-3">
                <Button 
                  onClick={handleTestConnection}
                  disabled={!openaiKey || isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="mr-2 h-4 w-4" />
                  )}
                  Test Connection
                </Button>
                
                {testResults.openai && (
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(testResults.openai.status)}
                    <span className="text-sm">{testResults.openai.message}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="AI..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lấy API Key tại <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
              </p>
              
              <div className="mt-3">
                <Button 
                  onClick={handleTestConnection}
                  disabled={!geminiKey || isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="mr-2 h-4 w-4" />
                  )}
                  Test Connection
                </Button>
                
                {testResults.gemini && (
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(testResults.gemini.status)}
                    <span className="text-sm">{testResults.gemini.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Configuration */}
        <div className="md:col-span-2">
          <Button 
            onClick={handleSaveConfig}
            className="w-full"
            variant="default"
          >
            <Settings className="mr-2 h-4 w-4" />
            Lưu cấu hình AI
          </Button>
        </div>
      </div>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Thông tin Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">OpenAI Models:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>GPT-4.1</strong>: Model mới nhất với hiệu suất tốt nhất</li>
                <li>• <strong>o4-mini</strong>: Reasoning model nhanh và hiệu quả</li>
                <li>• <strong>GPT-4o</strong>: Hỗ trợ vision và multimodal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Gemini Models:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Gemini 2.0 Flash</strong>: Model experimental mới nhất</li>
                <li>• <strong>Gemini 1.5 Pro</strong>: Hiệu suất cao, context lớn</li>
                <li>• <strong>Gemini 1.5 Flash</strong>: Nhanh và hiệu quả</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};