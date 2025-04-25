import React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    width: '500px',  // Set a fixed width
    maxWidth: '90%', // Make sure it's responsive
    minHeight: '200px', // Minimum height
  },
}));

export default function DialogBox({ open, message = "Default message text", onClose }) {
  return (
    <BootstrapDialog 
      onClose={onClose} 
      open={open} 
      aria-labelledby="customized-dialog-title"
      maxWidth="md" // You can use 'xs', 'sm', 'md', 'lg', or 'xl'
      fullWidth={true} // Makes the dialog use the maxWidth value
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Message
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom variant="body1" style={{ fontSize: '16px' }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </BootstrapDialog>
  );
}