// Content Safety và Quality Control Module
export interface ContentSafetyCheck {
  isValid: boolean;
  warnings: string[];
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface ContentQuality {
  score: number; // 0-100
  criteria: {
    relevance: number;
    clarity: number;
    engagement: number;
    brand_alignment: number;
    channel_fit: number;
  };
  feedback: string[];
}

export class ContentSafetyService {
  // Kiểm tra an toàn nội dung
  static validateContent(content: string): ContentSafetyCheck {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Kiểm tra từ ngữ nhạy cảm
    const sensitiveWords = [
      'miễn phí', 'khuyến mãi khủng', 'cực sốc', 'giá rẻ nhất',
      'bảo đảm 100%', 'không rủi ro', 'nhanh giàu'
    ];

    sensitiveWords.forEach(word => {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        warnings.push(`Phát hiện từ ngữ có thể gây hiểu lầm: "${word}"`);
        suggestions.push(`Thay thế "${word}" bằng từ ngữ chuyên nghiệp hơn`);
        severity = 'medium';
      }
    });

    // Kiểm tra độ dài CTA
    const ctaMatches = content.match(/(inbox|đặt hàng|liên hệ|gọi ngay|mua ngay)/gi);
    if (ctaMatches && ctaMatches.length > 3) {
      warnings.push('Quá nhiều call-to-action trong một nội dung');
      suggestions.push('Giảm xuống 1-2 CTA chính để tăng hiệu quả');
      severity = 'medium';
    }

    // Kiểm tra tính chuyên nghiệp
    const unprofessionalWords = ['ăn gian', 'lừa đảo', 'móc túi', 'chặt chém'];
    unprofessionalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        warnings.push(`Từ ngữ không phù hợp với thương hiệu: "${word}"`);
        suggestions.push('Sử dụng ngôn ngữ chuyên nghiệp, tích cực');
        severity = 'high';
      }
    });

    // Kiểm tra thông tin liên lạc
    const contactRegex = /(0\d{9}|\+84\d{9})/g;
    if (contactRegex.test(content)) {
      warnings.push('Phát hiện số điện thoại trực tiếp trong nội dung');
      suggestions.push('Sử dụng CTA "Inbox" thay vì để số điện thoại công khai');
    }

    return {
      isValid: severity === 'low',
      warnings,
      severity,
      suggestions
    };
  }

  // Đánh giá chất lượng nội dung
  static assessQuality(content: string, channelType: string, targetAudience: string): ContentQuality {
    let relevance = 80;
    let clarity = 75;
    let engagement = 70;
    let brandAlignment = 85;
    let channelFit = 75;
    const feedback: string[] = [];

    // Đánh giá độ liên quan
    const tixImaxKeywords = ['tiximax', 'vận chuyển', 'mua hộ', 'ship hàng', 'order'];
    const hasRelevantKeywords = tixImaxKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    if (!hasRelevantKeywords) {
      relevance -= 20;
      feedback.push('Nội dung cần nhắc đến Tiximax hoặc dịch vụ rõ ràng hơn');
    }

    // Đánh giá độ rõ ràng
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = content.length / sentences.length;
    if (avgSentenceLength > 100) {
      clarity -= 15;
      feedback.push('Câu văn hơi dài, nên chia nhỏ để dễ đọc hơn');
    }

    // Đánh giá sức hấp dẫn
    const engagementWords = ['bạn', 'chúng ta', 'hãy', '?', '!'];
    const engagementCount = engagementWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
    );
    if (engagementCount < 3) {
      engagement -= 15;
      feedback.push('Thêm câu hỏi hoặc lời kêu gọi để tăng tương tác');
    }

    // Đánh giá phù hợp kênh
    if (channelType.toLowerCase().includes('tiktok') || channelType.toLowerCase().includes('video')) {
      if (content.length > 200) {
        channelFit -= 20;
        feedback.push('Nội dung video nên ngắn gọn hơn cho TikTok');
      }
    } else if (channelType.toLowerCase().includes('blog')) {
      if (content.length < 500) {
        channelFit -= 15;
        feedback.push('Blog cần nội dung dài hơn để SEO tốt');
      }
    }

    const totalScore = Math.round((relevance + clarity + engagement + brandAlignment + channelFit) / 5);

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      criteria: {
        relevance,
        clarity,
        engagement,
        brand_alignment: brandAlignment,
        channel_fit: channelFit
      },
      feedback
    };
  }
}