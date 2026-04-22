import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import './index.scss';

type ModalProps = {
  closeHandler: Function;
  open: boolean;
  title?: string;
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs';
  customClass?: string;
  noTitle?: boolean;
  disableFullScreen?: boolean;
  hideCloseIcon?: boolean;
  children?: React.ReactNode; 
};

const Modal: React.FC<ModalProps> = (props) => {
  const {
    children,
    closeHandler,
    customClass,
    open,
    title,
    size,
    noTitle,
    disableFullScreen,
    hideCloseIcon,
  } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down(size));

  const handleClose = () => {
    closeHandler();
  };

  return (
    <Dialog
      fullScreen={disableFullScreen ? false : fullScreen}
      open={open}
      onClose={handleClose}
      maxWidth={size}
      fullWidth
      className={customClass}
    >
      {!noTitle && (
        <DialogTitle className="modal-title">
          {title}
        </DialogTitle>
      )}

      {!hideCloseIcon && (
        <IconButton
          aria-label="close"
          className={
            customClass ? 'dark-colose-btn modal-close-btn' : 'modal-close-btn'
          }
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      )}

      <DialogContent
        className="modal-content-ctn"
        onClick={hideCloseIcon ? handleClose : undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;