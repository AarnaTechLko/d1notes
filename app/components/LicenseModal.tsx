import React, { useState } from 'react';
import { Modal, Box, Button } from '@mui/material';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
interface LicenseProps {
  fileurl:string; // Define the prop for the role
}

const ViewLicenseModal: React.FC<LicenseProps> = ({ fileurl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const docs = [
    { uri: fileurl }, // Remote file
  ];

  return (
    <>
      <Button
        variant="text"
        onClick={openModal}
        sx={{
          color: 'primary.main',
          textTransform: 'none',
          padding: 0,
          marginLeft:-1,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >View CV
      </Button>

      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="license-view-modal"
      >
        <Box sx={{
          height: '80vh',
          width: '80vh',
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
          justifyContent: 'center',
          'overflow-y': 'scroll'
        }}>
          <DocViewer documents={docs} pluginRenderers={DocViewerRenderers}
            theme={{
              primary: "#5296d8",
              secondary: "#ffffff",
              tertiary: "#5296d899",
              textPrimary: "#ffffff",
              textSecondary: "#5296d8",
              textTertiary: "#00000099",
              disableThemeScrollbar: false,
            }} style={{ height: '100%', width: '100%' }}
          config={{ header: { disableHeader: true, disableFileName: true, } }}/>
        </Box>
      </Modal>
    </>
  );
};

export default ViewLicenseModal;
