import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Palette,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal
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

const ColorManagement = () => {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [operationLoading, setOperationLoading] = useState({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingColor, setEditingColor] = useState(null)
  const [formData, setFormData] = useState({ name: '', hexCode: '#000000' })

  // Fetch colors
  const fetchColors = async () => {
    setLoading(true)
    try {
      const response = await adminApi.colors.getColors(filter)
      setColors(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch colors')
      console.error('Error fetching colors:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create color
  const createColor = async () => {
    if (!formData.name.trim() || !formData.hexCode) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await adminApi.colors.createColor(formData)
      toast.success('Color created successfully')
      setIsCreateDialogOpen(false)
      setFormData({ name: '', hexCode: '#000000' })
      fetchColors()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create color')
      console.error('Error creating color:', error)
    }
  }

  // Update color
  const updateColor = async () => {
    if (!formData.name.trim() || !formData.hexCode) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await adminApi.colors.updateColor(editingColor._id, formData)
      toast.success('Color updated successfully')
      setIsEditDialogOpen(false)
      setEditingColor(null)
      setFormData({ name: '', hexCode: '#000000' })
      fetchColors()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update color')
      console.error('Error updating color:', error)
    }
  }

  // Delete color
  const deleteColor = async (colorId) => {
    setOperationLoading(prev => ({ ...prev, [colorId]: true }))
    try {
      // Optimistically update UI first
      setColors(prevColors => prevColors.filter(color => color._id !== colorId))
      
      await adminApi.colors.deleteColor(colorId)
      toast.success('Color deleted successfully')
      
      // Refresh to ensure consistency
      await fetchColors()
    } catch (error) {
      // Revert optimistic update on error
      fetchColors()
      toast.error(error.response?.data?.message || 'Failed to delete color')
      console.error('Error deleting color:', error)
    } finally {
      setOperationLoading(prev => ({ ...prev, [colorId]: false }))
    }
  }

  // Toggle color status
  const toggleColorStatus = async (colorId) => {
    setOperationLoading(prev => ({ ...prev, [colorId]: true }))
    try {
      // Optimistically update UI first
      setColors(prevColors => 
        prevColors.map(color => 
          color._id === colorId 
            ? { ...color, isActive: !color.isActive }
            : color
        )
      )
      
      await adminApi.colors.toggleColorStatus(colorId)
      toast.success('Color status updated')
      
      // Refresh to ensure consistency
      await fetchColors()
    } catch (error) {
      // Revert optimistic update on error
      fetchColors()
      toast.error('Failed to update color status')
      console.error('Error toggling color status:', error)
    } finally {
      setOperationLoading(prev => ({ ...prev, [colorId]: false }))
    }
  }

  // Handle edit
  const handleEdit = (color) => {
    setEditingColor(color)
    setFormData({ name: color.name, hexCode: color.hexCode })
    setIsEditDialogOpen(true)
  }

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Filter colors based on search term
  const searchFilteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.hexCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Apply status filter based on selected filter
  const getFilteredColors = () => {
    switch (filter) {
      case 'true':
        return searchFilteredColors.filter(color => color.isActive)
      case 'false':
        return searchFilteredColors.filter(color => !color.isActive)
      default:
        return searchFilteredColors
    }
  }

  const filteredColors = getFilteredColors()
  const activeColors = colors.filter(color => color.isActive)
  const inactiveColors = colors.filter(color => !color.isActive)

  useEffect(() => {
    fetchColors()
  }, [filter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Color Management</h1>
          <p className="text-muted-foreground">
            Manage product colors and their hex codes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Color
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Color</DialogTitle>
              <DialogDescription>
                Add a new color to your product catalog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Color Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Red, Blue, Green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hexCode">Hex Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="hexCode"
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => handleInputChange('hexCode', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.hexCode}
                    onChange={(e) => handleInputChange('hexCode', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createColor}>
                Create Color
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
                placeholder="Search colors by name or hex code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Colors ({filteredColors.length})
                  </SelectItem>
                  <SelectItem value="true">
                    Active Only ({activeColors.length})
                  </SelectItem>
                  <SelectItem value="false">
                    Inactive Only ({inactiveColors.length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors Table */}
      <ColorTable 
        colors={filteredColors} 
        onToggleStatus={toggleColorStatus}
        onDelete={deleteColor}
        onEdit={handleEdit}
        operationLoading={operationLoading}
        filter={filter}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>
              Update the color name and hex code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Color Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Red, Blue, Green"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hexCode">Hex Code</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-hexCode"
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) => handleInputChange('hexCode', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.hexCode}
                  onChange={(e) => handleInputChange('hexCode', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateColor}>
              Update Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Color Table Component
const ColorTable = ({ 
  colors, 
  onToggleStatus, 
  onDelete, 
  onEdit,
  operationLoading,
  filter 
}) => {
  if (colors.length === 0) {
    const getEmptyStateMessage = () => {
      switch (filter) {
        case 'true':
          return {
            title: 'No active colors found',
            description: 'All colors are currently inactive'
          }
        case 'false':
          return {
            title: 'No inactive colors found',
            description: 'All colors are currently active'
          }
        default:
          return {
            title: 'No colors found',
            description: 'Add your first color to get started'
          }
      }
    }

    const { title, description } = getEmptyStateMessage()

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Palette className="h-12 w-12 text-gray-400 mb-4" />
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
              <TableHead className="w-16">Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Hex Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {colors.map((color) => (
                <motion.tr
                  key={color._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{color.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {color.hexCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={color.isActive ? 'default' : 'secondary'}>
                      {color.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(color.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={operationLoading[color._id]}
                        >
                          {operationLoading[color._id] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(color)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Color
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onToggleStatus(color._id)}
                          disabled={operationLoading[color._id]}
                        >
                          {color.isActive ? (
                            <EyeOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {color.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Color
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Color</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{color.name}"? This will also delete all product variants using this color. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(color._id)}
                                disabled={operationLoading[color._id]}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {operationLoading[color._id] ? (
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

export default ColorManagement
