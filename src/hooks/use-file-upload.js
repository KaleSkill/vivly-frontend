import { useState, useCallback, useRef } from 'react'

// Utility function to format bytes
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Utility function to create file preview URL
const createFilePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

export const useFileUpload = ({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = true,
  maxFiles = 10,
  initialFiles = []
}) => {
  const [files, setFiles] = useState(Array.isArray(initialFiles) ? initialFiles : [])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState([])
  const inputRef = useRef(null)

  // Validate file
  const validateFile = (file) => {
    const errors = []
    
    // Check file type
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileType = file.type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type
        }
        return fileType.match(type.replace('*', '.*'))
      })
      
      if (!isAccepted) {
        errors.push(`File type not supported. Accepted types: ${accept}`)
      }
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${formatBytes(maxSize)} limit`)
    }
    
    return errors
  }

  // Add files
  const addFiles = useCallback(async (newFiles) => {
    const fileArray = Array.from(newFiles)
    const validFiles = []
    const newErrors = []
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`)
      setErrors(newErrors)
      return
    }
    
    for (const file of fileArray) {
      const fileErrors = validateFile(file)
      if (fileErrors.length === 0) {
        try {
          const preview = await createFilePreview(file)
          validFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            preview,
            name: file.name,
            size: file.size,
            type: file.type
          })
        } catch (error) {
          newErrors.push(`Failed to process ${file.name}`)
        }
      } else {
        newErrors.push(...fileErrors.map(error => `${file.name}: ${error}`))
      }
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...(Array.isArray(prev) ? prev : []), ...validFiles])
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
    }
  }, [files.length, maxFiles, maxSize, accept])

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => (Array.isArray(prev) ? prev : []).filter(file => file.id !== fileId))
    setErrors([])
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([])
    setErrors([])
  }, [])

  // Drag handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [addFiles])

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = e.target.files
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [addFiles])

  // Get input props
  const getInputProps = useCallback(() => ({
    ref: inputRef,
    type: 'file',
    accept,
    multiple,
    onChange: handleFileInputChange,
    style: { display: 'none' }
  }), [accept, multiple, handleFileInputChange])

  return [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
      addFiles
    }
  ]
}