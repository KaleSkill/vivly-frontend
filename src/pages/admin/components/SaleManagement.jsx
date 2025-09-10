import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../../api/api'

// UI Components
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import UploaderComp from '../../../components/ui/uploader-comp'

// Icons
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus,
  Edit,
  Trash2, 
  RefreshCw,
  Percent,
  Calendar,
  Image,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

const SaleManagement = () => {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)

  // Fetch sales and products
  const fetchData = async () => {
    setLoading(true)
    try {
      const [salesRes, productsRes] = await Promise.all([
        adminApi.sales.getSales(),
        adminApi.products.getProducts({ isActive: 'true' })
      ])
      setSales(salesRes.data.data || [])
      setProducts(productsRes.data.data.products || [])
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  // Toggle sale status
  const toggleSaleStatus = async (saleId) => {
    setOperationLoading(prev => ({ ...prev, [saleId]: true }))
    try {
      // Optimistically update UI
      setSales(prevSales =>
        prevSales.map(sale =>
          sale._id === saleId 
            ? { ...sale, isActive: !sale.isActive }
            : sale
        )
      )

      const response = await adminApi.sales.toggleSaleStatus(saleId)
      toast.success(response.data.message)
      
      // Refresh to ensure consistency
      await fetchData()
    } catch (error) {
      console.error('Error toggling sale status:', error)
      // Revert optimistic update
      fetchData()
      toast.error(`Failed to update sale status: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [saleId]: false }))
    }
  }

  // Delete sale
  const deleteSale = async (saleId) => {
    setOperationLoading(prev => ({ ...prev, [saleId]: true }))
    try {
      // Optimistically remove from UI
      setSales(prevSales => prevSales.filter(sale => sale._id !== saleId))

      const response = await adminApi.sales.deleteSale(saleId)
      toast.success(response.data.message)
      
      // Refresh to ensure consistency
      await fetchData()
    } catch (error) {
      console.error('Error deleting sale:', error)
      // Revert optimistic update
      fetchData()
      toast.error(`Failed to delete sale: ${error.response?.data?.message || error.message}`)
    } finally {
      setOperationLoading(prev => ({ ...prev, [saleId]: false }))
    }
  }


  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if sale is active
  const isSaleActive = (sale) => {
    const now = new Date()
    const startDate = new Date(sale.startDate)
    const endDate = new Date(sale.endDate)
    return sale.isActive && now >= startDate && now <= endDate
  }

  // Filter sales
  const filteredSales = sales.filter(sale =>
    sale.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sale Management</h1>
          <p className="text-muted-foreground">
            Manage sales, discounts, and promotional campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchData()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/admin/sales/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Sale
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">
              All campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.filter(sale => isSaleActive(sale)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.filter(sale => new Date(sale.startDate) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.reduce((total, sale) => total + sale.products.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              In all sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading sales...</span>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Percent className="h-8 w-8 mb-2" />
              <p>No sales found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Sale Name</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredSales.map((sale) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="w-16 h-10 rounded-md overflow-hidden bg-muted">
                          {sale.banner_image?.secure_url ? (
                            <img
                              src={sale.banner_image.secure_url}
                              alt={sale.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{sale.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sale.products.length} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(sale.startDate)} - {formatDate(sale.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={isSaleActive(sale) ? 'default' : 'secondary'}>
                            {isSaleActive(sale) ? 'Active' : 'Inactive'}
                          </Badge>
                          {new Date(sale.startDate) > new Date() && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(sale.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={operationLoading[sale._id]}
                            >
                              {operationLoading[sale._id] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedSale(sale)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Sale
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => toggleSaleStatus(sale._id)}
                              disabled={operationLoading[sale._id]}
                            >
                              {sale.isActive ? (
                                <XCircle className="h-4 w-4 mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              {sale.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Sale
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{sale.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteSale(sale._id)}
                                    disabled={operationLoading[sale._id]}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {operationLoading[sale._id] ? (
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
    </div>
  )
}

export default SaleManagement
