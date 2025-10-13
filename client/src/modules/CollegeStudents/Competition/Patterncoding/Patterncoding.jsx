import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Patterncoding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { participantId, competitionId } = location.state || {};

  const [currentRound, setCurrentRound] = useState('round1');
  const [questions, setQuestions] = useState([]);
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    if (!user || !participantId || !competitionId) {
      showToast('error', 'Please log in and select a competition');
      navigate('/competition');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch competition questions
        const compResponse = await axiosInstance.get(`/pattern-competitions/${competitionId}`);
        const competition = compResponse.data.data;
        const allQuestions = [
          ...(competition.round1_mcqs || []).map((q) => ({
            ...q,
            round: 'round1',
            roundName: 'Round 1: MCQ',
          })),
          ...(competition.round2_debugging || []).map((q) => ({
            ...q,
            round: 'round2',
            roundName: 'Round 2: Debugging',
          })),
          ...(competition.round3_image_notes || []).map((q) => ({
            ...q,
            round: 'round3',
            roundName: 'Round 3: Image + Note',
          })),
        ];
        setQuestions(allQuestions);

        // Fetch participant marks
        const marksResponse = await axiosInstance.get('/pattern-marks');
        const participantMarks = marksResponse.data.data.find((m) => m.participant.toString() === participantId);
        setMarks(participantMarks || { completed_rounds: [] });
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('error', 'Failed to load test data');
        navigate('/competition');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, participantId, competitionId, navigate]);

  // Determine current round based on completed rounds
  useEffect(() => {
    if (marks) {
      if (!marks.completed_rounds.includes('round1')) {
        setCurrentRound('round1');
      } else if (!marks.completed_rounds.includes('round2')) {
        setCurrentRound('round2');
      } else if (!marks.completed_rounds.includes('round3')) {
        setCurrentRound('round3');
      } else {
        showToast('info', 'All rounds completed');
        navigate('/competition');
      }
    }
  }, [marks, navigate]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitRound = async () => {
    if (isSubmitting) return;

    const roundQuestions = questions.filter((q) => q.round === currentRound);
    if (roundQuestions.length === 0) {
      showToast('error', 'No questions available for this round');
      return;
    }

    if (currentRound !== 'round3') {
      // Validate answers for Round 1 and 2
      const unanswered = roundQuestions.filter((q) => !answers[q._id]);
      if (unanswered.length > 0) {
        showToast('error', 'Please answer all questions');
        return;
      }
    } else {
      // Validate Answer_note for Round 3
      const unanswered = roundQuestions.filter((q) => !answers[q._id]?.Answer_note);
      if (unanswered.length > 0) {
        showToast('error', 'Please provide an answer note for all questions');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submission = {
        participantId,
        competitionId,
        round: currentRound,
        answers: roundQuestions.map((q) => ({
          questionId: q._id,
          selectedOption: currentRound !== 'round3' ? answers[q._id] : undefined,
          Answer_note: currentRound === 'round3' ? answers[q._id]?.Answer_note : undefined,
        })),
      };

      const response = await axiosInstance.post('/pattern-marks/submit-round', submission, {
        withCredentials: true,
      });

      setMarks(response.data.data);
      showToast('success', `Round ${currentRound.replace('round', '')} submitted successfully`);

      // Move to next round or redirect
      if (currentRound === 'round1') {
        setCurrentRound('round2');
        setAnswers({});
      } else if (currentRound === 'round2') {
        setCurrentRound('round3');
        setAnswers({});
      } else {
        navigate('/competition');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to submit round';
      showToast('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-gray-600">Loading test...</div>;
  }

  const roundQuestions = questions.filter((q) => q.round === currentRound);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Coding Test - {marks?.completed_rounds.includes(currentRound) ? 'Completed' : currentRound.replace('round', 'Round ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roundQuestions.length === 0 ? (
            <p>No questions available for this round.</p>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">Questions</h3>
              <ul className="space-y-2">
                {roundQuestions.map((question) => (
                  <li
                    key={question._id}
                    className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {currentRound !== 'round3' ? (
                      <span>{question.question}</span>
                    ) : (
                      <span>Question {question._id} (Image-based)</span>
                    )}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4"
                onClick={handleSubmitRound}
                disabled={isSubmitting || marks?.completed_rounds.includes(currentRound)}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Round'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedQuestion?.roundName} - Question</DialogTitle>
            <DialogDescription>Answer the question below.</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              {selectedQuestion.round !== 'round3' ? (
                <>
                  <p>{selectedQuestion.question}</p>
                  {selectedQuestion.code_snippet && (
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      <code>{selectedQuestion.code_snippet}</code>
                    </pre>
                  )}
                  <RadioGroup
                    value={answers[selectedQuestion._id] || ''}
                    onValueChange={(value) => handleAnswerChange(selectedQuestion._id, value)}
                  >
                    {selectedQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              ) : (
                <>
                  <img
                    src={selectedQuestion.image_url}
                    alt="Question Image"
                    className="max-w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('error', 'Failed to load image');
                    }}
                  />
                  <Textarea
                    value={answers[selectedQuestion._id]?.Answer_note || ''}
                    onChange={(e) =>
                      handleAnswerChange(selectedQuestion._id, { Answer_note: e.target.value })
                    }
                    placeholder="Enter your answer note"
                    rows={5}
                  />
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patterncoding;