'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  IconButton,
  Badge,
  ClickAwayListener,
  Paper,
  Popper,
  Grow,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import toast from 'react-hot-toast'

// Actions Import
import { getMyRemindersAction, markReminderReadAction } from '@/Services/APIs/Reminder/reminder.action'

dayjs.extend(relativeTime)

export interface IReminderItem {
  _id: string
  notifyTo: string
  notifyType: 'candidate' | 'tac' | 'foe'
  sentFrom?: {
    firstName?: string
    lastName?: string
    profilePic?: any
  }
  heading: string
  message: string
  read: boolean
  createdAt: string
}

// ⚡ Helper: Agar profilePic na mile toh default avatar.png use karega
const getAvatarUrl = (pic: any) => {
  if (!pic) return '/images/avatars/avatar.png'
  if (typeof pic === 'string') return pic
  return pic?.path || pic?.url || '/images/avatars/avatar.png'
}

const ReminderDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const [reminders, setReminders] = useState<IReminderItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedReminder, setSelectedReminder] = useState<IReminderItem | null>(null)

  // Fetch My Reminders
  const fetchReminders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyRemindersAction()
      if (res?.data?.success) {
        setReminders(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const unreadCount = reminders.filter((r) => !r.read).length

  const handleToggle = () => {
    setOpen((prev) => !prev)
    if (!open) {
      fetchReminders()
    }
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }

  // Single Mark Read
  const markAsRead = async (id: string) => {
    try {
      await markReminderReadAction({ reminderId: id })
      setReminders((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item))
      )
    } catch (error) {
      console.error('Mark read error:', error)
    }
  }

  // Bulk Mark All Read
  const handleMarkAllRead = async () => {
    try {
      const res = await markReminderReadAction({ markAll: true })
      if (res?.data?.success) {
        toast.success('All reminders marked as read')
        setReminders((prev) => prev.map((item) => ({ ...item, read: true })))
      }
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleItemClick = (rem: IReminderItem) => {
    setSelectedReminder(rem)
    if (!rem.read) {
      markAsRead(rem._id)
    }
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        className="text-[var(--mui-palette-text-primary)]"
      >
        <Badge badgeContent={unreadCount} color="error">
          <i className="ri-notification-2-line text-xl" />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-end"
        style={{ zIndex: 1300 }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14], 
            },
          },
        ]}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top',
            }}
          >
            <Paper className="shadow-2xl w-[320px] sm:w-[380px] rounded-2xl overflow-hidden mt-1  ">
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box className="flex items-center justify-between px-4 py-3 bg-[var(--mui-palette-background-paper)]">
                    <Typography variant="h5" className="font-medium text-[var(--mui-palette-secondary-main)]
">
                      Reminders
                    </Typography>
                    {unreadCount > 0 && (
                      <Box className="bg-[var(--mui-palette-primary-lightOpacity)] text-[var(--mui-palette-primary-main)] px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {unreadCount} New
                      </Box>
                    )}
                  </Box>
                  <Divider />

                  {/* Reminder List */}
                  <Box className="max-h-[360px] overflow-y-auto">
                    {loading ? (
                      <Box className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Box key={i} className="flex gap-3 items-center">
                            <Skeleton variant="circular" width={38} height={38} />
                            <Box className="flex-1">
                              <Skeleton variant="text" width="60%" />
                              <Skeleton variant="text" width="90%" />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : reminders.length > 0 ? (
                      reminders.map((rem, index) => {
                        const senderPic = getAvatarUrl(rem.sentFrom?.profilePic)

                        return (
                          <React.Fragment key={rem._id}>
                            <Box
                              onClick={() => handleItemClick(rem)}
                              className={`flex items-start gap-3 p-3.5 hover:bg-[var(--mui-palette-action-hover)] transition-colors cursor-pointer ${
                                !rem.read ? 'bg-[var(--mui-palette-primary-lightOpacity)]/30' : ''
                              }`}
                            >
                             
                              <Avatar
                                src={senderPic}
                                alt="User Avatar"
                                sx={{
                                  width: 42,
                                  height: 42,
                                }}
                              />

                              <Box className="flex-1 min-w-0">
                                <Box className="flex items-center justify-between gap-1">
                                  <Typography
                                    variant="subtitle2"
                                    noWrap
                                    className={`text-[14px] leading-tight ${
                                      !rem.read ? 'font-bold text-[var(--mui-palette-primary)]' : 'font-semibold'
                                    }`}
                                  >
                                    {rem.heading}
                                  </Typography>
                                  <Typography variant="caption" className="text-[10px] text-gray-400 shrink-0">
                                    {dayjs(rem.createdAt).fromNow(true)}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  className="text-[12px] text-[var(--mui-palette-text-secondary)] mt-1 whitespace-pre-line line-clamp-2"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {rem.message}
                                </Typography>
                              </Box>
                            </Box>
                            {index < reminders.length - 1 && <Divider />}
                          </React.Fragment>
                        )
                      })
                    ) : (
                      <Box className="p-8 text-center text-gray-400">
                        <i className="ri-notification-off-line text-3xl mb-1 block" />
                        <Typography variant="body2">No reminders available</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Read All Button */}
                  {reminders.length > 0 && (
                    <Box className="p-3  ">
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={unreadCount === 0}
                        onClick={handleMarkAllRead}
                        className="bg-orange-400
 hover:bg-[#4be385] text-white rounded-xl py-2.5 font-medium tracking-wide normal-case shadow-md disabled:bg-gray-300"
                      >
                        READ ALL REMINDERS
                      </Button>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selectedReminder)}
        onClose={() => setSelectedReminder(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-2' }}
      >
        <DialogTitle className="font-bold text-[18px] pb-1">
          {selectedReminder?.heading}
        </DialogTitle>
        <DialogContent className="pt-2">
          <Typography
            variant="body2"
            className="text-[14px] text-[var(--mui-palette-text-primary)] whitespace-pre-line leading-relaxed"
          >
            {selectedReminder?.message}
          </Typography>
          <Typography variant="caption" className="text-gray-400 mt-4 block text-right">
            Sent {dayjs(selectedReminder?.createdAt).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedReminder(null)}
            className="font-bold normal-case text-primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ReminderDropdown