
import { Box, Button, DialogActions, DialogContent, DialogTitle, Slider, Typography } from "@mui/material";
import { Cancel } from '@mui/icons-material';
import CropIcon from "@mui/icons-material/Crop"
import Cropper from "react-easy-crop";
import React, { useState } from "react";
import getCroppedImg from './utils/cropimage';

type CropEasyProps = {
  photoUrl: string | undefined;
  setOpenCrop: React.Dispatch<React.SetStateAction<boolean>>;
  handleCropImage: (file: File) => void;
}

const CropEasy: React.FC<CropEasyProps> = ({ photoUrl, setOpenCrop, handleCropImage }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixel, setCroppedAreaPixel] = useState({x: 0, y:0, width: 0, height: 0})


  const cropComplete = (croppedArea: any, croppedAreaPixel: any) => {
    setCroppedAreaPixel(croppedAreaPixel)
  }

  const handleZoomChange = (event: Event, newZoom: number | number[]) => {
    if (Array.isArray(newZoom)) {
      setZoom(newZoom[0]);
    } else {
      setZoom(newZoom);
    }
  };
  const handleRotationChange = (event: Event, newRotation: number | number[]) => {
    if (Array.isArray(newRotation)) {
      setRotation(newRotation[0]);
    } else {
      setRotation(newRotation);
    }
  };

  
  const cropImage = async () => {
    //get cropped image file
    if(photoUrl){
      const { file }: any = await getCroppedImg(photoUrl, croppedAreaPixel, rotation)
      
      //pass the image file to a function prop that will upload and update formValues
      handleCropImage(file)
    }
    
  }
  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-7 shadow-lg ">

        <DialogTitle
          sx={{
            textAlign: "center"
          }}
        >
          Crop Profile Picture
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: "#333",
            position: "relative",
            height: "400px",
            width: "400px",
            midWidth: { sm: 500 },
            border: 'none'

          }}
        >
          <Cropper
            image={photoUrl}
            cropShape="round"
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropChange={setCrop}
            onCropComplete={cropComplete}
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", mx: 3, my: 2 }}>
          <Box sx={{ width: "100%", mb: 1 }}>
            <Box>
              <Typography>Zoom: {zoomPercent(zoom)}</Typography>
              <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={zoomPercent}
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={handleZoomChange}
              />
            </Box>
            <Box>
              <Typography>Rotation: {rotation}</Typography>
              <Slider
                valueLabelDisplay="auto"
                min={0}
                max={360}
                value={rotation}
                onChange={handleRotationChange}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap"
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => setOpenCrop(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<CropIcon />}
              onClick={cropImage}
            >
              Crop
            </Button>
          </Box>
        </DialogActions>
      </div>
    </>
  )
}

export default CropEasy;

const zoomPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
}