import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  FolderOpen,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { adminApi } from '@/api/api'

const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [genderFilter, setGenderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [operationLoading, setOperationLoading] = useState({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', gender: 'unisex' })

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await adminApi.categories.getCategories(genderFilter, statusFilter)
      setCategories(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create category
  const createCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    try {
      const response = await adminApi.categories.createCategory(formData)
      toast.success('Category created successfully')
      setIsCreateDialogOpen(false)
      setFormData({ name: '', gender: 'unisex' })
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
      console.error('Error creating category:', error)
    }
  }

  // Update category
  const updateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    try {
      await adminApi.categories.updateCategory(editingCategory._id, formData)
      toast.success('Category updated successfully')
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: '', gender: 'unisex' })
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category')
      console.error('Error updating category:', error)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    setOperationLoading(prev => ({ ...prev, [categoryId]: true }))
    try {
      // Optimistically update UI first
      setCategories(prevCategories => prevCategories.filter(category => category._id !== categoryId))
      
      await adminApi.categories.deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      
      // Refresh to ensure consistency
      await fetchCategories()
    } catch (error) {
      // Revert optimistic update on error
      fetchCategories()
      toast.error(error.response?.data?.message || 'Failed to delete category')
      console.error('Error deleting category:', error)
    } finally {
      setOperationLoading(prev => ({ ...prev, [categoryId]: false }))
    }
  }

  // Toggle category status
  const toggleCategoryStatus = async (categoryId) => {
    console.log('Frontend: Toggling category status for:', categoryId)
    setOperationLoading(prev => ({ ...prev, [categoryId]: true }))
    try {
      // Optimistically update UI first
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category._id === categoryId 
            ? { ...category, isActive: !category.isActive }
            : category
        )
      )
      
      console.log('Frontend: Calling API to toggle category status')
      console.log('Frontend: API URL:', `/admin/categories/${categoryId}/toggle`)
      
      const response = await adminApi.categories.toggleCategoryStatus(categoryId)
      console.log('Frontend: API response:', response.data)
      toast.success('Category status updated')
      
      // Refresh to ensure consistency
      await fetchCategories()
    } catch (error) {
      console.error('Frontend: Error toggling category status:', error)
      console.error('Frontend: Error message:', error.message)
      console.error('Frontend: Error response:', error.response?.data)
      console.error('Frontend: Error status:', error.response?.status)
      console.error('Frontend: Error config:', error.config)
      
      // Revert optimistic update on error
      fetchCategories()
      toast.error(`Failed to update category status: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [categoryId]: false }))
    }
  }

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, gender: category.gender })
    setIsEditDialogOpen(true)
  }

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Filter categories based on search term
  const searchFilteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.gender.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCategories = categories.filter(category => category.isActive)
  const inactiveCategories = categories.filter(category => !category.isActive)

  useEffect(() => {
    fetchCategories()
  }, [genderFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Manage product categories and their gender targeting
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to your product catalog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., T-Shirts, Jeans, Shoes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCategory}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search categories by name or gender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gender</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories ({searchFilteredCategories.length})</SelectItem>
                  <SelectItem value="true">Active Only ({activeCategories.length})</SelectItem>
                  <SelectItem value="false">Inactive Only ({inactiveCategories.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <CategoryTable 
        categories={searchFilteredCategories} 
        onToggleStatus={toggleCategoryStatus}
        onDelete={deleteCategory}
        onEdit={handleEdit}
        operationLoading={operationLoading}
        statusFilter={statusFilter}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name and gender
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., T-Shirts, Jeans, Shoes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Category Table Component
const CategoryTable = ({ 
  categories, 
  onToggleStatus, 
  onDelete, 
  onEdit,
  operationLoading,
  statusFilter 
}) => {
  if (categories.length === 0) {
    const getEmptyStateMessage = () => {
      switch (statusFilter) {
        case 'true':
          return {
            title: 'No active categories found',
            description: 'All categories are currently inactive'
          }
        case 'false':
          return {
            title: 'No inactive categories found',
            description: 'All categories are currently active'
          }
        default:
          return {
            title: 'No categories found',
            description: 'Add your first category to get started'
          }
      }
    }

    const { title, description } = getEmptyStateMessage()

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {categories.map((category) => (
                <motion.tr
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {category.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={operationLoading[category._id]}
                        >
                          {operationLoading[category._id] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onToggleStatus(category._id)}
                          disabled={operationLoading[category._id]}
                        >
                          {category.isActive ? (
                            <EyeOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"? This will also delete all products and variants in this category. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(category._id)}
                                disabled={operationLoading[category._id]}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {operationLoading[category._id] ? (
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
      </CardContent>
    </Card>
  )
}

export default CategoryManagement
