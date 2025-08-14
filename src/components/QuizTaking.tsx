import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { apiService } from '../services/api';
import type { Evaluation, Question } from '../services/api';
import './QuizTaking.css';

interface QuizTakingProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface QuizResult {
  evaluationId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  questionResults: Array<{
    questionIndex: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

const QuizTaking: React.FC<QuizTakingProps> = ({ currentUser }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvaluations();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [quizStarted, quizCompleted, timeRemaining]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getEvaluations();
      setEvaluations(data);
    } catch (err: any) {
      setError('Failed to load available quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToChatbot = () => {
    navigate('/chatbot');
  };

  const startQuiz = (evaluation: Evaluation) => {
    const questions = evaluation.Questions || evaluation.questions || [];
    if (questions.length === 0) {
      setError('This quiz has no questions available');
      return;
    }

    setSelectedEvaluation(evaluation);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(questions.length).fill(-1)); // -1 means not answered
    setQuizStarted(true);
    setQuizCompleted(false);
    setQuizResult(null);
    setError('');
    
    // Set time limit: 2 minutes per question, minimum 5 minutes, maximum 30 minutes
    const timePerQuestion = 2 * 60; // 2 minutes per question
    const totalTime = Math.min(Math.max(questions.length * timePerQuestion, 5 * 60), 30 * 60);
    setTimeRemaining(totalTime);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedEvaluation?.Questions?.length || selectedEvaluation?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = async () => {
    const questions = selectedEvaluation?.Questions || selectedEvaluation?.questions || [];
    const answeredQuestions = userAnswers.filter(answer => answer !== -1).length;
    
    if (answeredQuestions < questions.length) {
      const remaining = questions.length - answeredQuestions;
      if (!window.confirm(`You have ${remaining} unanswered question(s). Are you sure you want to finish the quiz?`)) {
        return;
      }
    }
    
    await calculateResults();
  };

  const handleQuizTimeout = async () => {
    setQuizCompleted(true);
    await calculateResults();
  };

  const calculateResults = async () => {
    const questions = selectedEvaluation?.Questions || selectedEvaluation?.questions || [];
    let correctAnswers = 0;
    const questionResults: QuizResult['questionResults'] = [];
    
    questions.forEach((question, index) => {
      // More dynamic correct answer detection with debugging
      let correctIndex = question.CorrectIndex || question.correctIndex || question.CorrectAnswer || question.correctAnswer;
      const userAnswerIndex = userAnswers[index];
      
      // Get the actual answer texts
      const options = question.Options || question.options || [];
      
      // If correctIndex is still undefined, try alternative property names
      if (correctIndex === undefined || correctIndex === null) {
        correctIndex = (question as any).correct_answer || (question as any).correctAnswer || (question as any).correct_index || 0;
      }
      
      // Debug logging to understand the data structure
      console.log(`Question ${index + 1}:`, {
        question: question,
        correctIndex: correctIndex,
        userAnswerIndex: userAnswerIndex,
        options: options,
        correctIndexType: typeof correctIndex,
        userAnswerIndexType: typeof userAnswerIndex
      });
      
      // Handle different types of correct answer data
      let actualCorrectIndex = correctIndex;
      if (typeof correctIndex === 'string') {
        // If it's a string, try to convert to number
        actualCorrectIndex = parseInt(correctIndex, 10);
      }
      
      // Ensure we have valid indices
      if (isNaN(actualCorrectIndex) || actualCorrectIndex < 0 || actualCorrectIndex >= options.length) {
        console.warn(`Invalid correct index for question ${index + 1}:`, actualCorrectIndex);
        actualCorrectIndex = 0; // Default to first option if invalid
      }
      
      const userAnswerText = userAnswerIndex !== -1 && options[userAnswerIndex] ? options[userAnswerIndex] : 'Not answered';
      let correctAnswerText = options[actualCorrectIndex] || 'Unknown';
      
      // If we still can't find the correct answer, try to find it by looking for common patterns
      if (correctAnswerText === 'Unknown' && options.length > 0) {
        // Try to find the correct answer by looking for common indicators
        const correctAnswerIndicators = ['correct', 'right', 'true', 'yes', '✓', '✅'];
        const foundCorrectAnswer = options.find(option => 
          correctAnswerIndicators.some(indicator => 
            option.toLowerCase().includes(indicator.toLowerCase())
          )
        );
        if (foundCorrectAnswer) {
          correctAnswerText = foundCorrectAnswer;
          // Update the actual correct index
          actualCorrectIndex = options.indexOf(foundCorrectAnswer);
        }
      }
      
      const isCorrect = userAnswerIndex === actualCorrectIndex;
      if (isCorrect) {
        correctAnswers++;
      }
      
      questionResults.push({
        questionIndex: index + 1,
        questionText: question.Text || (question as any).text || 'No question text',
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect
      });
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    const result: QuizResult = {
      evaluationId: selectedEvaluation?.Id || selectedEvaluation?.id || '',
      score,
      totalQuestions: questions.length,
      correctAnswers,
      completedAt: new Date().toISOString(),
      questionResults
    };
    
    setQuizResult(result);
    setQuizCompleted(true);
    
    // Save result to backend
    try {
      await apiService.saveQuizResult(result);
    } catch (error) {
      // Don't show error to user, just log it
      console.error('Failed to save quiz result:', error);
    }
  };

  const resetQuiz = () => {
    setSelectedEvaluation(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizResult(null);
    setTimeRemaining(0);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    const questions = selectedEvaluation?.Questions || selectedEvaluation?.questions || [];
    return questions[currentQuestionIndex];
  };

  const getProgressPercentage = () => {
    const questions = selectedEvaluation?.Questions || selectedEvaluation?.questions || [];
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="quiz-taking-page-modern-wrapper">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (quizStarted && selectedEvaluation) {
    const currentQuestion = getCurrentQuestion();
    const questions = selectedEvaluation.Questions || selectedEvaluation.questions || [];
    const progressPercentage = getProgressPercentage();

    return (
      <div className="quiz-taking-page-modern-wrapper">
        {/* Back Button */}
        <button className="quiz-taking-back-btn-fixed" onClick={resetQuiz}>
          <ArrowLeft size={20} />
        </button>

        {/* Quiz Header */}
        <div className="quiz-taking-header">
          <div className="quiz-taking-header-icon">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="quiz-taking-header-title">{selectedEvaluation.Title || selectedEvaluation.title}</h1>
            <p className="quiz-taking-header-sub">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="quiz-timer">
          <Clock size={16} />
          <span className={timeRemaining <= 60 ? 'time-warning' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progressPercentage)}%</span>
        </div>

        {/* Question */}
        <div className="quiz-question-container">
          <div className="question-header">
            <h2>Question {currentQuestionIndex + 1}</h2>
            <div className="question-status">
              {userAnswers[currentQuestionIndex] !== -1 ? (
                <CheckCircle size={16} className="answered-icon" />
              ) : (
                <AlertCircle size={16} className="unanswered-icon" />
              )}
            </div>
          </div>
          
          <div className="question-text">
            {currentQuestion?.Text || (currentQuestion as any)?.text || 'No question text'}
          </div>

          {/* Options */}
          <div className="options-container">
            {(currentQuestion?.Options || currentQuestion?.options || []).map((option, index) => (
              <button
                key={index}
                className={`option-button ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={quizCompleted}
              >
                <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                <div className="option-text">{option}</div>
                {userAnswers[currentQuestionIndex] === index && (
                  <CheckCircle size={16} className="selected-icon" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="nav-button prev-button"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          <div className="question-indicators">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentQuestionIndex ? 'current' : ''} ${
                  userAnswers[index] !== -1 ? 'answered' : 'unanswered'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="nav-button finish-button"
              onClick={handleFinishQuiz}
              disabled={quizCompleted}
            >
              Finish Quiz
            </button>
          ) : (
            <button
              className="nav-button next-button"
              onClick={handleNextQuestion}
            >
              Next
            </button>
          )}
        </div>

                 {/* Results Modal */}
         {quizCompleted && quizResult && (
           <div className="results-modal-overlay">
             <div className="results-modal">
               <button className="modal-close-btn" onClick={resetQuiz}>
                 <X size={20} />
               </button>
               <div className="results-header">
                <h2>Quiz Results</h2>
                <div className={`score-circle ${quizResult.score >= 70 ? 'pass' : 'fail'}`}>
                  <span className="score-number">{quizResult.score}%</span>
                </div>
              </div>
              
                             <div className="results-details">
                 <div className="result-item">
                   <span>Correct Answers:</span>
                   <span>{quizResult.correctAnswers} / {quizResult.totalQuestions}</span>
                 </div>
                 <div className="result-item">
                   <span>Status:</span>
                   <span className={quizResult.score >= 70 ? 'pass-status' : 'fail-status'}>
                     {quizResult.score >= 70 ? 'PASSED' : 'FAILED'}
                   </span>
                 </div>
                 <div className="result-item">
                   <span>Completed:</span>
                   <span>{new Date(quizResult.completedAt).toLocaleString()}</span>
                 </div>
               </div>
               
               {/* Detailed Question Results */}
               <div className="detailed-results">
                 <h3>Question Details</h3>
                 <div className="question-results-list">
                   {quizResult.questionResults.map((result, index) => (
                     <div key={index} className={`question-result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                       <div className="question-result-header">
                         <span className="question-number">Q{result.questionIndex}</span>
                         <span className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                           {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                         </span>
                       </div>
                       <div className="question-result-content">
                         <div className="question-text">{result.questionText}</div>
                         <div className="answer-details">
                           <div className="answer-row">
                             <span className="answer-label">Your Answer:</span>
                             <span className={`answer-text ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                               {result.userAnswer}
                             </span>
                           </div>
                           {!result.isCorrect && (
                             <div className="answer-row">
                               <span className="answer-label">Correct Answer:</span>
                               <span className="answer-text correct">{result.correctAnswer}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
              
              <div className="results-actions">
                <button className="retry-button" onClick={resetQuiz}>
                  Take Another Quiz
                </button>
                <button className="back-button" onClick={handleBackToChatbot}>
                  Back to Chatbot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-taking-page-modern-wrapper">
             {/* Back Button */}
       <button className="quiz-taking-back-btn-fixed" onClick={handleBackToChatbot}>
         <ArrowLeft size={20} />
       </button>

      {/* Header */}
      <div className="quiz-taking-header">
        <div className="quiz-taking-header-icon">
          <ClipboardList size={28} />
        </div>
        <div>
          <h1 className="quiz-taking-header-title">Available Quizzes</h1>
          <p className="quiz-taking-header-sub">Test your knowledge with these assessments</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="quiz-taking-main">
        <div className="quiz-taking-content">
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadEvaluations} className="retry-btn">Retry</button>
            </div>
          )}

          {evaluations.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} className="empty-icon" />
              <h3>No Quizzes Available</h3>
              <p>There are currently no quizzes available for you to take.</p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {evaluations.map((evaluation) => {
                const questions = evaluation.Questions || evaluation.questions || [];
                return (
                  <div key={evaluation.Id || evaluation.id} className="quiz-card">
                    <div className="quiz-card-header">
                      <h3 className="quiz-title">{evaluation.Title || evaluation.title}</h3>
                      <div className="quiz-meta">
                        <span className="question-count">
                          {questions.length} question{questions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="quiz-card-content">
                      <div className="quiz-preview">
                        {questions.slice(0, 2).map((question, index) => (
                          <div key={index} className="question-preview">
                            <div className="question-number">Q{index + 1}</div>
                            <div className="question-text">
                              {question.Text || (question as any).text || 'No question text'}
                            </div>
                          </div>
                        ))}
                        {questions.length > 2 && (
                          <div className="more-questions">
                            +{questions.length - 2} more questions
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="quiz-card-actions">
                      <button
                        className="start-quiz-btn"
                        onClick={() => startQuiz(evaluation)}
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
