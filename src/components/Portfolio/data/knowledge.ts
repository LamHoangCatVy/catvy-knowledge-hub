import type { KnowledgeItem } from './constants';
import { DEFAULT_ARTICLE } from './constants';

export const KNOWLEDGE_DATA: KnowledgeItem[] = [
  {
    id: 'know_1', role: 'Domain Expertise', title: 'Generative AI & LLMs', subtitle: 'Advanced RAG & Orchestration', color: '#00f3ff', icon: 'fas fa-robot',
    topics: [
      {
        name: 'Agentic RAG', icon: 'fas fa-project-diagram', content: 'Hệ thống đa Agent có khả năng tự suy luận, lập kế hoạch và sử dụng tools để truy xuất dữ liệu động.',
        article: [
          "RAG (Retrieval-Augmented Generation) truyền thống thường gặp giới hạn khi đối mặt với các truy vấn phức tạp yêu cầu tổng hợp thông tin từ nhiều nguồn hoặc cần suy luận logic nhiều bước. Đó là lúc Agentic RAG tỏa sáng.",
          "Kiến trúc Agentic RAG tích hợp các 'Agent' có khả năng lập kế hoạch (Planning) và sử dụng công cụ (Tool Use). Khi nhận một câu hỏi khó, Router Agent sẽ phân rã nó thành các câu hỏi phụ (Sub-queries), sau đó giao cho các Sub-Agent chuyên trách đi tìm kiếm dữ liệu trong Vector Database, SQL Database hoặc gọi API bên ngoài.",
          "Điểm đột phá là cơ chế 'Self-Reflection'. Agent có thể tự đọc lại kết quả nó vừa tìm được, nếu thấy chưa đủ ngữ cảnh, nó sẽ tự động tạo một truy vấn mới để tìm kiếm thêm. Điều này giúp câu trả lời cuối cùng cực kỳ toàn diện và chính xác.",
          "Tại my company, tôi đã ứng dụng kiến trúc này để xử lý hàng ngàn văn bản chính sách phức tạp, nơi một câu trả lời thường đòi hỏi phải tra chéo nhiều quy định khác nhau, nâng độ chính xác từ <20% lên >90%."
        ]
      },
      {
        name: 'GraphRAG', icon: 'fas fa-share-alt', content: 'Kết hợp Knowledge Graphs với Vector Databases để giải quyết các câu hỏi về mối quan hệ phức tạp.',
        article: [
          "Dữ liệu doanh nghiệp hiếm khi tồn tại độc lập. Chúng thường có mối quan hệ chằng chịt với nhau (ví dụ: Nhân viên A thuộc Phòng B, Phòng B chịu trách nhiệm Dự án C). Vector Database truyền thống rất kém trong việc nắm bắt các luồng quan hệ này.",
          "GraphRAG là giải pháp hoàn hảo. Bằng cách sử dụng Neo4j hoặc Amazon Neptune để xây dựng Knowledge Graph, chúng ta cung cấp cho LLM một 'bản đồ tư duy' rõ ràng về các thực thể (Entities) và mối quan hệ (Relationships) của chúng.",
          "Khi một truy vấn được gửi đến, hệ thống không chỉ tìm kiếm các đoạn văn bản có ý nghĩa tương đồng, mà còn duyệt qua các node trên đồ thị để mang về toàn bộ ngữ cảnh kết nối. Điều này đặc biệt hữu ích trong các bài toán điều tra gian lận (Anti-Money Laundering) hoặc phân tích cấu trúc công ty."
        ]
      },
      {
        name: 'LLM Orchestration', icon: 'fas fa-cogs', content: 'Quản lý luồng gọi LLM thông qua LangChain/LlamaIndex. Tối ưu hóa Chunking và Prompt Engineering.',
        article: DEFAULT_ARTICLE
      }
    ], tags: ['GenAI', 'RAG', 'LLMs', 'Agentic']
  },
  {
    id: 'know_2', role: 'Domain Expertise', title: 'Systems Analysis', subtitle: 'Enterprise Integration', color: '#bc13fe', icon: 'fas fa-sitemap',
    topics: [
      {
        name: 'System Design Knowledge', icon: 'fas fa-network-wired', content: 'Nghệ thuật của sự đánh đổi (Trade-offs) trong việc thiết kế hệ thống chịu tải cao, Scalability và Availability.',
        article: [
          "System Design không chỉ là việc vẽ ra những ô vuông và mũi tên. Nó là nghệ thuật của sự đánh đổi (Trade-offs). Bạn chọn Consistency (Tính nhất quán) hay Availability (Tính sẵn sàng)? Bạn tối ưu cho Read (Đọc) hay Write (Ghi)?",
          "Một kiến trúc sư hệ thống giỏi phải nắm vững các pattern kinh điển như Microservices, Event-Driven Architecture, CQRS, và Saga. Khi thiết kế hệ thống CAIP (Conversational AI Platform) chịu tải cao, tôi đã phải cân nhắc kỹ lưỡng việc sử dụng Kafka để xử lý hàng đợi tin nhắn (Message Queue), đảm bảo hệ thống không bị nghẽn khi lượng request tăng đột biến.",
          "Bên cạnh đó, Database Design là trái tim của hệ thống. Hiểu rõ khi nào dùng Relational DB (PostgreSQL) để đảm bảo tính ACID, khi nào dùng NoSQL (MongoDB) cho dữ liệu phi cấu trúc, và khi nào dùng Vector DB (Milvus/Pinecone) cho các ứng dụng GenAI là chìa khóa để hệ thống có thể scale lên hàng triệu users.",
          "Cuối cùng, mọi thiết kế hệ thống đều phải đi kèm với chiến lược Monitoring và Alerting. Nếu không có Log Tracing và Metrics rõ ràng, bạn sẽ bị mù khi hệ thống gặp sự cố trên môi trường Production."
        ]
      },
      {
        name: 'SRS Documentation', icon: 'fas fa-file-alt', content: 'Soạn thảo tài liệu Software Requirements Specification (SRS) chuẩn chỉnh, định nghĩa rõ ràng Use Cases.',
        article: DEFAULT_ARTICLE
      },
      {
        name: 'API Contract Design', icon: 'fas fa-exchange-alt', content: 'Thiết kế và chuẩn hóa RESTful APIs/gRPC đảm bảo tính tương thích ngược cho hệ thống tích hợp.',
        article: DEFAULT_ARTICLE
      }
    ], tags: ['UML', 'BPMN', 'System Design']
  },
  {
    id: 'know_3', role: 'Domain Expertise', title: 'Product Management', subtitle: 'Agile Delivery & Strategy', color: '#ffaa00', icon: 'fas fa-tasks',
    topics: [
      {
        name: 'How to Write Product Vision', icon: 'fas fa-lightbulb', content: 'Bí quyết định hình Product-Market Fit và thiết lập lộ trình (Roadmap) mang lại giá trị thực cho người dùng.',
        article: [
          "Một Product Vision (Tầm nhìn sản phẩm) xuất sắc không phải là một tài liệu dài hàng chục trang mà không ai đọc. Nó là ngôi sao Bắc Đẩu định hướng cho toàn bộ đội ngũ phát triển, thiết kế và kinh doanh.",
          "Bí quyết đầu tiên là phải trả lời được câu hỏi 'Tại sao sản phẩm này tồn tại?'. Nó giải quyết nỗi đau (Pain point) cốt lõi nào của người dùng mà các giải pháp hiện tại đang bỏ ngỏ? Tôi thường sử dụng framework 'Elevator Pitch' để tóm gọn tầm nhìn này trong vỏn vẹn 2-3 câu.",
          "Thứ hai, Tầm nhìn phải được liên kết trực tiếp với các chỉ số kinh doanh (Business Metrics). Một sản phẩm công nghệ hoàn hảo về mặt kiến trúc nhưng không mang lại doanh thu hoặc không tiết kiệm chi phí vận hành thì vẫn là một sản phẩm thất bại. Trong vai trò Product Owner, tôi luôn đảm bảo mọi User Story đều phục vụ cho tầm nhìn chung này.",
          "Cuối cùng, hãy truyền đạt tầm nhìn đó một cách liên tục. Tầm nhìn không chỉ viết ra một lần vào đầu dự án, mà phải được nhắc lại trong mỗi buổi Sprint Planning, mỗi buổi Demo để đảm bảo cả team không bị lệch hướng (Scope Creep)."
        ]
      },
      {
        name: 'Agile & Scrum Methodologies', icon: 'fas fa-sync', content: 'Điều phối team phát triển theo mô hình Scrum. Quản lý Backlog, viết User Stories và Sprint Planning.',
        article: DEFAULT_ARTICLE
      },
      {
        name: 'Stakeholder Management', icon: 'fas fa-users', content: 'Đóng vai trò cầu nối giữa kỹ thuật và Business. Dịch yêu cầu nghiệp vụ thành giải pháp công nghệ.',
        article: DEFAULT_ARTICLE
      }
    ], tags: ['Agile', 'Scrum', 'Vision']
  },
  {
    id: 'know_4', role: 'Domain Expertise', title: 'Cloud Architecture', subtitle: 'AWS Ecosystem', color: '#00ff88', icon: 'fas fa-cloud',
    topics: [
      { name: 'Landing Zone & Governance', icon: 'fas fa-plane-arrival', content: 'Thiết lập môi trường AWS đa tài khoản an toàn, tuân thủ best practices về bảo mật.', article: DEFAULT_ARTICLE },
      { name: 'High Availability & Scaling', icon: 'fas fa-server', content: 'Thiết kế kiến trúc chịu lỗi cao với Multi-AZ, Load Balancing và cơ chế Disaster Recovery.', article: DEFAULT_ARTICLE },
      { name: 'Serverless & FinOps', icon: 'fas fa-bolt', content: 'Tối ưu hóa kiến trúc bằng AWS Lambda, API Gateway để giảm thiểu chi phí vận hành.', article: DEFAULT_ARTICLE }
    ], tags: ['AWS', 'Cloud-Native', 'FinOps']
  },
  {
    id: 'know_5', role: 'Domain Expertise', title: 'Cybersecurity', subtitle: 'Platform Defense', color: '#ff0055', icon: 'fas fa-shield-alt',
    topics: [
      { name: 'AI Guardrails & Prompt Security', icon: 'fas fa-lock', content: 'Thiết lập màng lọc bảo mật chống Prompt Injection, Jailbreak và rò rỉ dữ liệu.', article: DEFAULT_ARTICLE },
      { name: 'Identity & Access Management', icon: 'fas fa-id-card', content: 'Áp dụng nguyên tắc đặc quyền tối thiểu. Quản lý IAM Roles/Policies, tích hợp SSO, MFA.', article: DEFAULT_ARTICLE },
      { name: 'Data Protection & Compliance', icon: 'fas fa-key', content: 'Mã hóa dữ liệu tại chỗ và trên đường truyền, tuân thủ các tiêu chuẩn bảo mật ngân hàng.', article: DEFAULT_ARTICLE }
    ], tags: ['Security', 'IAM', 'Guardrails']
  },
  {
    id: 'know_6', role: 'Domain Expertise', title: 'Data Analytics', subtitle: 'Log Tracing & Insights', color: '#f3f4f6', icon: 'fas fa-chart-pie',
    topics: [
      { name: 'Root Cause Analysis (RCA)', icon: 'fas fa-search', content: 'Truy vết log lỗi phân tán, phân tích nguyên nhân gốc rễ qua SQL/Kibana.', article: DEFAULT_ARTICLE },
      { name: 'Data Visualization', icon: 'fas fa-chart-line', content: 'Trực quan hóa dữ liệu bằng Tableau, Grafana. Xây dựng Dashboard giám sát sức khỏe hệ thống.', article: DEFAULT_ARTICLE },
      { name: 'ETL Pipelines', icon: 'fas fa-database', content: 'Hiểu và thiết kế luồng trích xuất, biến đổi và nạp dữ liệu phục vụ báo cáo.', article: DEFAULT_ARTICLE }
    ], tags: ['SQL', 'Analytics', 'Tracing']
  }
];
