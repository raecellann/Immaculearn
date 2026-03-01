import React, { useState } from 'react';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

const StudentQuizTaker = ({ quizData, currentColors, onSubmit, onExit }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 10;

  // Parse questions from the task data
  const getQuestions = () => {
    if (!quizData || !quizData.questions) return [];
    
    return quizData.questions.map((questionObj, index) => {
      const questionKey = `q${index + 1}`;
      const question = questionObj[questionKey];
      
      return {
        id: index + 1,
        question: question.question,
        answers: question.answers || [],
        type: determineQuestionType(question.answers),
        points: Math.floor((quizData?.total_score || 100) / (quizData?.questions?.length || 1))
      };
    });
  };

  const determineQuestionType = (answers) => {
    if (!answers || answers.length === 0) return 'short-answer';
    
    // Check if it's true/false
    if (answers.length === 2 && 
        answers.some(a => a.letter_identifier === 'T') && 
        answers.some(a => a.letter_identifier === 'F')) {
      return 'true-false';
    }
    
    // Check if it's multiple choice
    if (answers.length > 2 && 
        answers.every(a => /^[A-Z]$/.test(a.letter_identifier))) {
      return 'multiple-choice';
    }
    
    // Default to short answer
    return 'short-answer';
  };

  const handleOptionClick = (questionId, letterIdentifier) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: letterIdentifier
    }));
  };

  const handleTextAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };


  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    onSubmit(userAnswers);
  };

  const questions = getQuestions();
  const answeredQuestions = Object.keys(userAnswers).length;
  const progress = (answeredQuestions / questions.length) * 100;

  // Pagination helpers
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const paginatedQuestions = questions.slice(startIndex, endIndex);
  const currentQuestionInPage = currentQuestion - startIndex;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newStartIndex = page * questionsPerPage;
    setCurrentQuestion(Math.min(newStartIndex, questions.length - 1));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const newQuestion = currentQuestion + 1;
      setCurrentQuestion(newQuestion);
      if (newQuestion >= endIndex) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const newQuestion = currentQuestion - 1;
      setCurrentQuestion(newQuestion);
      if (newQuestion < startIndex) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <div 
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  userAnswers[question.id] === answer.letter_identifier
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionClick(question.id, answer.letter_identifier)}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                      userAnswers[question.id] === answer.letter_identifier
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {answer.letter_identifier}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed">
                    {answer.answer_text}
                  </p>
                </div>
                {userAnswers[question.id] === answer.letter_identifier && (
                  <div className="text-blue-600">
                    <FiCheck size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  userAnswers[question.id] === answer.letter_identifier
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionClick(question.id, answer.letter_identifier)}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                    userAnswers[question.id] === answer.letter_identifier
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {answer.letter_identifier}
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed">
                    {answer.answer_text}
                  </p>
                </div>
                {userAnswers[question.id] === answer.letter_identifier && (
                  <div className="text-blue-600">
                    <FiCheck size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'short-answer':
      default:
        return (
          <div className="p-4 rounded-lg border-2 border-gray-200">
            <textarea
              placeholder="Type your answer here..."
              className="w-full p-4 rounded border resize-none h-32 text-base"
              style={{
                backgroundColor: '#ffffff',
                borderColor: userAnswers[question.id] ? '#2563eb' : '#d1d5db',
                borderWidth: userAnswers[question.id] ? '2px' : '1px'
              }}
              value={userAnswers[question.id] || ''}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            />
          </div>
        );
    }
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentColors.background }}>
        <div className="max-w-2xl w-full">
          <div className="bg-black/50 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">📝</div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: currentColors.text }}>
              Quiz Ready
            </h1>
            
            <div className="mb-6 p-6 rounded-lg bg-black/50">
              <h2 className="text-xl font-semibold mb-4" style={{ color: currentColors.text }}>
                Quiz Instructions
              </h2>
              {quizData?.task_instructions && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {quizData.task_instructions}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white rounded border">
                  <p className="font-semibold text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="font-semibold text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-green-600">{quizData?.total_score || 0}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Once you start the quiz, you can navigate freely between questions. 
                Make sure you have a stable internet connection and complete all questions before submitting.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Exit Quiz
              </button>
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentColors.background }}>
      {/* Quiz Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="font-semibold" style={{ color: currentColors.text }}>
                  Quiz - Question {currentQuestion + 1} of {questions.length}
                </h1>
                <p className="text-sm text-gray-600">
                  {answeredQuestions} answered • {questions.length - answeredQuestions} remaining
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto p-4">
        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg">
            {/* Pagination Controls */}
            {totalPages > 1 && questions.length > 10 && (
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous Page
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`w-10 h-10 rounded-full text-sm font-medium ${
                          index === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next Page
                  </button>
                </div>
              </div>
            )}
            
            {/* Scrollable Questions Container */}
            <div className="max-h-96 overflow-y-auto">
              {paginatedQuestions.map((question, index) => (
                <div key={question.id} className={`p-8 ${index !== paginatedQuestions.length - 1 ? 'border-b' : ''}`}>
                  {/* Question Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        Question {question.id}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {question.points} points
                      </span>
                      {userAnswers[question.id] && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Answered
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold leading-relaxed" style={{ color: currentColors.text }}>
                      {question.question}
                    </h2>
                  </div>

                  {/* Answer Options */}
                  <div>
                    {renderQuestion(question)}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="border-t p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    currentQuestion === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {questions.length > 10 && (
                  <div className="flex gap-2 flex-wrap max-w-md justify-center">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setCurrentPage(Math.floor(index / questionsPerPage));
                      }}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        index === currentQuestion
                          ? 'bg-blue-600 text-white'
                          : userAnswers[questions[index].id]
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={`Question ${index + 1}${userAnswers[questions[index].id] ? ' (Answered)' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                )}

                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              You have answered {answeredQuestions} out of {questions.length} questions. 
              {answeredQuestions < questions.length && ' Unanswered questions will be marked as incorrect.'}
              Are you sure you want to submit?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizTaker;
