import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import LogoUpload from './LogoUpload/LogoUpload';
import MemsUpload from './MemsUpload/MemsUpload';
import SkidUpload from './SkidUpload/SkidUpload';
import PhotographyUpload from './PhotographyUpload/PhotographyUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Code, 
  CheckCircle, 
  HelpCircle, 
  BarChart3,
  Play,
  AlertCircle,
  CircleCheck,
  CircleAlert
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Competition = () => {
  const { user, loading } = useContext(AuthContext);
  const [myCompetition, setMyCompetition] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTestModal, setHshowTestModal] = useState(false);
  const [currentRound, setCurrentRound] = useState('round1');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [completedRounds, setCompletedRounds] = useState([]);
  const [patternMarks, setPatternMarks] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);

  const maxUploads = {
    logo: 3,
    memes: 1,
    reel: 3,
    photography: 5,
    coding: 0,
  };

  const findPatternCompetition = async (competitionName) => {
    try {
      const resp = await axiosInstance.get('/pattern-competitions');
      const list = resp.data?.data || [];
      if (competitionName.toLowerCase().includes('coding')) {
        const active = list.find(pc => pc.is_active);
        if (active) return active._id;
        const coding = list.find(pc => pc.competition_type === 'coding');
        if (coding) return coding._id;
      }
      return list[0]?._id || null;
    } catch (err) {
      console.error('Failed to fetch pattern competitions', err);
      showToast('error', 'Could not load pattern competition');
      return null;
    }
  };

  useEffect(() => {
    const fetchMyCompetition = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }
      try {
        const partResp = await axiosInstance.get('/participants');
        const participants = partResp.data.data || [];
        const myParticipant = participants.find(p => p?.user?._id === user._id);
        if (!myParticipant) {
          showToast('info', 'No competition found for this user.');
          setMyCompetition(null);
          return;
        }
        const compResp = await axiosInstance.get(`/competitions/${myParticipant.competition._id}`);
        const competitionData = compResp.data.data || compResp.data;
        let patternCompetitionId = null;
        if (competitionData.name.toLowerCase().includes('coding')) {
          patternCompetitionId = await findPatternCompetition(competitionData.name);
        }
        const marksResp = await axiosInstance.get('/pattern-marks');
        const userMarks = marksResp.data.data.find(m => m?.participant?._id === myParticipant._id);
        setMyCompetition({
          ...competitionData,
          participantId: myParticipant._id,
          upload_path: Array.isArray(myParticipant.upload_path) ? myParticipant.upload_path : [],
          total_marks: myParticipant.total_marks,
          patternCompetitionId,
        });
        setPatternMarks(userMarks || null);
        setCompletedRounds(userMarks?.completed_rounds || []);
      } catch (error) {
        console.error('Error fetching competition data', error);
        showToast('error', 'Failed to load your competition');
        setMyCompetition(null);
      } finally {
        setFetchLoading(false);
      }
    };
    if (!loading) fetchMyCompetition();
  }, [user, loading]);

  const fetchQuestions = async (round) => {
    if (!myCompetition?.patternCompetitionId) {
      showToast('error', 'No pattern competition associated with this competition');
      setQuestions([]);
      setQuestionLoading(false);
      return;
    }
    setQuestionLoading(true);
    try {
      const response = await axiosInstance.get(`/pattern-competitions/${myCompetition.patternCompetitionId}`);
      const competition = response.data.data;
      const roundMap = {
        round1: 'round1_mcqs',
        round2: 'round2_debugging',
        round3: 'round3_image_notes',
      };
      const questionsData = competition[roundMap[round]] || [];
      setQuestions(questionsData);
    } catch (error) {
      console.error(`Error fetching questions for ${round}:`, error);
      showToast('error', 'Failed to load questions');
      setQuestions([]);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleStartTest = async (round) => {
    if (round === 'round2' && !completedRounds.includes('round1')) {
      showToast('error', 'Complete Round 1 before starting Round 2');
      return;
    }
    if (round === 'round3' && !completedRounds.includes('round2')) {
      showToast('error', 'Complete Round 2 before starting Round 3');
      return;
    }
    setCurrentRound(round);
    setAnswers({});
    await fetchQuestions(round);
    setHshowTestModal(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitRound = async () => {
    if (!myCompetition?.participantId || !myCompetition?.patternCompetitionId) {
      showToast('error', 'Invalid competition or participant data');
      return;
    }
    if (Object.keys(answers).length < questions.length) {
      showToast('error', 'Please answer all questions');
      return;
    }
    const submission = {
      participantId: myCompetition.participantId,
      competitionId: myCompetition.patternCompetitionId,
      round: currentRound,
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        [currentRound === 'round3' ? 'Answer_note' : 'selectedOption']: value,
      })),
    };
    try {
      const response = await axiosInstance.post('/pattern-marks/submit-round', submission);
      setPatternMarks(response.data.data);
      setCompletedRounds(response.data.data.completed_rounds);
      setMyCompetition(prev => ({
        ...prev,
        total_marks: response.data.data.total_score,
      }));
      showToast('success', currentRound === 'round3' 
        ? 'Round 3 submitted successfully. Pending evaluation.'
        : `Round ${currentRound} submitted successfully. Score: ${response.data.data[`${currentRound}_score`]}`);
      setHshowTestModal(false);
      setAnswers({});
    } catch (error) {
      console.error('Error submitting round:', error);
      showToast('error', error.response?.data?.message || 'Failed to submit round');
    }
  };

  const handleViewImages = (images) => {
    setPreviewImages(images || []);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setHshowTestModal(false);
    setPreviewImages([]);
    setCurrentImageIndex(0);
    setQuestions([]);
    setAnswers({});
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  const handleUploadSuccess = (updatedParticipant) => {
    setMyCompetition({
      ...myCompetition,
      upload_path: Array.isArray(updatedParticipant.upload_path) ? updatedParticipant.upload_path : [],
    });
    showToast('success', 'File(s) uploaded successfully');
  };

  const getUploadSlotsInfo = () => {
    if (!myCompetition) return { usedSlots: 0, remainingSlots: 0 };
    const competitionName = myCompetition.name.toLowerCase();
    const max = competitionName.includes('reel') 
      ? 1 
      : maxUploads[Object.keys(maxUploads).find(key => competitionName.includes(key))] || 3;
    const usedSlots = Array.isArray(myCompetition.upload_path) ? myCompetition.upload_path.length : 0;
    const remainingSlots = max - usedSlots;
    return { usedSlots, remainingSlots };
  };

  if (loading || fetchLoading) {
    return <div className="text-center p-6 text-muted-foreground">Loading your competition...</div>;
  }

  if (!user) {
    return <div className="text-center p-6 text-muted-foreground">Please log in to view your competition.</div>;
  }

  if (!myCompetition) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Competition</h1>
        <p className="text-muted-foreground">
          No competition chosen yet to participate.
        </p>
      </div>
    );
  }

  if (loading || fetchLoading) {
    return <div className="text-center p-6 text-muted-foreground">Loading your competition...</div>;
  }

  if (!user) {
    return <div className="text-center p-6 text-muted-foreground">Please log in to view your competition.</div>;
  }

  if (!myCompetition) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Competition</h1>
        <p className="text-muted-foreground">
          No competition chosen yet to participate.
        </p>
      </div>
    );
  }

  const renderCompetitionComponent = () => {
    const competitionName = myCompetition.name.toLowerCase();
    if (competitionName.includes('logo')) {
      return (
        <LogoUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('memes')) {
      return (
        <MemsUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('reel')) {
      return (
        <SkidUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('photography')) {
      return (
        <PhotographyUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('coding')) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-6 w-6" />
                Coding Competition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete rounds sequentially to unlock the next challenge
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Progress</h4>
                <Badge variant="secondary" className="text-sm">
                  {completedRounds.length}/3 rounds completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={(completedRounds.length / 3) * 100} 
                className="w-full"
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                round: 'round1',
                title: 'Round 1',
                subtitle: 'MCQ Challenge',
                icon: Play,
                disabled: completedRounds.includes('round1'),
                completed: completedRounds.includes('round1')
              },
              {
                round: 'round2',
                title: 'Round 2',
                subtitle: 'Debugging',
                icon: AlertCircle,
                disabled: completedRounds.includes('round2') || !completedRounds.includes('round1'),
                completed: completedRounds.includes('round2')
              },
              {
                round: 'round3',
                title: 'Round 3',
                subtitle: 'Image Analysis',
                icon: BarChart3,
                disabled: completedRounds.includes('round3') || !completedRounds.includes('round2'),
                completed: completedRounds.includes('round3')
              }
            ].map(({ round, title, subtitle, icon: Icon, disabled, completed }) => (
              <Card key={round} className="relative">
                <CardContent className="p-6 pt-8">
                  <Button
                    onClick={() => handleStartTest(round)}
                    disabled={disabled}
                    variant={completed ? "default" : disabled ? "outline" : "default"}
                    className={`
                      w-full h-16 flex flex-col items-center justify-center gap-2
                      ${completed ? 'bg-primary' : disabled ? 'opacity-50' : ''}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-semibold">{title}</div>
                      <div className="text-xs text-muted-foreground">{subtitle}</div>
                    </div>
                  </Button>
                </CardContent>
                {completed && (
                  <div className="absolute -top-2 -right-2">
                    <CircleCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {!completed && !disabled && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    Ready
                  </Badge>
                )}
              </Card>
            ))}
          </div>
          {patternMarks && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Your Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Round 1 (MCQ)', score: patternMarks.round1_score || 0 },
                    { label: 'Round 2 (Debug)', score: patternMarks.round2_score || 0 },
                    { label: 'Round 3 (Analysis)', score: patternMarks.round3_score || 0 }
                  ].map(({ label, score }) => (
                    <Card key={label}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{score}</div>
                        <div className="text-sm text-muted-foreground mt-1">{label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Score:</span>
                    <Badge variant="default" className="text-lg">
                      {patternMarks.total_score || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {!completedRounds.includes('round1') && (
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium mb-1">Getting Started</p>
                  <p className="text-sm text-muted-foreground">
                    Start with Round 1 to unlock subsequent challenges. Each round builds on the previous one.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
    return null;
  };

  const { usedSlots, remainingSlots } = getUploadSlotsInfo();

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-6">Your Chosen Competition</h1>
      <div className="border rounded-lg p-6 shadow-sm bg-card">
        <img
          src={myCompetition.competition_image}
          alt={myCompetition.name}
          className="w-full h-48 object-cover rounded mb-4"
          onError={(e) => {
            e.target.style.display = 'none';
            showToast('error', 'Failed to load competition image');
          }}
        />
        <h2 className="text-xl font-semibold mb-2">{myCompetition.name}</h2>
        <p className="text-muted-foreground mb-2">User Type: {myCompetition.role?.name || 'N/A'}</p>
        <p className="text-muted-foreground mb-2">Total Marks: {myCompetition.total_marks || 0}</p>
        <p className="text-muted-foreground mb-2">Team Based: {myCompetition.is_team_based ? 'Yes' : 'No'}</p>
        <p className="text-muted-foreground mb-2">
          Upload Slots: {usedSlots} used, {remainingSlots} remaining
        </p>
        {myCompetition.upload_path.length > 0 && (
          <div className="text-muted-foreground mb-4">
            <p>Uploaded File(s):</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewImages(myCompetition.upload_path)}
              className="mt-2"
            >
              View All Files
            </Button>
          </div>
        )}
        {renderCompetitionComponent()}
      </div>

      <Dialog open={showImageModal} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent className="p-0 max-w-3xl">
          <DialogHeader className="flex justify-between items-center p-4">
            <DialogTitle>
              {myCompetition?.name} Files
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center p-4">
            {previewImages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4"
                  onClick={handlePrevImage}
                  disabled={previewImages.length <= 1}
                >
                  <ChevronLeft size={24} />
                </Button>
                {myCompetition?.name.toLowerCase().includes('reel') ? (
                  <video
                    src={previewImages[currentImageIndex]}
                    className="max-w-full max-h-[60vh] rounded-lg"
                    controls
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('error', 'Failed to load video');
                    }}
                  />
                ) : (
                  <img
                    src={previewImages[currentImageIndex]}
                    alt={`File ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] rounded-lg object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('error', 'Failed to load image');
                    }}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4"
                  onClick={handleNextImage}
                  disabled={previewImages.length <= 1}
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}
            {previewImages.length === 0 && (
              <p className="text-muted-foreground">No files available</p>
            )}
          </div>
          {previewImages.length > 1 && (
            <div className="text-center pb-4">
              <p className="text-muted-foreground">
                File {currentImageIndex + 1} of {previewImages.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTestModal} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Coding Competition - {currentRound.charAt(0).toUpperCase() + currentRound.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto p-4 space-y-6">
            {questionLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No questions available for this round.</p>
            ) : (
              questions.map((question, index) => (
                <Card key={question._id}>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-semibold">
                      Question {index + 1}: {question.question || 'Image-based question'}
                    </h4>
                    {question.code_snippet && (
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto font-mono">
                        {question.code_snippet}
                      </pre>
                    )}
                    {question.image_url && (
                      <img
                        src={question.image_url}
                        alt={`Question ${index + 1}`}
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          showToast('error', 'Failed to load question image');
                        }}
                      />
                    )}
                    {currentRound !== 'round3' ? (
                      <RadioGroup
                        value={answers[question._id] || ''}
                        onValueChange={(value) => handleAnswerChange(question._id, value)}
                        className="space-y-2"
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent">
                            <RadioGroupItem value={option} id={`${question._id}-${optIndex}`} />
                            <Label htmlFor={`${question._id}-${optIndex}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        placeholder="Enter your detailed answer note here..."
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <Badge>Marks: {question.marks}</Badge>
                      <Badge variant={answers[question._id] ? "default" : "secondary"}>
                        {answers[question._id] ? 'Answered' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {!questionLoading && questions.length > 0 && (
              <Button
                onClick={handleSubmitRound}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full"
              >
                Submit {currentRound.charAt(0).toUpperCase() + currentRound.slice(1)}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competition;