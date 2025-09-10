import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { adminApi } from '../../../api/api'
import { useAuthStore } from '../../../store/authstore'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import UserPagination from '../../../components/ui/user-pagination'

// Icons
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Trash2, 
  RefreshCw,
  Users,
  Shield,
  User,
  Calendar,
  Mail
} from 'lucide-react'

const UserManagement = () => {
  const { authUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, recent: 0 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch users
  const fetchUsers = async (page = currentPage) => {
    setLoading(true)
    try {
      const response = await adminApi.users.getUsers(roleFilter, searchTerm, page, 10)
      setUsers(response.data.data || [])
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      })
      setCurrentPage(page)
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await adminApi.users.getUserStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  useEffect(() => {
    fetchUsers(1) // Reset to page 1 when filters change
    fetchStats()
  }, [roleFilter, searchTerm])

  // Handle page change
  const handlePageChange = (page) => {
    fetchUsers(page)
  }

  // Update user role
  const updateUserRole = async (userId, role) => {
    setOperationLoading(prev => ({ ...prev, [userId]: true }))
    try {
      // Optimistically update UI
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role } : user
        )
      )

      const response = await adminApi.users.updateUserRole(userId, role)
      toast.success(response.data.message)
      
      // Refresh to ensure consistency
      await fetchUsers()
      await fetchStats()
    } catch (error) {
      console.error('Error updating user role:', error)
      // Revert optimistic update
      fetchUsers()
      toast.error(`Failed to update user role: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [userId]: false }))
      setIsRoleDialogOpen(false)
    }
  }

  // Delete user
  const deleteUser = async (userId) => {
    setOperationLoading(prev => ({ ...prev, [userId]: true }))
    try {
      // Optimistically remove from UI
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))

      const response = await adminApi.users.deleteUser(userId)
      toast.success(response.data.message)
      
      // Refresh to ensure consistency
      await fetchUsers()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting user:', error)
      // Revert optimistic update
      fetchUsers()
      toast.error(`Failed to delete user: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  // Handle role change
  const handleRoleChange = (user) => {
    setSelectedUser(user)
    setNewRole(user.role === 'Admin' ? 'User' : 'Admin')
    setIsRoleDialogOpen(true)
  }

  // Get user initials
  const getUserInitials = (user) => {
    const first = user.firstname?.charAt(0) || ''
    const last = user.lastname?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get filtered users for display
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }

  const filteredUsers = getFilteredUsers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (30d)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles ({stats.total})</SelectItem>
                <SelectItem value="Admin">Admins ({stats.admins})</SelectItem>
                <SelectItem value="User">Users ({stats.users})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Users className="h-8 w-8 mb-2" />
              <p>No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile} />
                          <AvatarFallback className="text-sm font-medium">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{user.firstname} {user.lastname}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'} className="font-medium">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={operationLoading[user._id]}
                            >
                              {operationLoading[user._id] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user)}
                              disabled={operationLoading[user._id] || user._id === authUser?._id}
                            >
                              {user.role === 'Admin' ? (
                                <UserX className="h-4 w-4 mr-2" />
                              ) : (
                                <UserCheck className="h-4 w-4 mr-2" />
                              )}
                              {user.role === 'Admin' ? 'Make User' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={user._id === authUser?._id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{user.firstname} {user.lastname}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user._id)}
                                    disabled={operationLoading[user._id]}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {operationLoading[user._id] ? (
                                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <UserPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            paginationItemsToDisplay={5}
          />
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.firstname} {selectedUser?.lastname}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <Badge variant={selectedUser?.role === 'Admin' ? 'default' : 'secondary'} className="ml-2">
                {selectedUser?.role}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateUserRole(selectedUser._id, newRole)}
              disabled={operationLoading[selectedUser?._id]}
            >
              {operationLoading[selectedUser?._id] ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagement
