import React, { useState, useEffect } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  Award,
  User,
  Phone,
  Mail,
  Loader2,
  X
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
    <p className="text-sm text-muted-foreground">Loading participants...</p>
  </div>
);

// Enhanced Participant Card
const ParticipantCard = ({ participant, onEvaluate }) => {
  const totalScore = participant.patternMarks?.total_score || 0;
  const round3Score = participant.patternMarks?.round3_score || 0;
  const maxRound3 = participant.round3Data?.reduce((sum, q) => sum + q.max_marks, 0) || 0;
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {participant.user?.name || 'Unknown User'}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {participant.user?.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={round3Score > 0 ? "default" : "secondary"}>
            {round3Score > 0 ? "Evaluated" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Round 3 Questions</p>
            <p className="font-medium">{participant.round3Data?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Round 3 Score</p>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{round3Score}/{maxRound3}</span>
              <Progress value={maxRound3 > 0 ? (round3Score / maxRound3) * 100 : 0} className="w-16 h-1" />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Total Score</p>
            <p className="font-medium">{totalScore}</p>
          </div>
        </div>
        
        <Separator />
        
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
          onClick={() => onEvaluate(participant)}
          disabled={participant.round3Data?.length === 0}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {round3Score > 0 ? 'Re-evaluate' : 'Evaluate'} Round 3
        </Button>
      </CardContent>
    </Card>
  );
};

// Compact Evaluation Modal
const EvaluationModal = ({ 
  isOpen, 
  onClose, 
  previewData, 
  currentImageIndex, 
  onNext, 
  onPrev, 
  marksInput, 
  onMarksChange,
  onSubmit,
  selectedParticipant,
  totalScore,
  totalMaxMarks,
  isSubmitting
}) => {
  if (!isOpen || previewData.length === 0) return null;

  const currentQuestion = previewData[currentImageIndex];
  const isFirst = currentImageIndex === 0;
  const isLast = currentImageIndex === previewData.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 sm:max-w-md">
        <div className="flex flex-col h-full">
          {/* Compact Header */}
          <DialogHeader className="p-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-semibold">
                    {selectedParticipant?.user?.name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Q{currentImageIndex + 1}/{previewData.length}
                  </p>
                </div>
              </div>
              <DialogClose asChild>
                
              </DialogClose>
            </div>
          </DialogHeader>

          {/* Compact Main Content */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {/* Compact Image */}
            <div className="bg-card rounded-md overflow-hidden border">
              {currentQuestion.image_url ? (
                <img
                  src={currentQuestion.image_url}
                  alt={`Question ${currentImageIndex + 1}`}
                  className="w-full h-40 object-contain bg-muted p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.currentTarget.innerHTML = `
                      <div class="flex items-center justify-center h-40 text-muted-foreground text-xs">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        <span>No image</span>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground bg-muted text-xs">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  <span>No image</span>
                </div>
              )}
            </div>

            {/* Compact Question Section */}
            <Card className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">Q{currentImageIndex + 1}</h4>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {currentQuestion.max_marks}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">Solution:</div>
              
              <div className="p-2 bg-muted/30 rounded-sm border max-h-20 overflow-auto text-xs leading-tight">
                <pre className="whitespace-pre-wrap text-foreground/80">
                  {currentQuestion.Answer_note || 'No answer provided'}
                </pre>
              </div>

              {/* Compact Evaluation Input */}
              <div className="space-y-1 mt-2">
                <Label className="text-xs font-medium">Score (0-{currentQuestion.max_marks})</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={marksInput[currentQuestion.questionId] || ''}
                    onChange={(e) => onMarksChange(currentQuestion.questionId, e.target.value)}
                    className="text-sm h-8"
                    min="0"
                    max={currentQuestion.max_marks}
                    step="0.5"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">/{currentQuestion.max_marks}</span>
                </div>
              </div>
            </Card>

            {/* Compact Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={isFirst}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Prev
              </Button>
              
              <span className="text-xs text-muted-foreground">
                {currentImageIndex + 1}/{previewData.length}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={isLast}
                className="h-7 px-2 text-xs"
              >
                Next
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Compact Footer */}
          <DialogFooter className="p-3 border-t bg-muted/30">
            <div className="flex w-full justify-between gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="h-8 text-xs px-3 flex-1">
                  Cancel
                </Button>
              </DialogClose>
              
              <Button
                onClick={onSubmit}
                disabled={marksInput[currentQuestion.questionId] === '' || isSubmitting}
                className="h-8 text-xs px-3 flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                {isLast ? 'Finish' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Pattercodingimage = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [marksInput, setMarksInput] = useState({});
  const [patternCompetition, setPatternCompetition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCodingParticipants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const marksResponse = await axiosInstance.get('/pattern-marks', { withCredentials: true });
        const allMarks = marksResponse.data.data || [];
        const participantsWithRound3 = allMarks.filter(
          (marks) => marks.round3_answer_notes && marks.round3_answer_notes.length > 0
        );

        if (participantsWithRound3.length === 0) {
          setParticipants([]);
          setLoading(false);
          return;
        }

        const patternCompResponse = await axiosInstance.get('/pattern-competitions', {
          withCredentials: true,
        });
        const patternComps = patternCompResponse.data.data || [];
        if (patternComps.length === 0) {
          throw new Error('No PatternCompetition found');
        }
        const activePatternComp = patternComps[0];
        setPatternCompetition(activePatternComp);

        const enhancedParticipants = await Promise.all(
          participantsWithRound3.map(async (marks) => {
            const participantResponse = await axiosInstance.get(`/participants/${marks.participant._id}`, {
              withCredentials: true,
            });
            const participant = participantResponse.data.data;

            const round3Data = marks.round3_answer_notes.map((answerNote) => {
              const question = activePatternComp?.round3_image_notes.find(
                (q) => q._id.toString() === answerNote.questionId.toString()
              );
              return {
                questionId: answerNote.questionId,
                image_url: question?.image_url || '',
                Answer_note: answerNote.Answer_note || '',
                evaluated_score: answerNote.evaluated_score || 0,
                max_marks: question?.marks || 10,
              };
            });

            return { ...participant, patternMarks: marks, round3Data };
          })
        );

        setParticipants(enhancedParticipants);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to fetch participants';
        setError(errMsg);
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCodingParticipants();
  }, []);

  const handleViewImages = (participant) => {
    setPreviewData(participant.round3Data || []);
    setCurrentImageIndex(0);
    setSelectedParticipant(participant);
    setMarksInput(
      participant.round3Data.reduce((acc, item) => ({
        ...acc,
        [item.questionId]: item.evaluated_score.toString(),
      }), {})
    );
    setShowPreviewModal(true);
  };

  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setCurrentImageIndex(0);
    setMarksInput({});
    setSelectedParticipant(null);
  };

  const handleNextImage = () => {
    if (currentImageIndex < previewData.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleMarksChange = (questionId, value) => {
    const question = previewData.find(q => q.questionId.toString() === questionId.toString());
    const numValue = parseFloat(value);
    
    if (question && !isNaN(numValue) && numValue > question.max_marks) {
      value = question.max_marks.toString();
    }
    
    setMarksInput((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitMarks = async () => {
    if (!selectedParticipant || !patternCompetition) {
      showToast('error', 'No participant or competition selected');
      return;
    }

    setIsSubmitting(true);
    
    const marks = [];
    let hasError = false;

    for (const [questionId, scoreStr] of Object.entries(marksInput)) {
      const parsedScore = parseFloat(scoreStr);
      const question = previewData.find((q) => q.questionId.toString() === questionId);
      
      if (isNaN(parsedScore) || parsedScore < 0) {
        showToast('error', `Please enter a valid score (0 or higher) for question ${questionId}`);
        hasError = true;
        break;
      }
      
      if (question && parsedScore > question.max_marks) {
        showToast('error', `Score must be between 0 and ${question.max_marks}`);
        hasError = true;
        break;
      }
      
      marks.push({ questionId, score: parsedScore });
    }

    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        '/pattern-marks/update-round3',
        {
          participantId: selectedParticipant._id,
          marks,
          competitionId: patternCompetition._id,
        },
        { withCredentials: true }
      );

      setParticipants((prev) =>
        prev.map((p) =>
          p._id === selectedParticipant._id
            ? { ...p, patternMarks: response.data.data }
            : p
        )
      );

      setMarksInput(
        response.data.data.round3_answer_notes.reduce((acc, answerNote) => ({
          ...acc,
          [answerNote.questionId]: answerNote.evaluated_score.toString(),
        }), {})
      );

      showToast('success', 'Marks updated successfully');
      
      if (currentImageIndex === previewData.length - 1) {
        handleCloseModal();
      } else {
        handleNextImage();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update marks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalScore = Object.values(marksInput).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  
  const totalMaxMarks = previewData.reduce((sum, q) => sum + q.max_marks, 0);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="text-center py-12">
          <X className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Pattern Coding Competition
          </h1>
          <p className="text-muted-foreground mt-1">Round 3 Image Pattern Evaluation</p>
        </div>
        {patternCompetition && (
          <Badge variant="secondary" className="text-sm">
            {patternCompetition.name}
          </Badge>
        )}
      </div>

      {participants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">
              No participants have submitted Round 3 answers yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant._id}
              participant={participant}
              onEvaluate={handleViewImages}
            />
          ))}
        </div>
      )}

      <EvaluationModal
        isOpen={showPreviewModal}
        onClose={handleCloseModal}
        previewData={previewData}
        currentImageIndex={currentImageIndex}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        marksInput={marksInput}
        onMarksChange={handleMarksChange}
        onSubmit={handleSubmitMarks}
        selectedParticipant={selectedParticipant}
        totalScore={totalScore}
        totalMaxMarks={totalMaxMarks}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Pattercodingimage;