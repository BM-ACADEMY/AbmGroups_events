import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { Loader2, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', role: 'school_student', is_team_based: false, competition_image: null });
  const [filterRole, setFilterRole] = useState('all');
  const [creating, setCreating] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch competitions on mount
  useEffect(() => {
    fetchCompetitions();
  }, []);

  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowPreviewModal(true);
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/competitions');
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      showToast('error', 'Failed to fetch competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Name is required');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name.trim());
    formDataToSend.append('role', formData.role);
    formDataToSend.append('is_team_based', formData.is_team_based);
    formDataToSend.append('requires_upload', false);
    if (formData.competition_image) {
      formDataToSend.append('competition_image', formData.competition_image);
    }

    try {
      setCreating(true);
      // Fetch roles to get id
      const rolesResponse = await axiosInstance.get('/roles');
      const roleObj = rolesResponse.data.find(r => r.name === formData.role);
      if (!roleObj) {
        showToast('error', 'Invalid role');
        return;
      }

      formDataToSend.set('role', roleObj._id);

      const createResponse = await axiosInstance.post('/competitions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Optimistic update: add the new competition to the list instantly
      const newComp = { ...createResponse.data.competition, role: { name: formData.role } };
      setCompetitions(prev => [newComp, ...prev]);
      showToast('success', 'Competition created successfully');
      setFormData({ name: '', role: 'school_student', is_team_based: false, competition_image: null });
    } catch (error) {
      console.error('Error creating competition:', error);
      const errMsg = error.response?.data?.message || 'Failed to create competition';
      showToast('error', errMsg);
      // If failed, refresh to sync
      fetchCompetitions();
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Name is required');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name.trim());
    formDataToSend.append('role', formData.role);
    formDataToSend.append('is_team_based', formData.is_team_based);
    formDataToSend.append('requires_upload', editingComp.requires_upload);
    if (formData.competition_image) {
      formDataToSend.append('competition_image', formData.competition_image);
    }

    try {
      setUpdating(true);
      // Fetch roles to get id
      const rolesResponse = await axiosInstance.get('/roles');
      const roleObj = rolesResponse.data.find(r => r.name === formData.role);
      if (!roleObj) {
        showToast('error', 'Invalid role');
        return;
      }

      formDataToSend.set('role', roleObj._id);

      const updateResponse = await axiosInstance.put(`/competitions/${editingComp._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update the list with response data
      const updatedComp = { ...updateResponse.data.competition, role: { name: formData.role } };
      setCompetitions(prev =>
        prev.map(c =>
          c._id === editingComp._id ? updatedComp : c
        )
      );
      showToast('success', 'Competition updated successfully');
      setEditingComp(null);
      setFormData({ name: '', role: 'school_student', is_team_based: false, competition_image: null });
    } catch (error) {
      console.error('Error updating competition:', error);
      const errMsg = error.response?.data?.message || 'Failed to update competition';
      showToast('error', errMsg);
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
      await axiosInstance.delete(`/competitions/${deletingId}`);
      setCompetitions(prev => prev.filter(c => c._id !== deletingId));
      showToast('success', 'Competition deleted successfully');
    } catch (error) {
      console.error('Error deleting competition:', error);
      showToast('error', 'Failed to delete competition');
      fetchCompetitions();
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      competition_image: e.target.files[0],
    });
  };

  const handleFilterChange = (value) => {
    setFilterRole(value);
  };

  const openEdit = (comp) => {
    setFormData({
      name: comp.name,
      role: comp.role.name,
      is_team_based: comp.is_team_based,
      competition_image: null, // Reset file input
    });
    setEditingComp(comp);
  };

  // Filter competitions
  const filteredCompetitions = competitions.filter(comp => {
    if (filterRole === 'all') return true;
    return comp.role.name === filterRole;
  });

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
      <h1 className="text-3xl font-bold">Competitions</h1>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter competition name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role (User Type)</label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_student">School Student</SelectItem>
                  <SelectItem value="college_student">College Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Competition Image</label>
              <Input
                type="file"
                name="competition_image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {formData.competition_image && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(formData.competition_image)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => openImagePreview(URL.createObjectURL(formData.competition_image))}
                  />
                  <p className="text-xs text-gray-500">Preview</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Team Based</label>
              <Switch
                checked={formData.is_team_based}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_team_based: checked }))}
              />
            </div>
            <Button type="submit" disabled={creating} className="w-48">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Competition'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter - positioned on the right */}
      <div className="flex justify-end">
        <div className="space-y-2 w-64">
          <label className="text-sm font-medium">Filter by User Type</label>
          <Select value={filterRole} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="school_student">School Student</SelectItem>
              <SelectItem value="college_student">College Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Team Based</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No competitions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompetitions.map((comp) => (
                  <TableRow key={comp._id}>
                    <TableCell>{comp.name}</TableCell>
                    <TableCell>{comp.role.name.replace('_', ' ')}</TableCell>
                    <TableCell>{comp.is_team_based ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {comp.competition_image ? (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={comp.competition_image} 
                            alt={comp.name} 
                            className="w-8 h-8 object-cover rounded cursor-pointer"
                            onClick={() => openImagePreview(comp.competition_image)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <ImageIcon className="h-8 w-8 text-gray-400 hidden" />
                        </div>
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>{new Date(comp.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(comp)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDelete(comp._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingComp} onOpenChange={() => setEditingComp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
            <DialogDescription>Update the competition details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter competition name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role (User Type)</label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_student">School Student</SelectItem>
                  <SelectItem value="college_student">College Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Competition Image (optional)</label>
              <Input
                type="file"
                name="competition_image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {formData.competition_image && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(formData.competition_image)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => openImagePreview(URL.createObjectURL(formData.competition_image))}
                  />
                  <p className="text-xs text-gray-500">New preview</p>
                </div>
              )}
              {editingComp?.competition_image && !formData.competition_image && (
                <div className="mt-2">
                  <img 
                    src={editingComp.competition_image} 
                    alt="Current" 
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => openImagePreview(editingComp.competition_image)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-gray-500">Current image</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Team Based</label>
              <Switch
                checked={formData.is_team_based}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_team_based: checked }))}
              />
            </div>
            <DialogFooter className="space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingComp(null)}>
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
              Are you sure you want to delete this competition? This action cannot be undone.
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

      {/* Image Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal} modal={true}>
        <DialogContent className="p-0 ">
          <DialogHeader className="flex justify-end p-4">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center  justify-center p-4">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  showToast('error', 'Failed to load image');
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competitions;