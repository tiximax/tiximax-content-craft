// Channel Configuration Types for Tiximax Content System

export interface ChannelConfig {
  channel_id: string;
  channel_name: string;
  platform_type: 'Social Media' | 'Video Sharing' | 'Blog/Website' | 'Professional Network' | 'Messaging Platform';
  audience_demographics_focus: string;
  key_characteristics: {
    tone_of_voice_priority: string[];
    content_length_guideline: string;
    visual_style_guideline: string;
    common_formats: string[];
    hashtag_strategy: string;
    call_to_action_preference: string;
    character_limit?: number;
    link_placement_guideline: string;
  };
  specific_examples_or_notes: string;
}

export const DEFAULT_CHANNEL_CONFIGS: ChannelConfig[] = [
  {
    channel_id: 'tiktok_short_video',
    channel_name: 'TikTok Short Video',
    platform_type: 'Video Sharing',
    audience_demographics_focus: 'Gen Z, Việt Nam, yêu thích giải trí và xu hướng, tư duy nhanh',
    key_characteristics: {
      tone_of_voice_priority: ['Hài hước', 'Năng động', 'Thân thiện', 'Trendy'],
      content_length_guideline: 'Ngắn gọn, kịch bản 8-15 giây',
      visual_style_guideline: 'Video nhanh, màu sắc tươi sáng, cận cảnh biểu cảm, transition độc đáo',
      common_formats: ['Video ngắn 8s', 'Thử thách', 'Transition', 'Story time', 'Comedy skit'],
      hashtag_strategy: 'Sử dụng hashtag trending, tối đa 5-7 hashtags, kết hợp trending + niche',
      call_to_action_preference: 'Trực tiếp, kêu gọi inbox/ghé link bio, "Thả tym nếu đồng ý"',
      character_limit: 2200,
      link_placement_guideline: 'Link Bio hoặc comment đầu tiên'
    },
    specific_examples_or_notes: 'Cần sử dụng nhạc trending, có phụ đề Việt Nam, hook trong 3 giây đầu'
  },
  {
    channel_id: 'facebook_fanpage',
    channel_name: 'Facebook Fanpage Chính Thức',
    platform_type: 'Social Media',
    audience_demographics_focus: 'Millennials + Gen X Việt Nam, quan tâm kinh doanh và mua sắm online',
    key_characteristics: {
      tone_of_voice_priority: ['Đáng tin cậy', 'Chuyên nghiệp', 'Thân thiện', 'Hỗ trợ'],
      content_length_guideline: 'Trung bình 200-500 từ, có thể dài hơn nếu educational',
      visual_style_guideline: 'Ảnh chất lượng cao, màu sắc nhã nhặn, text overlay rõ ràng',
      common_formats: ['Status update', 'Photo post', 'Video short form', 'Link sharing', 'Event post'],
      hashtag_strategy: 'Ít hashtag (3-5), tập trung brand hashtag và location hashtag',
      call_to_action_preference: 'Mềm mại, giáo dục trước bán hàng, "Tìm hiểu thêm", "Inbox để được tư vấn"',
      character_limit: 63206,
      link_placement_guideline: 'Trong post hoặc comment đầu tiên'
    },
    specific_examples_or_notes: 'Tương tác cao vào 19h-22h, nên có emoji nhưng không quá nhiều'
  },
  {
    channel_id: 'instagram_reels',
    channel_name: 'Instagram Reels',
    platform_type: 'Social Media',
    audience_demographics_focus: 'Nữ giới 18-35 tuổi, yêu thích thời trang và lifestyle',
    key_characteristics: {
      tone_of_voice_priority: ['Thẩm mỹ', 'Cảm hứng', 'Năng động', 'Trendy'],
      content_length_guideline: 'Visual-first, caption ngắn gọn dưới 100 từ',
      visual_style_guideline: 'Thẩm mỹ cao, filter đẹp, composition chuyên nghiệp, trendy transitions',
      common_formats: ['Reels video', 'Stories', 'IGTV', 'Carousel post'],
      hashtag_strategy: 'Mix 30 hashtags: trending + niche + brand + location',
      call_to_action_preference: 'Visual CTA, "Save post này", "Share với bestie", "DM để order"',
      character_limit: 2200,
      link_placement_guideline: 'Link in bio, Stories swipe up (nếu có)'
    },
    specific_examples_or_notes: 'Focus vào aesthetic, trending audio quan trọng, Stories polls và Q&A'
  },
  {
    channel_id: 'blog_website_seo',
    channel_name: 'Blog Website SEO',
    platform_type: 'Blog/Website',
    audience_demographics_focus: 'Chủ doanh nghiệp và người có nhu cầu tìm hiểu sâu về logistics',
    key_characteristics: {
      tone_of_voice_priority: ['Chuyên gia', 'Chi tiết', 'Đáng tin cậy', 'Educational'],
      content_length_guideline: 'Dài và chi tiết, 1500-3000+ từ',
      visual_style_guideline: 'Infographic, charts, screenshots, ảnh minh họa chuyên nghiệp',
      common_formats: ['How-to guide', 'Case study', 'Industry analysis', 'Comparison post'],
      hashtag_strategy: 'SEO keywords quan trọng hơn hashtags',
      call_to_action_preference: 'Educational lead magnet, "Tải báo cáo miễn phí", "Đăng ký consultation"',
      link_placement_guideline: 'Internal linking mạnh, external authority links'
    },
    specific_examples_or_notes: 'Focus vào SEO on-page, keyword density, meta description, featured snippets'
  },
  {
    channel_id: 'youtube_shorts',
    channel_name: 'YouTube Shorts',
    platform_type: 'Video Sharing',
    audience_demographics_focus: 'Mixed demographics, quan tâm education và entertainment',
    key_characteristics: {
      tone_of_voice_priority: ['Educational', 'Engaging', 'Clear explanation'],
      content_length_guideline: 'Video dưới 60 giây, hook trong 3 giây đầu',
      visual_style_guideline: 'Vertical video, text overlay lớn và rõ, thumbnail eye-catching',
      common_formats: ['Tutorial ngắn', 'Tips & tricks', 'Behind the scenes', 'Q&A'],
      hashtag_strategy: 'Hashtag trong description, focus vào #Shorts',
      call_to_action_preference: 'Subscribe, Like, Comment với câu hỏi engage',
      link_placement_guideline: 'Description hoặc pinned comment'
    },
    specific_examples_or_notes: 'Algorithm prefer engagement, loop-able content tốt'
  },
  {
    channel_id: 'linkedin_business',
    channel_name: 'LinkedIn Business',
    platform_type: 'Professional Network',
    audience_demographics_focus: 'Chủ doanh nghiệp, managers, professionals quan tâm B2B',
    key_characteristics: {
      tone_of_voice_priority: ['Professional', 'Authoritative', 'Industry insight', 'Networking'],
      content_length_guideline: 'Medium form 300-800 từ, có thể longer form cho thought leadership',
      visual_style_guideline: 'Professional imagery, infographics, company branding',
      common_formats: ['Industry insight', 'Company update', 'Thought leadership', 'Case study'],
      hashtag_strategy: 'Professional hashtags, industry-specific, tối đa 5 hashtags',
      call_to_action_preference: 'Professional connection, "Connect để thảo luận", "Schedule meeting"',
      link_placement_guideline: 'Trong post text hoặc first comment'
    },
    specific_examples_or_notes: 'Publish vào giờ làm việc, engagement từ industry peers quan trọng'
  },
  {
    channel_id: 'zalo_oa',
    channel_name: 'Zalo Official Account',
    platform_type: 'Messaging Platform',
    audience_demographics_focus: 'Khách hàng hiện tại và potential customers tại Việt Nam',
    key_characteristics: {
      tone_of_voice_priority: ['Thân thiện', 'Hỗ trợ', 'Responsive', 'Personal'],
      content_length_guideline: 'Ngắn gọn, straight to the point, dưới 200 từ',
      visual_style_guideline: 'Mobile-first design, stickers và emoji phù hợp',
      common_formats: ['Broadcast message', 'Rich media', 'Interactive templates'],
      hashtag_strategy: 'Không cần hashtag, focus vào personalization',
      call_to_action_preference: 'Direct action, "Nhấn nút bên dưới", "Reply tin nhắn này"',
      link_placement_guideline: 'Button links trong rich media templates'
    },
    specific_examples_or_notes: 'Tối ưu cho mobile, response time nhanh, personal touch quan trọng'
  }
];

// Utility functions
export const getChannelConfig = (channelId: string): ChannelConfig | null => {
  return DEFAULT_CHANNEL_CONFIGS.find(config => config.channel_id === channelId) || null;
};

export const getChannelConfigByName = (channelName: string): ChannelConfig | null => {
  return DEFAULT_CHANNEL_CONFIGS.find(config => 
    config.channel_name.toLowerCase().includes(channelName.toLowerCase()) ||
    channelName.toLowerCase().includes(config.channel_name.toLowerCase())
  ) || null;
};