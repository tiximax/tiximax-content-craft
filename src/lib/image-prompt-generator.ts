import { ContentIdea } from '@/components/ContentGenerator';

export interface ImagePromptOptions {
  style?: 'professional' | 'modern' | 'minimalist' | 'vibrant' | 'corporate';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'high' | 'ultra';
  includeText?: boolean;
  brandColors?: boolean;
}

export interface GeneratedImagePrompt {
  mainPrompt: string;
  negativePrompt: string;
  styleModifiers: string;
  technicalSpecs: string;
  fullPrompt: string;
}

export class ImagePromptGenerator {
  private static readonly TIXIMAX_BRAND_ELEMENTS = {
    colors: "professional blue and orange color scheme, corporate branding",
    logoStyle: "clean modern logo design, minimalist brand identity",
    trustElements: "trust badges, security icons, professional certifications"
  };

  private static readonly LOGISTICS_ELEMENTS = {
    shipping: "shipping containers, cargo planes, delivery trucks, global logistics",
    ecommerce: "online shopping, mobile apps, shopping bags, packages",
    international: "world map, country flags, international shipping, customs",
    trust: "handshake, security shield, verified badges, professional service"
  };

  private static readonly STYLE_PRESETS = {
    professional: "clean corporate style, professional photography, studio lighting, sharp focus",
    modern: "contemporary design, sleek aesthetics, gradient backgrounds, tech-forward",
    minimalist: "clean white background, minimal elements, simple composition, negative space",
    vibrant: "bright colors, energetic composition, dynamic angles, eye-catching design",
    corporate: "business professional, corporate environment, office setting, formal presentation"
  };

  static generateImagePrompt(
    content: any,
    idea?: ContentIdea,
    options: ImagePromptOptions = {}
  ): GeneratedImagePrompt {
    const {
      style = 'professional',
      aspectRatio = '16:9',
      quality = 'high',
      includeText = false,
      brandColors = true
    } = options;

    // Analyze content type and context
    const contentType = this.detectContentType(content, idea);
    const targetAudience = idea?.targetSegment || 'general audience';
    const contentTheme = this.extractContentTheme(content, idea);

    // Build main prompt components
    const subjectElements = this.generateSubjectElements(contentType, contentTheme);
    const brandingElements = brandColors ? this.TIXIMAX_BRAND_ELEMENTS.colors : '';
    const styleElements = this.STYLE_PRESETS[style];
    const logisticsContext = this.selectRelevantLogisticsElements(contentTheme);

    // Construct main prompt
    const mainPrompt = [
      subjectElements,
      logisticsContext,
      brandingElements,
      styleElements,
      this.getAudienceSpecificElements(targetAudience)
    ].filter(Boolean).join(', ');

    // Generate negative prompt
    const negativePrompt = this.generateNegativePrompt(style);

    // Style modifiers
    const styleModifiers = [
      `${quality} quality`,
      `${aspectRatio} aspect ratio`,
      "professional commercial photography",
      "marketing material",
      includeText ? "with text overlay space" : "no text overlay"
    ].join(', ');

    // Technical specifications
    const technicalSpecs = this.generateTechnicalSpecs(quality, aspectRatio);

    // Full prompt for copy-paste
    const fullPrompt = `${mainPrompt}, ${styleModifiers}. ${technicalSpecs}`;

    return {
      mainPrompt,
      negativePrompt,
      styleModifiers,
      technicalSpecs,
      fullPrompt
    };
  }

  private static detectContentType(content: any, idea?: ContentIdea): string {
    if (content?.content_type) {
      return content.content_type.toLowerCase();
    }
    
    if (content?.video_title_idea || content?.script_scenes) {
      return 'video';
    }
    
    if (content?.title && content?.full_content_draft) {
      return 'blog';
    }
    
    if (idea?.channelFormat?.toLowerCase().includes('video')) {
      return 'video';
    }
    
    return 'social media';
  }

  private static extractContentTheme(content: any, idea?: ContentIdea): string {
    const text = [
      content?.body_content,
      content?.title,
      content?.video_title_idea,
      idea?.title,
      idea?.coreContent,
      idea?.insight
    ].filter(Boolean).join(' ').toLowerCase();

    // Theme detection based on keywords
    if (text.includes('hàn quốc') || text.includes('k-beauty') || text.includes('kpop')) {
      return 'korea';
    }
    if (text.includes('nhật bản') || text.includes('japan') || text.includes('anime')) {
      return 'japan';
    }
    if (text.includes('mỹ') || text.includes('america') || text.includes('usa')) {
      return 'usa';
    }
    if (text.includes('indonesia') || text.includes('indo')) {
      return 'indonesia';
    }
    if (text.includes('thời trang') || text.includes('fashion')) {
      return 'fashion';
    }
    if (text.includes('công nghệ') || text.includes('tech') || text.includes('gaming')) {
      return 'technology';
    }
    if (text.includes('mỹ phẩm') || text.includes('beauty') || text.includes('skincare')) {
      return 'beauty';
    }
    if (text.includes('ăn') || text.includes('food') || text.includes('snack')) {
      return 'food';
    }
    
    return 'general';
  }

  private static generateSubjectElements(contentType: string, theme: string): string {
    const baseElements = [];

    // Content type specific elements
    switch (contentType) {
      case 'video':
        baseElements.push("dynamic video thumbnail", "engaging visual storytelling");
        break;
      case 'blog':
        baseElements.push("informative blog header image", "educational content visual");
        break;
      default:
        baseElements.push("social media post image", "engaging marketing visual");
    }

    // Theme specific elements
    switch (theme) {
      case 'korea':
        baseElements.push("Korean cultural elements", "K-beauty products", "modern Seoul aesthetic");
        break;
      case 'japan':
        baseElements.push("Japanese minimalist design", "authentic Japanese products", "Tokyo modern style");
        break;
      case 'usa':
        baseElements.push("American lifestyle", "US brands", "Western consumer culture");
        break;
      case 'indonesia':
        baseElements.push("Indonesian craftsmanship", "tropical aesthetic", "Southeast Asian culture");
        break;
      case 'fashion':
        baseElements.push("stylish clothing", "fashion accessories", "trendy lifestyle");
        break;
      case 'technology':
        baseElements.push("modern gadgets", "tech devices", "digital lifestyle");
        break;
      case 'beauty':
        baseElements.push("cosmetic products", "skincare items", "beauty routine");
        break;
      case 'food':
        baseElements.push("international cuisine", "food packaging", "gourmet products");
        break;
    }

    return baseElements.join(', ');
  }

  private static selectRelevantLogisticsElements(theme: string): string {
    const elements = [
      this.LOGISTICS_ELEMENTS.shipping,
      this.LOGISTICS_ELEMENTS.international
    ];

    if (theme !== 'general') {
      elements.push(this.LOGISTICS_ELEMENTS.ecommerce);
    }

    return elements.join(', ');
  }

  private static getAudienceSpecificElements(audience: string): string {
    const audienceLower = audience.toLowerCase();
    
    if (audienceLower.includes('gen z') || audienceLower.includes('trẻ')) {
      return "trendy, youthful energy, social media aesthetic, vibrant colors";
    }
    if (audienceLower.includes('millennial')) {
      return "modern professional, lifestyle focused, quality conscious";
    }
    if (audienceLower.includes('doanh nhân') || audienceLower.includes('business')) {
      return "business professional, corporate setting, success oriented";
    }
    if (audienceLower.includes('phụ nữ') || audienceLower.includes('women')) {
      return "feminine aesthetic, elegant design, lifestyle imagery";
    }
    if (audienceLower.includes('nam') || audienceLower.includes('men')) {
      return "masculine aesthetic, practical design, tech-forward";
    }
    
    return "universal appeal, inclusive design, broad demographic";
  }

  private static generateNegativePrompt(style: string): string {
    const commonNegatives = [
      "low quality", "blurry", "pixelated", "distorted", "ugly", "deformed",
      "bad anatomy", "worst quality", "low resolution", "watermark", "signature",
      "text overlay", "copyright notice", "amateur photography"
    ];

    const styleSpecificNegatives: Record<string, string[]> = {
      professional: ["casual", "unprofessional", "messy", "cluttered"],
      modern: ["outdated", "vintage", "retro", "old-fashioned"],
      minimalist: ["cluttered", "busy", "complex", "overwhelming"],
      vibrant: ["dull", "monotone", "desaturated", "bland"],
      corporate: ["casual", "informal", "playful", "cartoonish"]
    };

    const negatives = [
      ...commonNegatives,
      ...(styleSpecificNegatives[style] || [])
    ];

    return negatives.join(', ');
  }

  private static generateTechnicalSpecs(quality: string, aspectRatio: string): string {
    const qualitySpecs: Record<string, string> = {
      standard: "8K resolution, detailed, sharp focus",
      high: "ultra high resolution, extremely detailed, perfect composition, professional lighting",
      ultra: "8K ultra detailed, masterpiece, best quality, perfect lighting, photorealistic, studio quality"
    };

    const aspectSpecs: Record<string, string> = {
      '1:1': "square format, Instagram post optimization",
      '16:9': "wide format, YouTube thumbnail optimization", 
      '9:16': "vertical format, TikTok/Instagram Story optimization",
      '4:3': "standard format, Facebook post optimization",
      '3:4': "portrait format, Pinterest optimization"
    };

    return `${qualitySpecs[quality]}, ${aspectSpecs[aspectRatio]}`;
  }

  static generatePromptVariations(basePrompt: GeneratedImagePrompt, count: number = 3): GeneratedImagePrompt[] {
    const variations = [];
    const styleVariations = ['professional', 'modern', 'vibrant'] as const;
    
    for (let i = 0; i < count; i++) {
      const style = styleVariations[i % styleVariations.length];
      // Generate slight variations by changing style and modifiers
      const varied = {
        ...basePrompt,
        styleModifiers: basePrompt.styleModifiers.replace(/professional|modern|vibrant/g, style),
        fullPrompt: basePrompt.fullPrompt.replace(/professional|modern|vibrant/g, style)
      };
      variations.push(varied);
    }
    
    return variations;
  }
}