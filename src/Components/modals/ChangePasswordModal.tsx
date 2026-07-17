'use client'
import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, InputAdornment
} from '@mui/material'
import { useChangePassword } from './useChangePassword'

interface Props {
  open: boolean
  onClose: () => void
}

const ChangePasswordModal = ({ open, onClose }: Props) => {
  const { formik, handleClose, showOld, showNew, showConfirm, setShowOld, setShowNew, setShowConfirm } = useChangePassword(onClose)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
      <DialogTitle className='text-center font-bold text-xl'>Change Password</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent className='flex flex-col gap-4'>
          <TextField
            fullWidth
            label='Old Password'
            name='oldPassword'
            type={showOld ? 'text' : 'password'}
            value={formik.values.oldPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
            helperText={formik.touched.oldPassword && formik.errors.oldPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowOld(!showOld)}><i className={showOld ? 'ri-eye-off-line' : 'ri-eye-line'} /></IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            label='New Password'
            name='newPassword'
            type={showNew ? 'text' : 'password'}
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowNew(!showNew)}><i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'} /></IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            label='Confirm New Password'
            name='confirmPassword'
            type={showConfirm ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowConfirm(!showConfirm)}><i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'} /></IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions className='pb-6 px-6'>
          <Button onClick={handleClose} color='secondary'>Cancel</Button>
          <Button type='submit' variant='contained' disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ChangePasswordModal