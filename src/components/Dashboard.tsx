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
  ArrowLeft
} from 'lucide-react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  currentUser: { name: string; email: string; role: string };
}

interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalConversations: number;
  activeUsers: number;
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
      
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 24,
        totalDocuments: 156,
        totalConversations: 342,
        activeUsers: 18,
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
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={FileText}
          color="#10B981"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon={MessageCircle}
          color="#F59E0B"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="#8B5CF6"
          trend={{ value: 5, isPositive: false }}
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
      </div>
    </div>
    </div>
    </div>
  );
};

export default Dashboard; 