export const NODE_COLORS = {
  projects: '#00ff88',
  certs: '#ffaa00',
  community: '#ff0055',
  knowledge: '#bc13fe',
  core: '#00f3ff',
  brain: '#bc13fe',
  warn: '#ffaa00',
} as const;

export const MODES = {
  STORY: 'STORY',
} as const;

export type Mode = (typeof MODES)[keyof typeof MODES];

export const DEFAULT_ARTICLE: string[] = [
  'Kiến thức chuyên sâu về lĩnh vực này đang được tổng hợp và biên soạn. Với vai trò là một System Architect, việc nắm vững các nền tảng cốt lõi là điều bắt buộc để đảm bảo tính mở rộng và bảo mật của hệ thống.',
  'Mục tiêu của tôi luôn là cân bằng giữa công nghệ hiện đại và giá trị thực tiễn mang lại cho doanh nghiệp, từ đó tối ưu hóa chi phí và tăng tốc độ phát triển (Time-to-market).',
  'Liên hệ trực tiếp với tôi qua LinkedIn để trao đổi sâu hơn về các pattern và chiến lược triển khai trong thực tế.',
];

export interface ProjectItem {
  id: string;
  role: string;
  title: string;
  subtitle: string;
  vision: string;
  arch: string;
  impl: string;
  busCase: string;
  tags: string[];
}

export interface CertItem {
  id: string;
  role: string;
  title: string;
  subtitle: string;
  vision: string;
  arch: string;
  impl: string;
  busCase: string;
  tags: string[];
}

export interface CommunityItem {
  id: string;
  role: string;
  title: string;
  subtitle: string;
  vision: string;
  arch: string;
  impl: string;
  busCase: string;
  tags: string[];
}

export interface Topic {
  name: string;
  icon: string;
  content: string;
  article: string[];
}

export interface KnowledgeItem {
  id: string;
  role: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  topics: Topic[];
  tags: string[];
}

export interface CoreNodeData {
  id: string;
  type: 'core';
  title: string;
  subtitle: string;
  list: ProjectItem[] | CertItem[] | CommunityItem[];
  color: string;
  icon: string;
  tags?: string[];
}

export interface SubNodeData {
  id: string;
  type: 'sub';
  role: string;
  title: string;
  subtitle: string;
  vision: string;
  arch: string;
  impl: string;
  busCase: string;
  tags: string[];
  color?: string;
  icon?: string;
}

export type NodeData = CoreNodeData | SubNodeData;


