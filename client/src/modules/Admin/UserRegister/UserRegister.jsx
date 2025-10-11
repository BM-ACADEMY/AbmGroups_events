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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, Lock, School, Trash2, Edit, Plus } from 'lucide-react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';

const UserRegister = () => {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: ''
  });
  const [creating, setCreating] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showChooseModal, setShowChooseModal] = useState(false);
  const [selectedUserForChoose, setSelectedUserForChoose] = useState(null);
  const [chooseFormData, setChooseFormData] = useState({ competition: '' });
  const [choosing, setChoosing] = useState(false);

  // Fetch roles, competitions, participants, and users on mount
  useEffect(() => {
    fetchRoles();
    fetchCompetitions();
    fetchParticipants();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('error', 'Failed to fetch roles');
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await axiosInstance.get('/competitions');
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      showToast('error', 'Failed to fetch competitions');
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axiosInstance.get('/participants');
      console.log('Participants:', response.data.data); // Debug: Log participants
      setParticipants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      showToast('error', 'Failed to fetch participants');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password || !formData.role) {
      showToast('error', 'All fields are required');
      return;
    }

    try {
      setCreating(true);
      const response = await axiosInstance.post('/auth/register', formData);
      showToast('success', 'User registered successfully');
      setFormData({ name: '', phone: '', email: '', password: '', role: '' });
      setShowForm(false);
      fetchUsers(); // Refresh table
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      showToast('error', errMsg);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (user) => {
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      role: user.role?.name || '',
      password: '' // Don't prefill password
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.role) {
      showToast('error', 'Name, phone, and role are required');
      return;
    }

    try {
      setUpdating(true);
      const selectedRole = roles.find(r => r.name === formData.role);
      if (!selectedRole) {
        showToast('error', 'Invalid role');
        return;
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        role: selectedRole._id,
      };
      if (formData.email) {
        payload.email = formData.email;
      }
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await axiosInstance.put(`/users/${editingUser._id}`, payload);
      setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...response.data, role: selectedRole } : u));
      showToast('success', 'User updated successfully');
      setEditingUser(null);
      setFormData({ name: '', phone: '', email: '', password: '', role: '' });
      setShowForm(false);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Update failed';
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

    try {
      setDeleting(true);
      await axiosInstance.delete(`/users/${deletingId}`);
      setUsers(prev => prev.filter(u => u._id !== deletingId));
      showToast('success', 'User deleted successfully');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Delete failed';
      showToast('error', errMsg);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const openChooseModal = (user) => {
    // Add null check for p.user
    const existingParticipant = participants.find(p => p.user && p.user._id === user._id);
    setSelectedUserForChoose(user);
    setChooseFormData({ 
      competition: existingParticipant ? existingParticipant.competition?._id || '' : '' 
    });
    setShowChooseModal(true);
  };

  const handleChooseChange = (value) => {
    setChooseFormData({
      ...chooseFormData,
      competition: value
    });
  };

  const handleChooseSubmit = async (e) => {
    e.preventDefault();
    if (!chooseFormData.competition) {
      showToast('error', 'Please select a competition');
      return;
    }

    try {
      setChoosing(true);
      const payload = {
        user: selectedUserForChoose._id,
        competition: chooseFormData.competition,
        upload_path: null,
        total_marks: 0,
      };

      const response = await axiosInstance.post('/participants', payload);
      showToast('success', 'User registered for competition successfully');
      setShowChooseModal(false);
      setSelectedUserForChoose(null);
      setChooseFormData({ competition: '' });
      fetchParticipants(); // Refresh participants
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to register for competition';
      showToast('error', errMsg);
    } finally {
      setChoosing(false);
    }
  };

  const openForm = () => {
    setFormData({ name: '', phone: '', email: '', password: '', role: '' });
    setEditingUser(null);
    setShowForm(true);
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={openForm}>Register New User</Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Participations</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users
                  .filter(u => u.role?.name !== "admin")
                  .map((user) => {
                    const userParticipations = participants
                      .filter(p => p.user?._id === user._id)
                      .map(p => p.competition?.name || 'Unknown')
                      .join(', ');
                    return (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.role?.name?.replace('_', ' ').toUpperCase() || 'N/A'}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{userParticipations || 'None'}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(user._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openChooseModal(user)}>
                            <Plus className="h-4 w-4" />
                            Choose
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Register New User'}</DialogTitle>
            <DialogDescription>{editingUser ? 'Update user details.' : 'Create a new user account.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (Optional)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{editingUser ? 'New Password (Optional)' : 'Password'}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required={!editingUser}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={formData.role} onValueChange={handleRoleChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_student">School Student</SelectItem>
                  <SelectItem value="college_student">College Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingUser ? 'Update User' : 'Register User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Choose Competition Modal */}
      <Dialog open={showChooseModal} onOpenChange={setShowChooseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register {selectedUserForChoose?.name || 'User'} for Competition</DialogTitle>
            <DialogDescription>Select a competition to register this user (replaces existing if any).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChooseSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Competition</label>
              <Select value={chooseFormData.competition} onValueChange={handleChooseChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions
                    .filter(comp => comp && comp._id)
                    .map((comp) => (
                      <SelectItem key={comp._id} value={comp._id}>
                        {comp.name || 'Unknown Competition'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowChooseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={choosing}>
                {choosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
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
              Are you sure you want to delete this user? This action cannot be undone.
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

export default UserRegister;