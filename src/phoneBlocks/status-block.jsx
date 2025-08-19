import { Typography, Box, Chip, CircularProgress } from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import {
  WifiTethering as OnlineIcon,
  WifiTetheringOff as OfflineIcon,
  Loop as ConnectingIcon
} from '@mui/icons-material';

const Root = styled('div')(({ theme: _theme }) => ({
  padding: _theme.spacing(1),
  backgroundColor: _theme.palette.background.paper,
  borderTop: `1px solid ${_theme.palette.divider}`
}));

const StatusContainer = styled(Box)(({ theme: _theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: _theme.spacing(1)
}));

const StatusRow = styled(Box)(({ theme: _theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
}));

const StatusLabel = styled(Typography)(({ theme: _theme }) => ({
  fontWeight: 500,
  color: _theme.palette.text.secondary,
  fontSize: '0.75rem'
}));

const OnlineChip = styled(Chip)(({ theme: _theme }) => ({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  fontWeight: 500,
  height: '24px',
  fontSize: '0.7rem',
  '& .MuiChip-icon': {
    color: '#2e7d32',
    fontSize: '0.9rem'
  }
}));

const OfflineChip = styled(Chip)(({ theme: _theme }) => ({
  backgroundColor: '#ffebee',
  color: '#c62828',
  fontWeight: 500,
  height: '24px',
  fontSize: '0.7rem',
  '& .MuiChip-icon': {
    color: '#c62828',
    fontSize: '0.9rem'
  }
}));

const ConnectingChip = styled(Chip)(({ theme: _theme }) => ({
  backgroundColor: '#e3f2fd',
  color: '#1565c0',
  fontWeight: 500,
  height: '24px',
  fontSize: '0.7rem',
  '& .MuiChip-icon': {
    color: '#1565c0',
    fontSize: '0.9rem'
  }
}));

function StatusBlock({ connectingPhone, connectedPhone }) {
  
  // Check if internet is available
  const [internetConnected, setInternetConnected] = React.useState(navigator.onLine);

  // Monitor internet connection status
  React.useEffect(() => {
    const handleOnline = () => setInternetConnected(true);
    const handleOffline = () => setInternetConnected(false);

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get the softphone connection status chip
  const getSoftphoneStatusChip = () => {
    // First check if internet is connected - if not, softphone must be offline too
    if (!internetConnected) {
      return <OfflineChip icon={<OfflineIcon fontSize="small" />} label="Offline" />;
    }
    
    // Only check actual softphone status if internet is available
    if (connectingPhone) {
      return connectedPhone 
        ? <OfflineChip icon={<CircularProgress size={12} />} label="Disconnecting" />
        : <ConnectingChip icon={<ConnectingIcon fontSize="small" />} label="Connecting" />;
    }
    
    return connectedPhone
      ? <OnlineChip icon={<OnlineIcon fontSize="small" />} label="Online" />
      : <OfflineChip icon={<OfflineIcon fontSize="small" />} label="Offline" />;
  };

  // Get the internet connection status chip
  const getInternetStatusChip = () => {
    return internetConnected
      ? <OnlineChip icon={<OnlineIcon fontSize="small" />} label="Online" />
      : <OfflineChip icon={<OfflineIcon fontSize="small" />} label="Offline" />;
  };

  return (
    <Root>
      <StatusContainer>
        <StatusRow>
          <StatusLabel variant="subtitle2">Internet</StatusLabel>
          {getInternetStatusChip()}
        </StatusRow>
        <StatusRow>
          <StatusLabel variant="subtitle2">Softphone Connection</StatusLabel>
          {getSoftphoneStatusChip()}
        </StatusRow>
      </StatusContainer>
    </Root>
  );
}

export default StatusBlock;
