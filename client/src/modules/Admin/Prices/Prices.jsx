import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Trash2, Eye } from 'lucide-react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';

const Prices = () => {
  const [competitions, setCompetitions] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ competition: '', rank: '', amount: '' });
  const [creating, setCreating] = useState(false);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [editingPrize, setEditingPrize] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch competitions and prizes on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compsRes, prizesRes] = await Promise.all([
        axiosInstance.get('/competitions'),
        axiosInstance.get('/prizes')
      ]);
      setCompetitions(compsRes.data || []);
      setPrizes(prizesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.competition || !formData.rank.trim() || !formData.amount) {
      showToast('error', 'All fields are required');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        competition: formData.competition,
        rank: formData.rank.trim(),
        amount: parseFloat(formData.amount).toFixed(2), // Ensure decimal string
      };

      const createResponse = await axiosInstance.post('/prizes', payload);
      // Optimistic update: add to prizes list
      const selectedCompetition = competitions.find(c => c._id === formData.competition);
      const newPrize = { 
        ...createResponse.data.prize, 
        competition: { 
          _id: formData.competition, 
          name: selectedCompetition?.name 
        } 
      };
      setPrizes(prev => [newPrize, ...prev]);
      showToast('success', 'Prize created successfully');
      setFormData({ competition: '', rank: '', amount: '' });
      // If modal is open for this competition, it will update instantly via filter
    } catch (error) {
      console.error('Error creating prize:', error);
      const errMsg = error.response?.data?.message || 'Failed to create prize';
      showToast('error', errMsg);
      fetchData();
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.rank.trim() || !formData.amount) {
      showToast('error', 'Rank and amount are required');
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        competition: editingPrize.competition?._id,
        rank: formData.rank.trim(),
        amount: parseFloat(formData.amount).toFixed(2),
      };

      const updateResponse = await axiosInstance.put(`/prizes/${editingPrize._id}`, payload);
      // Update the list with the full response data
      const updatedPrize = updateResponse.data.prize;
      setPrizes(prev =>
        prev.map(p =>
          p._id === editingPrize._id ? updatedPrize : p
        )
      );
      showToast('success', 'Prize updated successfully');
      setEditingPrize(null);
      setFormData({ competition: '', rank: '', amount: '' });
    } catch (error) {
      console.error('Error updating prize:', error);
      const errMsg = error.response?.data?.message || 'Failed to update prize';
      showToast('error', errMsg);
      fetchData(); // Refresh on error
    } finally {
      setUpdating(false);
    }
  };

  const openDelete = (id) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/prizes/${deletingId}`);
      setPrizes(prev => prev.filter(p => p._id !== deletingId));
      showToast('success', 'Prize deleted successfully');
    } catch (error) {
      console.error('Error deleting prize:', error);
      showToast('error', 'Failed to delete prize');
      fetchData();
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const openPrizesModal = (comp) => {
    setSelectedComp(comp);
    setShowPrizesModal(true);
  };

  const getAmountValue = (amount) => {
    if (typeof amount === 'string') return amount;
    if (amount && amount.$numberDecimal) return amount.$numberDecimal;
    return '0';
  };

  const openEdit = (prize) => {
    setFormData({
      rank: prize.rank || '',
      amount: getAmountValue(prize.amount),
    });
    setEditingPrize(prize);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompChange = (value) => {
    setFormData({
      ...formData,
      competition: value,
    });
  };

  const compPrizes = prizes.filter(prize => prize.competition?._id === selectedComp?._id);

  // Helper function to get amount as formatted string
  const getFormattedAmount = (amountObj) => {
    const value = getAmountValue(amountObj);
    return parseFloat(value).toFixed(2);
  };

  // Sort prizes by rank in ascending order
  const getRankNumber = (rank) => {
    const match = rank?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  const sortedCompPrizes = [...compPrizes].sort((a, b) => getRankNumber(a.rank) - getRankNumber(b.rank));

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Prizes</h1>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Prize</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Competition</label>
              <Select value={formData.competition} onValueChange={handleCompChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((comp) => (
                    <SelectItem key={comp._id} value={comp._id}>
                      {comp.name} ({comp.role?.name?.replace('_', ' ') || 'Unknown'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rank</label>
              <Input
                type="text"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                placeholder="e.g., 1st, Top 10"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 100.00"
                step="0.01"
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={creating} className="w-48">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Prize'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Competitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitions with Prizes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competition Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No competitions found.
                  </TableCell>
                </TableRow>
              ) : (
                competitions.map((comp) => (
                  <TableRow key={comp._id}>
                    <TableCell>{comp.name}</TableCell>
                    <TableCell>{comp.role?.name?.replace('_', ' ') || 'Unknown'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPrizesModal(comp)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Prizes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prizes Modal */}
      <Dialog open={showPrizesModal} onOpenChange={setShowPrizesModal}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Prizes for {selectedComp?.name}</DialogTitle>
            <DialogDescription>Manage prizes for this competition.</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCompPrizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No prizes found for this competition.
                  </TableCell>
                </TableRow>
              ) : (
                sortedCompPrizes.map((prize) => (
                  <TableRow key={prize._id}>
                    <TableCell>{prize.rank}</TableCell>
                    <TableCell>₹{getFormattedAmount(prize.amount)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(prize)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDelete(prize._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button type="button" onClick={() => setShowPrizesModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrize} onOpenChange={() => setEditingPrize(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Prize</DialogTitle>
            <DialogDescription>Update the prize details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rank</label>
              <Input
                type="text"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                placeholder="e.g., 1st"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 100.00"
                step="0.01"
              />
            </div>
            <DialogFooter className="space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingPrize(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prize? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;