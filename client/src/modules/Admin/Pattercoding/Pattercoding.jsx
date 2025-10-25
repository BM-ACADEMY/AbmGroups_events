import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, X, Trash2, Pencil } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          An error occurred while rendering the component. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const CreateQuestionModal = ({ onQuestionCreated, questionToEdit, onQuestionUpdated, competitionId }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    round: '',
    question: '',
    code_snippet: '',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (questionToEdit) {
      setFormData({
        round: questionToEdit.round === 'Round 1: MCQ' ? 'round1_mcqs' :
               questionToEdit.round === 'Round 2: Debugging' ? 'round2_debugging' :
               'round3_image_notes',
        question: questionToEdit.question || '',
        code_snippet: questionToEdit.code_snippet || '',
        options: questionToEdit.options || ['', '', '', ''],
        correct_answer: questionToEdit.correct_answer || '',
        marks: questionToEdit.marks || 1,
        image_url: questionToEdit.image_url || '',
      });
      setOpen(true);
    }
  }, [questionToEdit]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get('/pattern-competitions', {
          withCredentials: true,
        });
        const allQuestions = response.data.data.flatMap((comp) => [
          ...(comp.round1_mcqs || []).map((q) => ({ ...q, round: 'Round 1: MCQ', competitionId: comp._id })),
          ...(comp.round2_debugging || []).map((q) => ({ ...q, round: 'Round 2: Debugging', competitionId: comp._id })),
          ...(comp.round3_image_notes || []).map((q) => ({ ...q, round: 'Round 3: Image + Note', competitionId: comp._id })),
        ]);
        setQuestions(allQuestions);
      } catch (error) {
        showToast('error', 'Failed to fetch questions for limit check');
      }
    };
    if (open) {
      fetchQuestions();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
      correct_answer: newOptions.includes(formData.correct_answer) ? formData.correct_answer : '',
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('error', 'File size exceeds 20MB limit');
        return;
      }
      setImageFile(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) {
    showToast('error', 'You must be logged in to create or edit a question');
    navigate('/login');
    return;
  }

  if (!formData.round) {
    showToast('error', 'Please select a round');
    return;
  }

  // REMOVED: existingQuestions.length >= 5 check

  if (!formData.question && formData.round !== 'round3_image_notes') {
    showToast('error', 'Question is required');
    return;
  }
  if (formData.round !== 'round3_image_notes') {
    if (formData.options.some((opt) => !opt)) {
      showToast('error', 'All options must be filled');
      return;
    }
    if (!formData.correct_answer) {
      showToast('error', 'Please select a correct answer');
      return;
    }
  } else {
    if (!imageFile && !formData.image_url) {
      showToast('error', 'Image is required for Round 3');
      return;
    }
  }
  if (!formData.marks || formData.marks < 1) {
    showToast('error', 'Marks must be at least 1');
    return;
  }

  setIsSubmitting(true);
  try {
    const formDataToSend = new FormData();
    const questionData = {
      question: formData.round !== 'round3_image_notes' ? formData.question : undefined,
      code_snippet: formData.round !== 'round3_image_notes' ? formData.code_snippet : undefined,
      options: formData.round !== 'round3_image_notes' ? formData.options : undefined,
      correct_answer: formData.round !== 'round3_image_notes' ? formData.correct_answer : undefined,
      marks: parseInt(formData.marks),
    };

    if (formData.round === 'round3_image_notes' && imageFile) {
      formDataToSend.append('image', imageFile);
    }
    formDataToSend.append('questionData', JSON.stringify(questionData));
    formDataToSend.append('marks', formData.marks);
    formDataToSend.append('round', {
      round1_mcqs: 'round1',
      round2_debugging: 'round2',
      round3_image_notes: 'round3',
    }[formData.round]);

    if (questionToEdit) {
      await axiosInstance.put(
        `/pattern-competitions/${questionToEdit.competitionId}/${{
          round1_mcqs: 'round1',
          round2_debugging: 'round2',
          round3_image_notes: 'round3',
        }[formData.round]}/${questionToEdit._id}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      showToast('success', 'Question updated successfully');
      onQuestionUpdated();
    } else {
      await axiosInstance.put(
        `/pattern-competitions/${competitionId}/add-question`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      showToast('success', 'Question created successfully');
      onQuestionCreated();
    }

    setOpen(false);
   setFormData({
        round: '',
        question: '',
        code_snippet: '',
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 1,
        image_url: '',
      });
      setImageFile(null);
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to process question';
    showToast('error', errMsg);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {questionToEdit ? 'Edit Question' : 'New Question'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{questionToEdit ? 'Edit Question' : 'Create New Question'}</DialogTitle>
          <DialogDescription>
            {questionToEdit
              ? 'Edit the details of the existing question.'
              : 'Fill out the form to create a new question for a specific round.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="round">Select Round</Label>
            <Select
              name="round"
              value={formData.round}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, round: value }))}
              disabled={!!questionToEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round1_mcqs">Round 1: MCQ</SelectItem>
                <SelectItem value="round2_debugging">Round 2: Debugging</SelectItem>
                <SelectItem value="round3_image_notes">Round 3: Image + Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.round && (
            <>
              {formData.round !== 'round3_image_notes' && (
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter the question"
                    required
                  />
                </div>
              )}

              {formData.round !== 'round3_image_notes' && (
                <>
                  <div>
                    <Label htmlFor="code_snippet">Code Snippet (Optional)</Label>
                    <Textarea
                      id="code_snippet"
                      name="code_snippet"
                      value={formData.code_snippet}
                      onChange={handleInputChange}
                      placeholder="Enter code snippet"
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mt-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addOption}
                    >
                      Add Option
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="correct_answer">Correct Answer</Label>
                    <ErrorBoundary>
                      <Select
                        name="correct_answer"
                        value={formData.correct_answer}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, correct_answer: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.options
                            .filter((option) => option.trim() !== '')
                            .map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option || `Option ${index + 1}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </ErrorBoundary>
                  </div>
                </>
              )}

              {formData.round === 'round3_image_notes' && (
                <>
                  <div>
                    <Label htmlFor="image_url">Upload Image</Label>
                    {formData.image_url && (
                      <div className="mt-1">
                        <img src={formData.image_url} alt="Current Image" className="max-w-xs" />
                      </div>
                    )}
                    <Input
                      id="image_url"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!formData.image_url}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  name="marks"
                  type="number"
                  min="1"
                  value={formData.marks}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : questionToEdit ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Pattercoding = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [roundFilter, setRoundFilter] = useState('All');
  const { user } = useContext(AuthContext);

  const fetchCompetition = async () => {
    try {
      const response = await axiosInstance.get('/pattern-competitions', {
        withCredentials: true,
      });
      const competitions = response.data.data;
      const userCompetition = competitions
        .filter((comp) => comp.created_by._id === user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (userCompetition) {
        setCompetitionId(userCompetition._id);
      } else {
        const newCompetition = await axiosInstance.post(
          '/pattern-competitions',
          { created_by: user._id },
          { withCredentials: true }
        );
        setCompetitionId(newCompetition.data.data._id);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch or create competition');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pattern-competitions', {
        withCredentials: true,
      });
      const allQuestions = response.data.data.flatMap((comp) => [
        ...(comp.round1_mcqs || []).map((q) => ({
          ...q,
          round: 'Round 1: MCQ',
          competitionId: comp._id,
        })),
        ...(comp.round2_debugging || []).map((q) => ({
          ...q,
          round: 'Round 2: Debugging',
          competitionId: comp._id,
        })),
        ...(comp.round3_image_notes || []).map((q) => ({
          ...q,
          round: 'Round 3: Image + Note',
          competitionId: comp._id,
          question: undefined,
          code_snippet: undefined,
          options: undefined,
          correct_answer: undefined,
        })),
      ]);
      setQuestions(allQuestions);
    } catch (error) {
      showToast('error', 'Failed to fetch questions');
      console.error('Fetch questions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (competitionId, round, questionId, marks) => {
    try {
      const roundMap = {
        'Round 1: MCQ': 'round1',
        'Round 2: Debugging': 'round2',
        'Round 3: Image + Note': 'round3',
      };
      const roundKey = roundMap[round];
      if (!roundKey) {
        showToast('error', 'Invalid round specified');
        return;
      }

      const parsedMarks = parseInt(marks);
      if (isNaN(parsedMarks) || parsedMarks < 0) {
        showToast('error', 'Invalid marks value for deletion');
        return;
      }

      await axiosInstance.delete(`/pattern-competitions/${competitionId}/${roundKey}/${questionId}?marks=${parsedMarks}`, {
        withCredentials: true,
      });

      showToast('success', 'Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete question';
      showToast('error', errMsg);
      console.error('Delete error:', error.response?.data || error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompetition();
      fetchQuestions();
    }
  }, [user]);

  // Filter questions based on selected round
  const filteredQuestions = roundFilter === 'All'
    ? questions
    : questions.filter((q) => q.round === roundFilter);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Pattern Coding Questions</CardTitle>
            {competitionId && (
              <CreateQuestionModal
                onQuestionCreated={fetchQuestions}
                questionToEdit={editingQuestion}
                onQuestionUpdated={() => {
                  setEditingQuestion(null);
                  fetchQuestions();
                }}
                competitionId={competitionId}
              />
            )}
          </div>
          <div className="mt-4">
            <Label htmlFor="roundFilter">Filter by Round</Label>
            <Select
              value={roundFilter}
              onValueChange={setRoundFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Rounds</SelectItem>
                <SelectItem value="Round 1: MCQ">Round 1: MCQ</SelectItem>
                <SelectItem value="Round 2: Debugging">Round 2: Debugging</SelectItem>
                <SelectItem value="Round 3: Image + Note">Round 3: Image + Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading questions...</p>
          ) : filteredQuestions.length === 0 ? (
            <p>No questions found. Create a new question or change the filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Code Snippet</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question, index) => (
                  <TableRow key={question._id || index}>
                    <TableCell>{question.round}</TableCell>
                    <TableCell>{question.question || '-'}</TableCell>
                    <TableCell>
                      {question.code_snippet ? (
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                          <code>{question.code_snippet}</code>
                        </pre>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {question.options ? (
                        <ul className="list-disc pl-4">
                          {question.options.map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{question.correct_answer || '-'}</TableCell>
                    <TableCell>
                      {question.image_url ? (
                        <img src={question.image_url} alt="Question Image" className="max-w-[100px]" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.competitionId, question.round, question._id, question.marks)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pattercoding;