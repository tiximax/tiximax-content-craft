// User Feedback và Learning System
export interface UserFeedback {
  id: string;
  contentId: string;
  userId?: string;
  rating: number; // 1-5 stars
  aspects: {
    relevance: number;
    creativity: number;
    usefulness: number;
    accuracy: number;
  };
  textFeedback?: string;
  improvements?: string[];
  wouldUseAgain: boolean;
  timestamp: Date;
}

export interface ContentAnalytics {
  contentId: string;
  views: number;
  copies: number;
  downloads: number;
  ratings: UserFeedback[];
  avgRating: number;
  successRate: number;
}

export class FeedbackSystem {
  private static readonly STORAGE_KEY = 'tiximax_content_feedback';
  private static readonly ANALYTICS_KEY = 'tiximax_content_analytics';

  // Lưu feedback của người dùng
  static saveFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): UserFeedback {
    const fullFeedback: UserFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const existingFeedbacks = this.getAllFeedbacks();
    existingFeedbacks.push(fullFeedback);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedbacks));
    
    // Cập nhật analytics
    this.updateAnalytics(feedback.contentId, 'rating', fullFeedback);
    
    return fullFeedback;
  }

  // Lấy tất cả feedback
  static getAllFeedbacks(): UserFeedback[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Lấy feedback cho content cụ thể
  static getFeedbackForContent(contentId: string): UserFeedback[] {
    return this.getAllFeedbacks().filter(f => f.contentId === contentId);
  }

  // Cập nhật analytics
  static updateAnalytics(contentId: string, action: 'view' | 'copy' | 'download' | 'rating', data?: any) {
    const analytics = this.getAnalytics();
    let contentAnalytics = analytics.find(a => a.contentId === contentId);
    
    if (!contentAnalytics) {
      contentAnalytics = {
        contentId,
        views: 0,
        copies: 0,
        downloads: 0,
        ratings: [],
        avgRating: 0,
        successRate: 0
      };
      analytics.push(contentAnalytics);
    }

    switch (action) {
      case 'view':
        contentAnalytics.views++;
        break;
      case 'copy':
        contentAnalytics.copies++;
        break;
      case 'download':
        contentAnalytics.downloads++;
        break;
      case 'rating':
        if (data) {
          contentAnalytics.ratings.push(data);
          contentAnalytics.avgRating = contentAnalytics.ratings.reduce((sum, r) => sum + r.rating, 0) / contentAnalytics.ratings.length;
          contentAnalytics.successRate = contentAnalytics.ratings.filter(r => r.rating >= 4).length / contentAnalytics.ratings.length * 100;
        }
        break;
    }

    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
  }

  // Lấy analytics
  static getAnalytics(): ContentAnalytics[] {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Lấy insights từ feedback để cải thiện AI
  static getLearningInsights(): {
    commonIssues: string[];
    topRatedFeatures: string[];
    improvementSuggestions: string[];
    userPreferences: { [key: string]: number };
  } {
    const allFeedbacks = this.getAllFeedbacks();
    
    if (allFeedbacks.length === 0) {
      return {
        commonIssues: [],
        topRatedFeatures: [],
        improvementSuggestions: [],
        userPreferences: {}
      };
    }

    // Phân tích vấn đề thường gặp
    const lowRatingFeedbacks = allFeedbacks.filter(f => f.rating <= 2);
    const commonIssues = lowRatingFeedbacks
      .flatMap(f => f.improvements || [])
      .reduce((acc: { [key: string]: number }, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {});

    // Tính feature được đánh giá cao
    const highRatingFeedbacks = allFeedbacks.filter(f => f.rating >= 4);
    const avgAspects = {
      relevance: 0,
      creativity: 0,
      usefulness: 0,
      accuracy: 0
    };

    highRatingFeedbacks.forEach(f => {
      avgAspects.relevance += f.aspects.relevance;
      avgAspects.creativity += f.aspects.creativity;
      avgAspects.usefulness += f.aspects.usefulness;
      avgAspects.accuracy += f.aspects.accuracy;
    });

    Object.keys(avgAspects).forEach(key => {
      avgAspects[key as keyof typeof avgAspects] /= highRatingFeedbacks.length || 1;
    });

    const topRatedFeatures = Object.entries(avgAspects)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([feature]) => feature);

    // Đề xuất cải thiện
    const improvementSuggestions = Object.entries(commonIssues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      commonIssues: Object.keys(commonIssues),
      topRatedFeatures,
      improvementSuggestions,
      userPreferences: avgAspects
    };
  }

  // Reset data (for development)
  static clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);
  }
}