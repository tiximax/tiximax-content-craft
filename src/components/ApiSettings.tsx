import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Key, Zap, Brain, Shield, CheckCircle, AlertCircle, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiConfig {
  openai: {
    apiKey: string;
    model: string;
    temperature: number;
  };
  gemini: {
    apiKey: string;
    model: string;
    temperature: number;
  };
  selectedProvider: 'openai' | 'gemini' | 'both';
}

export const ApiSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ApiConfig>({
    openai: {
      apiKey: '',
      model: 'gpt-4-turbo-preview',
      temperature: 0.7
    },
    gemini: {
      apiKey: '',
      model: 'gemini-pro',
      temperature: 0.7
    },
    selectedProvider: 'both'
  });
  
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    openai: 'idle' | 'success' | 'error';
    gemini: 'idle' | 'success' | 'error';
  }>({
    openai: 'idle',
    gemini: 'idle'
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('tiximax-ai-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('tiximax-ai-config', JSON.stringify(config));
    toast({
      title: "Đã lưu cấu hình!",
      description: "Cài đặt API đã được lưu trữ an toàn.",
    });
  };

  const testOpenAIConnection = async () => {
    if (!config.openai.apiKey) {
      toast({
        title: "Thiếu API Key",
        description: "Vui lòng nhập OpenAI API Key trước khi test.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingOpenAI(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, openai: 'success' }));
        toast({
          title: "Kết nối thành công!",
          description: "OpenAI API hoạt động bình thường.",
        });
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, openai: 'error' }));
      toast({
        title: "Kết nối thất bại",
        description: "Không thể kết nối với OpenAI API. Vui lòng kiểm tra lại API Key.",
        variant: "destructive"
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const testGeminiConnection = async () => {
    if (!config.gemini.apiKey) {
      toast({
        title: "Thiếu API Key",
        description: "Vui lòng nhập Gemini API Key trước khi test.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingGemini(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${config.gemini.apiKey}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, gemini: 'success' }));
        toast({
          title: "Kết nối thành công!",
          description: "Gemini API hoạt động bình thường.",
        });
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, gemini: 'error' }));
      toast({
        title: "Kết nối thất bại",
        description: "Không thể kết nối với Gemini API. Vui lòng kiểm tra lại API Key.",
        variant: "destructive"
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            Cấu hình kết nối với OpenAI và Gemini để tạo nội dung chất lượng cao
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Bảo mật:</strong> API Keys được lưu trữ cục bộ trên trình duyệt của bạn và không được gửi đến server nào khác. 
          Để bảo mật tối đa, hãy xóa API Keys khi không sử dụng.
        </AlertDescription>
      </Alert>

      {/* Provider Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Lựa chọn nhà cung cấp AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Sử dụng AI Provider nào để tạo nội dung?</Label>
            <Select 
              value={config.selectedProvider} 
              onValueChange={(value: 'openai' | 'gemini' | 'both') => 
                setConfig(prev => ({ ...prev, selectedProvider: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">Chỉ OpenAI GPT</SelectItem>
                <SelectItem value="gemini">Chỉ Google Gemini</SelectItem>
                <SelectItem value="both">Cả hai (Đề xuất)</SelectItem>
              </SelectContent>
            </Select>
            
            {config.selectedProvider === 'both' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Khuyến nghị:</strong> Sử dụng cả hai AI sẽ cho kết quả đa dạng và chất lượng tốt nhất. 
                  OpenAI tốt cho nội dung marketing, Gemini mạnh về phân tích insight khách hàng.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="openai" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            OpenAI
          </TabsTrigger>
          <TabsTrigger value="gemini" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Gemini
          </TabsTrigger>
        </TabsList>

        {/* OpenAI Configuration */}
        <TabsContent value="openai">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    OpenAI Configuration
                  </CardTitle>
                  <CardDescription>
                    Cấu hình kết nối với OpenAI GPT API
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(connectionStatus.openai)}
                  <Badge className={getStatusColor(connectionStatus.openai)}>
                    {connectionStatus.openai === 'success' ? 'Đã kết nối' : 
                     connectionStatus.openai === 'error' ? 'Lỗi kết nối' : 'Chưa test'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={config.openai.apiKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    openai: { ...prev.openai, apiKey: e.target.value }
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Lấy API Key tại <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-model">Model</Label>
                  <Select 
                    value={config.openai.model}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      openai: { ...prev.openai, model: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Đề xuất)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openai-temp">Temperature: {config.openai.temperature}</Label>
                  <Input
                    id="openai-temp"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.openai.temperature}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      openai: { ...prev.openai, temperature: parseFloat(e.target.value) }
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    0.0 = Chính xác, 1.0 = Sáng tạo
                  </p>
                </div>
              </div>

              <Button 
                onClick={testOpenAIConnection}
                disabled={isTestingOpenAI || !config.openai.apiKey}
                variant="outline"
                className="w-full"
              >
                {isTestingOpenAI ? (
                  <>
                    <Settings className="w-4 h-4 animate-spin mr-2" />
                    Đang test kết nối...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test kết nối OpenAI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gemini Configuration */}
        <TabsContent value="gemini">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Gemini Configuration
                  </CardTitle>
                  <CardDescription>
                    Cấu hình kết nối với Google Gemini API
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(connectionStatus.gemini)}
                  <Badge className={getStatusColor(connectionStatus.gemini)}>
                    {connectionStatus.gemini === 'success' ? 'Đã kết nối' : 
                     connectionStatus.gemini === 'error' ? 'Lỗi kết nối' : 'Chưa test'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AI..."
                  value={config.gemini.apiKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    gemini: { ...prev.gemini, apiKey: e.target.value }
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Lấy API Key tại <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-model">Model</Label>
                  <Select 
                    value={config.gemini.model}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      gemini: { ...prev.gemini, model: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-pro">Gemini Pro (Đề xuất)</SelectItem>
                      <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini-temp">Temperature: {config.gemini.temperature}</Label>
                  <Input
                    id="gemini-temp"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.gemini.temperature}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      gemini: { ...prev.gemini, temperature: parseFloat(e.target.value) }
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    0.0 = Chính xác, 1.0 = Sáng tạo
                  </p>
                </div>
              </div>

              <Button 
                onClick={testGeminiConnection}
                disabled={isTestingGemini || !config.gemini.apiKey}
                variant="outline"
                className="w-full"
              >
                {isTestingGemini ? (
                  <>
                    <Settings className="w-4 h-4 animate-spin mr-2" />
                    Đang test kết nối...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test kết nối Gemini
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button onClick={saveConfig} variant="hero" size="lg" className="px-8">
          <Settings className="w-5 h-5 mr-2" />
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
};