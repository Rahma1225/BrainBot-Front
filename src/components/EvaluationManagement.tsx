import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit, Trash2, ArrowLeft, X, Save, RefreshCw, Search, Filter, FileText, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Evaluation, Question, CreateEvaluationDto, UpdateEvaluationDto, CreateQuestionDto } from '../services/api';
import './EvaluationManagement.css';

const EvaluationManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [formData, setFormData] = useState({
    title: ''
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    Text: '',
    Options: ['', '', '', ''],
    CorrectIndex: 0
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getEvaluations();
      
      if (response && Array.isArray(response)) {
        setEvaluations(response);
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        setEvaluations((response as any).data);
      } else {
        setEvaluations([]);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      setError(`Failed to fetch evaluations: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToChatbot = () => {
    navigate('/chatbot');
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setCurrentEvaluation(null);
    setError('');
    setSuccess('');
    resetForm();
  };

  const handleEdit = (evaluation: Evaluation) => {
    setIsEditing(true);
    setIsCreating(false);
    setCurrentEvaluation(evaluation);
    setError('');
    setSuccess('');
    setFormData({
      title: evaluation.Title || evaluation.title || ''
    });
    setQuestions([...(evaluation.Questions || evaluation.questions || [])]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      try {
        setLoading(true);
        await apiService.deleteEvaluation(id);
        setEvaluations(evaluations.filter(evaluation => (evaluation.Id || evaluation.id) !== id));
        setSuccess('Evaluation deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Failed to delete evaluation:', error);
        setError('Failed to delete evaluation');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: ''
    });
    setQuestions([]);
    setCurrentQuestion({
      Text: '',
      Options: ['', '', '', ''],
      CorrectIndex: 0
    });
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

  const handleSaveEvaluation = async () => {
    if (!formData.title || questions.length === 0) {
      setError('Please fill in all required fields and add at least one question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && currentEvaluation) {
        const updateData: UpdateEvaluationDto = {
          Id: currentEvaluation.Id || currentEvaluation.id || '',
          Title: formData.title,
          Questions: questions
        };
        await apiService.updateEvaluation(currentEvaluation.Id || currentEvaluation.id || '', updateData);
        await fetchEvaluations();
        setSuccess('Evaluation updated successfully!');
      } else {
        const createData: CreateEvaluationDto = {
          Id: '', // Backend will generate the ID
          Title: formData.title,
          Questions: questions
        };
        await apiService.createEvaluation(createData);
        await fetchEvaluations();
        setSuccess('Evaluation created successfully!');
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setCurrentEvaluation(null);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      setError('Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (currentQuestion.Text.trim() && currentQuestion.Options.every(opt => opt.trim())) {
      if (editingQuestionIndex !== null) {
        const updatedQuestions = [...questions];
        updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
        setQuestions(updatedQuestions);
        setEditingQuestionIndex(null);
      } else {
        setQuestions([...questions, { ...currentQuestion }]);
      }
      setCurrentQuestion({
        Text: '',
        Options: ['', '', '', ''],
        CorrectIndex: 0
      });
      setShowQuestionForm(false);
    } else {
      setError('Please fill in all question fields');
    }
  };

  const editQuestion = (index: number) => {
    const question = questions[index];
    // Handle both uppercase and lowercase property names
    const questionData = {
      Text: question.Text || (question as any).text || '',
      Options: question.Options || (question as any).options || ['', '', '', ''],
      CorrectIndex: question.CorrectIndex !== undefined ? question.CorrectIndex : (question as any).correctIndex || 0
    };
    setCurrentQuestion(questionData);
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    // Handle both API response structure (lowercase) and expected structure (uppercase)
    const title = evaluation.Title || evaluation.title || '';
    const searchLower = searchTerm.toLowerCase().trim();
    
    // If no search term, show all evaluations
    if (!searchLower) {
      return true;
    }
    
    // Partial matching - check if search term is contained anywhere in the title
    const titleLower = title.toLowerCase();
    
    // Check if search term is contained in title
    if (titleLower.includes(searchLower)) {
      return true;
    }
    
    // Also check if any word in the title contains the search term
    const titleWords = titleLower.split(' ');
    return titleWords.some(word => word.includes(searchLower));
  });



  if (loading && evaluations.length === 0) {
    return (
      <div className="evaluation-management-page-modern-wrapper">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Component rendering

  return (
    <div className="evaluation-management-page-modern-wrapper">
      {/* Back Button */}
      <button className="user-management-back-btn-fixed" onClick={handleBackToChatbot}>
        <ArrowLeft size={20} />
      </button>

      {/* Header */}
      <div className="user-management-page-header">
        <div className="user-management-page-header-icon">
          <ClipboardList size={28} />
        </div>
        <div>
          <h1 className="user-management-page-header-title">Evaluation Management</h1>
          <p className="user-management-page-header-sub">Create, organize, and manage assessment tests and quizzes</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="user-management-page-main">
        <div className="user-management-content">
          {/* Success/Error Messages */}
          {success && (
            <div className="add-user-message success">
              {success}
            </div>
          )}
          {error && (
            <div className="add-user-message error">
              {error}
              <button onClick={() => setError('')} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
                         <div className="filter-controls">
               <button
                 onClick={handleCreateNew}
                 className="add-user-btn"
                 style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' }}
               >
                 <Plus size={16} />
                 Create Evaluation
               </button>
             </div>
          </div>

          {/* Evaluations Cards */}
          <div className="evaluations-grid">
            {filteredEvaluations.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" size={48} />
                <h3>No evaluations found</h3>
                <p>Create your first evaluation to get started</p>
              </div>
            ) : (
              filteredEvaluations.map((evaluation) => (
                <div key={evaluation.Id || evaluation.id} className="evaluation-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <FileText size={24} />
                    </div>
                    <div className="card-title">
                      <h3>{evaluation.Title || evaluation.title}</h3>
                      <span className="card-subtitle">
                        {(evaluation.Questions || evaluation.questions)?.length || 0} questions
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="questions-preview">
                                              {(evaluation.Questions || evaluation.questions)?.slice(0, 2).map((question, index) => (
                          <div key={index} className="question-preview">
                            <div className="question-number">Q{index + 1}</div>
                            <div className="question-text">
                              {question.Text || (question as any).text || 'No question text'}
                            </div>
                          </div>
                        ))}
                      {((evaluation.Questions || evaluation.questions)?.length || 0) > 2 && (
                        <div className="more-questions">
                          +{((evaluation.Questions || evaluation.questions)?.length || 0) - 2} more questions
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button
                      className="card-action-btn edit-btn"
                      onClick={() => handleEdit(evaluation)}
                      title="Edit evaluation"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      className="card-action-btn delete-btn"
                      onClick={() => handleDelete(evaluation.Id || evaluation.id || '')}
                      title="Delete evaluation"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Evaluation' : 'Create New Evaluation'}</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setCurrentEvaluation(null);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="add-user-form">
              <div className="form-group">
                <label>Evaluation Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter evaluation title"
                />
              </div>

              <div className="questions-section">
                <div className="section-header">
                  <h3>Questions ({questions.length})</h3>
                  <button
                    className="add-question-btn"
                    onClick={() => setShowQuestionForm(true)}
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                {questions.map((question, index) => (
                  <div key={index} className="question-block">
                    <div className="question-header">
                      <h4>Question {index + 1}</h4>
                      <div className="table-actions">
                        <button
                          className="table-action-btn edit-btn"
                          onClick={() => editQuestion(index)}
                          title="Edit question"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          onClick={() => removeQuestion(index)}
                          title="Remove question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="question-text">{question.Text || (question as any).text}</p>
                    <div className="view-options">
                      {(question.Options || (question as any).options || []).map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`view-option ${optIndex === (question.CorrectIndex !== undefined ? question.CorrectIndex : (question as any).correctIndex) ? 'correct' : ''}`}
                        >
                          <div className="option-letter">
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <span className="option-text">{option}</span>
                          {optIndex === (question.CorrectIndex !== undefined ? question.CorrectIndex : (question as any).correctIndex) && (
                            <span className="correct-check">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {showQuestionForm && (
                  <div className="question-block">
                    <div className="question-header">
                      <h4>{editingQuestionIndex !== null ? `Edit Question ${editingQuestionIndex + 1}` : 'Add New Question'}</h4>
                      <button
                        className="modal-close-btn"
                        onClick={() => {
                          setShowQuestionForm(false);
                          setEditingQuestionIndex(null);
                          setCurrentQuestion({
                            Text: '',
                            Options: ['', '', '', ''],
                            CorrectIndex: 0
                          });
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="form-group">
                      <label>Question Text</label>
                      <textarea
                        value={currentQuestion.Text}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, Text: e.target.value })}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </div>
                    <div className="options-section">
                      <label>Options</label>
                      {(currentQuestion.Options || []).map((option, index) => (
                        <div key={index} className="option-row">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={currentQuestion.CorrectIndex === index}
                            onChange={() => setCurrentQuestion({ ...currentQuestion, CorrectIndex: index })}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.Options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, Options: newOptions });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                          {currentQuestion.CorrectIndex === index && (
                            <span className="correct-indicator">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="modal-actions">
                      <button
                        className="modal-submit-btn"
                        onClick={addQuestion}
                      >
                        <Save size={16} />
                        {editingQuestionIndex !== null ? 'Update' : 'Add Question'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="modal-cancel-btn"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setCurrentEvaluation(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-submit-btn"
                  onClick={handleSaveEvaluation}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : (isEditing ? 'Save Evaluation' : 'Create Evaluation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationManagement;
