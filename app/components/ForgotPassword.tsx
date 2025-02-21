import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { showError, showSuccess } from './Toastr';

interface ForgotPasswordProps {
  type:string; // Define the prop for the role
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(type); // Initialize with the type prop
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      setLoading(false);
      closeModal();
    }
  };

  useEffect(() => {
    setRole(type); // Update role when the type prop changes
  }, [type]);

  return (
    <>
      <Button
        variant="text"
        onClick={openModal}
        sx={{
          textDecoration: 'underline',
          color: 'primary.main',
          textTransform: 'none',
          padding: 0,
          marginLeft:-1,
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline'
          },
        }}
      >Reset
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
                <FormControlLabel value="Coach" control={<Radio checked={type === 'coach'} />} label="Coach" />
                <FormControlLabel value="Player" control={<Radio checked={type === 'player'} />} label="Player" />
                <FormControlLabel value="Enterprise" control={<Radio checked={type === 'enterprise'} />} label="Organization" />
                <FormControlLabel value="Team" control={<Radio checked={type === 'team'} />} label="Team" />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mb: 1 }}
              disabled={loading}
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
