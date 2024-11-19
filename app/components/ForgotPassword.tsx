import React, { useState } from 'react';
import { Modal, Box, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { showError, showSuccess } from './Toastr';

const ForgotPassword = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Coach' | 'Player' | 'Enterprise' | ''>('');
  const [loading, setLoading] = useState(false); // State to track loading status

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading when the form is submitted

    // Make API call to reset password
    try {
      const response = await fetch('/api/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess("Password reset Instructions sent on your Email.");
      } else {
        showError('Error resetting password.');
      }
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setLoading(false); // Stop loading after the API call
      closeModal();
    }
  };

  return (
    <>
      <Button
        variant="text" // 'text' variant makes it look like a link
        onClick={openModal}
        sx={{
          color: 'primary.main', // You can change this color to match the link style
          textTransform: 'none', // Prevents the text from being capitalized
          padding: 0, // Removes padding for a link-like appearance
          '&:hover': {
            backgroundColor: 'transparent', // Ensures no background on hover
            textDecoration: 'underline', // Adds underline on hover, like a link
          },
        }}
      >
        Click to Reset
      </Button>

      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="forgot-password-modal"
      >
        <Box sx={{ 
          width: 400, 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 2, 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 id="forgot-password-modal">Enter Registered Email ID</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </div>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Select Your Role</FormLabel>
              <RadioGroup
                value={role}
                onChange={(e) => setRole(e.target.value as 'Coach' | 'Player' | 'Enterprise')}
              >
                <FormControlLabel value="coach" control={<Radio />} label="Coach" />
                <FormControlLabel value="player" control={<Radio />} label="Player" />
                <FormControlLabel value="enterprise" control={<Radio />} label="Enterprise" />
              </RadioGroup>
            </FormControl>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mb: 1 }}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </Button>
            <Button variant="outlined" onClick={closeModal} fullWidth>Close</Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default ForgotPassword;
