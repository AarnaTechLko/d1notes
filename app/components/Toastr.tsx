// components/Toastr.tsx
import React, { useEffect } from 'react';
import toastr from 'toastr';

import 'toastr/build/toastr.min.css';

const Toastr: React.FC = () => {
  useEffect(() => {
    toastr.options = {
      closeButton: true,
      debug: false,
      positionClass: 'toast-top-right',
      onclick: undefined,
      showDuration: 300,
      hideDuration: 1000,
      timeOut: 5000,
      extendedTimeOut: 1000,
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
    };
  }, []);

  return null; // This component does not render anything itself
};

export const showSuccess = (message: string) => toastr.success(message);
export const showError = (message: string) => toastr.error(message);
export const showInfo = (message: string) => toastr.info(message);
export const showWarning = (message: string) => toastr.warning(message);

export default Toastr;
