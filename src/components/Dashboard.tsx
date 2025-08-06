import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  TrendingUp, 
  Activity,
  Calendar,
  Clock,
  BarChart3,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface DashboardProps {
  currentUser: { name: string; email: string; role: string };
}

interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalConversations: number;
  activeUsers: number;
  likeCount: number;
  dislikeCount: number;
  documentTypeStats: {
    pdf: number;
    word: number;
    excel: number;
    powerpoint: number;
    other: number;
  };
  recentUploads: Array<{
    id: string;
    filename: string;
    uploadDate: string;
    size: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    joinDate: string;
  }>;
  conversationStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDocuments: 0,
    totalConversations: 0,
    activeUsers: 0,
    likeCount: 0,
    dislikeCount: 0,
    documentTypeStats: {
      pdf: 0,
      word: 0,
      excel: 0,
      powerpoint: 0,
      other: 0
    },
    recentUploads: [],
    recentUsers: [],
    conversationStats: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data immediately
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch real data from API
        const dashboardData = await apiService.getDashboardStats();
        setStats(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 24,
          totalDocuments: 156,
          totalConversations: 342,
          activeUsers: 18,
          likeCount: 89,
          dislikeCount: 12,
          documentTypeStats: {
            pdf: 89,
            word: 34,
            excel: 18,
            powerpoint: 12,
            other: 3
          },
          recentUploads: [
            { id: '1', filename: 'XRP_Flex_Manual.pdf', uploadDate: '2024-01-15', size: '2.4 MB' },
            { id: '2', filename: 'Configuration_Guide.docx', uploadDate: '2024-01-14', size: '1.8 MB' },
            { id: '3', filename: 'User_Setup.pdf', uploadDate: '2024-01-13', size: '3.2 MB' },
            { id: '4', filename: 'API_Documentation.pdf', uploadDate: '2024-01-12', size: '4.1 MB' }
          ],
          recentUsers: [
            { id: '1', name: 'Marie Dubois', email: 'marie.dubois@company.com', joinDate: '2024-01-15' },
            { id: '2', name: 'Jean Martin', email: 'jean.martin@company.com', joinDate: '2024-01-14' },
            { id: '3', name: 'Sophie Bernard', email: 'sophie.bernard@company.com', joinDate: '2024-01-13' },
            { id: '4', name: 'Pierre Moreau', email: 'pierre.moreau@company.com', joinDate: '2024-01-12' }
          ],
          conversationStats: {
            today: 23,
            thisWeek: 156,
            thisMonth: 342
          }
        });
      }
      
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: color }}>
          <Icon size={24} />
        </div>
        <div className="stat-trend">
          {trend && (
            <div className={`trend-indicator ${trend.isPositive ? 'positive' : 'negative'}`}>
              <TrendingUp size={16} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value.toLocaleString()}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  const RecentItem = ({ 
    title, 
    subtitle, 
    date, 
    icon: Icon 
  }: {
    title: string;
    subtitle: string;
    date: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }) => (
    <div className="recent-item">
      <div className="recent-icon">
        <Icon size={20} />
      </div>
      <div className="recent-content">
        <h4 className="recent-title">{title}</h4>
        <p className="recent-subtitle">{subtitle}</p>
        <span className="recent-date">{date}</span>
      </div>
    </div>
  );

  // Circular Progress Component
  const CircularProgress = ({ 
    percentage, 
    size = 120, 
    strokeWidth = 8, 
    color = "#10B981" 
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress-container" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="circular-progress">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="circular-progress-text">
          <span className="circular-percentage">{percentage}%</span>
          <span className="circular-label">Satisfaction</span>
        </div>
      </div>
    );
  };

  // Calculate comprehensive feedback statistics
  const totalFeedback = stats.likeCount + stats.dislikeCount;
  const satisfactionRate = totalFeedback > 0 ? Math.round((stats.likeCount / totalFeedback) * 100) : 0;
  const averageLikesPerConversation = stats.totalConversations > 0 ? (stats.likeCount / stats.totalConversations).toFixed(1) : '0.0';
  const averageDislikesPerConversation = stats.totalConversations > 0 ? (stats.dislikeCount / stats.totalConversations).toFixed(1) : '0.0';
  
  // Calculate feedback engagement rate (percentage of conversations with any feedback)
  const feedbackEngagementRate = stats.totalConversations > 0 
    ? Math.min(Math.round((totalFeedback / stats.totalConversations) * 100), 100)
    : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page-modern-wrapper">
      <div className="dashboard-page-header">
        <button className="dashboard-back-btn-fixed" onClick={() => navigate('/chatbot')} title="Back to Chatbot">
          <ArrowLeft size={20} />
        </button>
        <div className="dashboard-page-header-icon">
          <BarChart3 size={36} />
        </div>
        <div>
          <h1 className="dashboard-page-header-title">Dashboard</h1>
          <div className="dashboard-page-header-sub">Welcome back, {currentUser.name}</div>
        </div>
      </div>
      <div className="dashboard-page-main">
        <div className="dashboard-content-grid">
          <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="#3B82F6"
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={FileText}
          color="#10B981"
        />
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon={MessageCircle}
          color="#F59E0B"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="#8B5CF6"
        />
        <StatCard
          title="Liked Responses"
          value={stats.likeCount}
          icon={ThumbsUp}
          color="#10B981"
        />
        <StatCard
          title="Disliked Responses"
          value={stats.dislikeCount}
          icon={ThumbsDown}
          color="#EF4444"
        />
      </div>

      <div className="dashboard-content">
        <div className="content-grid">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Uploads</h2>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="recent-list">
              {stats.recentUploads.map((upload) => (
                <RecentItem
                  key={upload.id}
                  title={upload.filename}
                  subtitle={upload.size}
                  date={upload.uploadDate}
                  icon={FileText}
                />
              ))}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>Recent Users</h2>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="recent-list">
              {stats.recentUsers.map((user) => (
                <RecentItem
                  key={user.id}
                  title={user.name}
                  subtitle={user.email}
                  date={user.joinDate}
                  icon={Users}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="conversation-stats">
          <div className="stats-header">
            <h2>Conversation Statistics</h2>
            <div className="stats-period">
              <Clock size={16} />
              <span>Last 30 days</span>
            </div>
          </div>
          <div className="stats-cards">
            <div className="stat-period-card">
              <div className="period-value">{stats.conversationStats.today}</div>
              <div className="period-label">Today</div>
            </div>
            <div className="stat-period-card">
              <div className="period-value">{stats.conversationStats.thisWeek}</div>
              <div className="period-label">This Week</div>
            </div>
            <div className="stat-period-card">
              <div className="period-value">{stats.conversationStats.thisMonth}</div>
              <div className="period-label">This Month</div>
            </div>
          </div>
        </div>

                 <div className="feedback-stats">
           <div className="stats-header">
             <h2>Feedback Analytics</h2>
             <div className="stats-period">
               <BarChart3 size={16} />
               <span>Based on {totalFeedback} total feedback responses</span>
             </div>
           </div>
          <div className="feedback-summary">
            <div className="feedback-circular-section">
              <CircularProgress 
                percentage={satisfactionRate} 
                size={140} 
                strokeWidth={10} 
                color="#10B981" 
              />
              <div className="feedback-circular-info">
                <div className="feedback-main-stat">
                  <span className="feedback-main-value">{satisfactionRate}%</span>
                  <span className="feedback-main-label">Satisfaction Rate</span>
                </div>
                <div className="feedback-sub-stats">
                  <div className="feedback-sub-stat">
                    <ThumbsUp size={16} className="feedback-sub-icon positive" />
                    <span>{stats.likeCount} likes</span>
                  </div>
                  <div className="feedback-sub-stat">
                    <ThumbsDown size={16} className="feedback-sub-icon negative" />
                    <span>{stats.dislikeCount} dislikes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="feedback-details">
              <div className="feedback-detail-item">
                <div className="feedback-detail-label">Average Likes per Conversation</div>
                <div className="feedback-detail-value">{averageLikesPerConversation}</div>
              </div>
              <div className="feedback-detail-item">
                <div className="feedback-detail-label">Average Dislikes per Conversation</div>
                <div className="feedback-detail-value">{averageDislikesPerConversation}</div>
              </div>
              <div className="feedback-detail-item">
                <div className="feedback-detail-label">Total Conversations</div>
                <div className="feedback-detail-value">{stats.totalConversations}</div>
              </div>
                             <div className="feedback-detail-item">
                 <div className="feedback-detail-label">Conversations with Feedback</div>
                 <div className="feedback-detail-value">
                   {feedbackEngagementRate}%
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="document-type-stats">
          <div className="stats-header">
            <h2>Document Type Distribution</h2>
            <div className="stats-period">
              <FileText size={16} />
              <span>Total: {stats.totalDocuments} documents</span>
            </div>
          </div>
          <div className="document-type-summary">
            <div className="document-type-item">
              <div className="document-type-icon pdf">
                <FileText size={20} />
              </div>
              <div className="document-type-content">
                <div className="document-type-value">{stats.documentTypeStats.pdf}</div>
                <div className="document-type-label">PDF Files</div>
                <div className="document-type-percentage">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.documentTypeStats.pdf / stats.totalDocuments) * 100)
                    : 0}% of total
                </div>
              </div>
            </div>
            <div className="document-type-item">
              <div className="document-type-icon word">
                <FileText size={20} />
              </div>
              <div className="document-type-content">
                <div className="document-type-value">{stats.documentTypeStats.word}</div>
                <div className="document-type-label">Word Documents</div>
                <div className="document-type-percentage">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.documentTypeStats.word / stats.totalDocuments) * 100)
                    : 0}% of total
                </div>
              </div>
            </div>
            <div className="document-type-item">
              <div className="document-type-icon excel">
                <FileText size={20} />
              </div>
              <div className="document-type-content">
                <div className="document-type-value">{stats.documentTypeStats.excel}</div>
                <div className="document-type-label">Excel Files</div>
                <div className="document-type-percentage">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.documentTypeStats.excel / stats.totalDocuments) * 100)
                    : 0}% of total
                </div>
              </div>
            </div>
            <div className="document-type-item">
              <div className="document-type-icon powerpoint">
                <FileText size={20} />
              </div>
              <div className="document-type-content">
                <div className="document-type-value">{stats.documentTypeStats.powerpoint}</div>
                <div className="document-type-label">PowerPoint Files</div>
                <div className="document-type-percentage">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.documentTypeStats.powerpoint / stats.totalDocuments) * 100)
                    : 0}% of total
                </div>
              </div>
            </div>
            <div className="document-type-item">
              <div className="document-type-icon other">
                <FileText size={20} />
              </div>
              <div className="document-type-content">
                <div className="document-type-value">{stats.documentTypeStats.other}</div>
                <div className="document-type-label">Other Files</div>
                <div className="document-type-percentage">
                  {stats.totalDocuments > 0 
                    ? Math.round((stats.documentTypeStats.other / stats.totalDocuments) * 100)
                    : 0}% of total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Dashboard; 