import React, { useEffect, useState, useRef } from 'react';

import {
  Typography,
  Box,
  AppBar,
  Tabs,
  Tab,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { PhoneOutgoing as PhoneOutgoingIcon } from '@phosphor-icons/react/dist/ssr/PhoneOutgoing';
import { PhoneIncoming as PhoneIncomingIcon } from '@phosphor-icons/react/dist/ssr/PhoneIncoming';
import { PhoneX as PhoneXIcon } from '@phosphor-icons/react/dist/ssr/PhoneX';
import { DeviceMobile as DeviceMobileIcon } from '@phosphor-icons/react/dist/ssr/DeviceMobile';
import { ArrowsClockwise as ArrowsClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';
import { PauseCircle as PauseCircleIcon } from '@phosphor-icons/react/dist/ssr/PauseCircle';

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{typeof children === 'function' ? children() : children}</Box>}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

// Custom SwipeableViews component to replace the deprecated library
const MuiSwipeableViews = ({ 
  index, 
  onChangeIndex, 
  children, 
  // Unused parameters prefixed with underscore to satisfy linting
  _animateHeight = false,
  _resistance = true,
  style = {}
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const childCount = React.Children.count(children);
      if (childCount > 0 && index >= 0 && index < childCount) {
        const slideWidth = container.offsetWidth || 0;
        if (slideWidth === 0) return;
        
        container.scrollTo({
          left: slideWidth * index,
          behavior: 'smooth'
        });
      }
    }
  }, [index, children]);

  const handleScroll = (e) => {
    if (onChangeIndex && e?.currentTarget) {
      // Use requestAnimationFrame to avoid too many calls during scroll
      requestAnimationFrame(() => {
        const container = e.currentTarget;
        if (!container) return;

        const slideWidth = container.offsetWidth || 0;
        if (slideWidth === 0) return;

        const scrollPosition = container.scrollLeft || 0;
        const newIndex = Math.round(scrollPosition / slideWidth);
        
        // Only trigger change if the index actually changed and is valid
        if (newIndex !== index && newIndex >= 0 && newIndex < React.Children.count(children)) {
          onChangeIndex(newIndex);
        }
      });
    }
  };

  // Add a touch event handler to detect end of swipe
  const handleTouchEnd = () => {
    if (containerRef.current && onChangeIndex) {
      const container = containerRef.current;
      const slideWidth = container.offsetWidth || 0;
      if (slideWidth === 0) return;

      const scrollPosition = container.scrollLeft || 0;
      const newIndex = Math.round(scrollPosition / slideWidth);
      
      // Only trigger change if the index actually changed and is valid
      if (newIndex !== index && newIndex >= 0 && newIndex < React.Children.count(children)) {
        onChangeIndex(newIndex);
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        overflow: 'auto',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        ...style
      }}
      onScroll={handleScroll}
      onTouchEnd={handleTouchEnd}
    >
      {React.Children.map(children, (child, _i) => (
        <Box
          sx={{
            flexShrink: 0,
            width: '100%',
            scrollSnapAlign: 'start',
          }}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
};

const StyledTab = styled(Tab)(() => ({
  textTransform: 'none',
  minWidth: '25%',
  marginRight: 'auto',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),
  '&:hover': {
    color: '#3949ab',
    opacity: 1
  },
  '&:focus': {
    cursor: 'not-allowed'
  }
}));

// Removed unused TabPanelActive
/* const TabPanelActive = styled(Box)(({ theme }) => ({
  padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
  backgroundColor: '#d0f6bb'
})); */

const CallInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1]
}));

const StatusLabel = styled(Typography)({
  fontWeight: 500,
  marginBottom: '4px',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  opacity: 0.7
});

const StatusValue = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.95rem',
  marginBottom: '10px',
});

const CallInfoGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1)
}));

// We're using the styled components already defined above

function SwipeCaruselBlock({
  localStatePhone, activeChannel, setActiveChannel
}) {
  const [durations, setDurations] = useState(
    [{
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    },
    {
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    },
    {
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    }
    ]
  );
  const { displayCalls } = localStatePhone;
  const ONE_SECOND = 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      // Converting forEach to for...of loop for better performance and to fix lint issues
      for (const [key, displayCall] of displayCalls.entries()) {
        if (displayCall.inCall) {
          if (!displayCall.inAnswer && !durations[key].ringDurationActive) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                ringDuration: oldDurations[key].ringDuration + 1,
              }
            }));
          } else if (displayCall.inAnswer && !durations[key].callDurationActive) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                callDuration: oldDurations[key].callDuration + 1,
                ringDurationActive: false
              }
            }));
          }
        } else {
          if (durations[key].callDuration !== 0 || durations[key].ringDuration !== 0) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                callDuration: 0,
                callDurationActive: false,
                ringDuration: 0,
                ringDurationActive: false
              }
            }));
          }
        }
      }
    }, ONE_SECOND);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [displayCalls, durations]);

  const handleTabChangeIndex = (index) => {
    setActiveChannel(index);
  };
  const handleTabChange = (event, newValue) => {
    setActiveChannel(newValue);
  };

/*
  displayCalls.map((displayCall, key) => {
    // if Call just started then increment duration every one second
    if (displayCall.inCall === true) {
      if (displayCall.inAnswer === false && durations[key].ringDurationActive === false) {
        const intrs = setInterval(() => {
          setDurations((oldDurations) => ({
            ...oldDurations,
            [key]: {
              ...oldDurations[key],
              ringDuration: oldDurations[key].ringDuration + 1,
              ringDurationIntrId: intrs,
    if (displayCall.inCall === false) {
      if (durations[key].callDurationActive === true) {
        clearInterval(durations[key].callDurationIntrId);

        setDurations((oldDurations) => ({
          ...oldDurations,
          [key]: {
            ...oldDurations[key],
            callDuration: 0,
            callDurationIntrId: 0,
            callDurationActive: false,
            ringDuration: 0
          }
        }));
      }
      if (durations[key].ringDurationActive === true) {
        clearInterval(durations[key].ringDurationIntrId);

        setDurations((oldDurations) => ({
          ...oldDurations,
          [key]: {
            ...oldDurations[key],
            ringDuration: 0,
            ringDurationIntrId: 0,
            ringDurationActive: false
          }
        }));
      }
    }
    return true;
  });
*/

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={activeChannel}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <StyledTab label="Ch 1" {...a11yProps(0)} />
          <StyledTab label="Ch 2" {...a11yProps(1)} />
          <StyledTab label="Ch 3" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <MuiSwipeableViews
        index={activeChannel}
        onChangeIndex={handleTabChangeIndex}
      >
        {displayCalls.map((displayCall, key) => (
          <TabPanel
            key={`${displayCall.id}-TabPanel`}
            className={displayCall.hold ? 'tabPanelHold' : 'tabPanelActive'}
            value={activeChannel}
            index={key}
          >
            {() => {
              if (displayCall.inCall === true) {
                if (displayCall.inAnswer === true) {
                  if (displayCall.hold === true) {
                    return (
                       // Show hold Call info
                      <CallInfoCard elevation={1}>
                        <Chip 
                          icon={<PauseCircleIcon size={16} />}
                          label="On Hold"
                          size="small"
                          color="warning"
                          variant="filled"
                          sx={{ mb: 1.5 }}
                        />
                        
                        <CallInfoGrid container spacing={2}>
                          <Grid item xs={6}>
                            <StatusLabel>Status</StatusLabel>
                            <StatusValue>
                              {displayCall.callInfo}
                            </StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Direction</StatusLabel>
                            <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                              {displayCall.direction === 'outgoing' ? (
                                <>
                                  <PhoneOutgoingIcon size={16} style={{ marginRight: '4px', color: '#4caf50' }} />
                                  Outgoing
                                </>
                              ) : (
                                <>
                                  <PhoneIncomingIcon size={16} style={{ marginRight: '4px', color: '#2196f3' }} />
                                  Incoming
                                </>
                              )}
                            </StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Ring Duration</StatusLabel>
                            <StatusValue>{`${Math.floor(durations[key].ringDuration / 60).toString().padStart(2, '0')}:${(durations[key].ringDuration % 60).toString().padStart(2, '0')}`}</StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Call Duration</StatusLabel>
                            <StatusValue>{`${Math.floor(durations[key].callDuration / 60).toString().padStart(2, '0')}:${(durations[key].callDuration % 60).toString().padStart(2, '0')}`}</StatusValue>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <StatusLabel>Number</StatusLabel>
                            <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon size={16} style={{ marginRight: '8px' }} />
                              {displayCall.callNumber}
                            </StatusValue>
                          </Grid>
                        </CallInfoGrid>
                      </CallInfoCard>
                    );
                  }
                  if (displayCall.inTransfer === true) {
                    return (
                       // Show In Transfer info
                      <CallInfoCard elevation={1}>
                        <Chip 
                          icon={<ArrowsClockwiseIcon size={16} />}
                          label="In Transfer"
                          size="small"
                          color="info"
                          variant="filled"
                          sx={{ mb: 1.5 }}
                        />
                        
                        <CallInfoGrid container spacing={2}>
                          <Grid item xs={6}>
                            <StatusLabel>Status</StatusLabel>
                            <StatusValue>
                              {displayCall.callInfo}
                            </StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Direction</StatusLabel>
                            <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                              {displayCall.direction === 'outgoing' ? (
                                <>
                                  <PhoneOutgoingIcon size={16} style={{ marginRight: '4px', color: '#4caf50' }} />
                                  Outgoing
                                </>
                              ) : (
                                <>
                                  <PhoneIncomingIcon size={16} style={{ marginRight: '4px', color: '#2196f3' }} />
                                  Incoming
                                </>
                              )}
                            </StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Ring Duration</StatusLabel>
                            <StatusValue>{`${Math.floor(durations[key].ringDuration / 60).toString().padStart(2, '0')}:${(durations[key].ringDuration % 60).toString().padStart(2, '0')}`}</StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Call Duration</StatusLabel>
                            <StatusValue>{`${Math.floor(durations[key].callDuration / 60).toString().padStart(2, '0')}:${(durations[key].callDuration % 60).toString().padStart(2, '0')}`}</StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Number</StatusLabel>
                            <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon size={16} style={{ marginRight: '4px' }} />
                              {displayCall.callNumber}
                            </StatusValue>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <StatusLabel>Transfer To</StatusLabel>
                            <StatusValue sx={{ color: 'primary.main' }}>
                              {displayCall.transferNumber}
                            </StatusValue>
                          </Grid>
                          
                          {displayCall.attendedTransferOnline.length > 1 && !displayCall.inConference && (
                            <Grid item xs={12}>
                              <StatusLabel>Talking With</StatusLabel>
                              <StatusValue sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {displayCall.attendedTransferOnline}
                              </StatusValue>
                            </Grid>
                          )}
                        </CallInfoGrid>
                      </CallInfoCard>
                    );
                  }

                  return (
                    // Show In Call info
                    <CallInfoCard elevation={1}>
                      <Chip 
                        icon={<PhoneIcon size={16} />}
                        label="Active Call"
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ mb: 1.5 }}
                      />
                      
                      <CallInfoGrid container spacing={2}>
                        <Grid item xs={6}>
                          <StatusLabel>Status</StatusLabel>
                          <StatusValue>
                            {displayCall.callInfo}
                          </StatusValue>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <StatusLabel>Direction</StatusLabel>
                          <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                            {displayCall.direction === 'outgoing' ? (
                              <>
                                <PhoneOutgoingIcon size={16} style={{ marginRight: '4px', color: '#4caf50' }} />
                                Outgoing
                              </>
                            ) : (
                              <>
                                <PhoneIncomingIcon size={16} style={{ marginRight: '4px', color: '#2196f3' }} />
                                Incoming
                              </>
                            )}
                          </StatusValue>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <StatusLabel>Ring Duration</StatusLabel>
                          <StatusValue>{`${Math.floor(durations[key].ringDuration / 60).toString().padStart(2, '0')}:${(durations[key].ringDuration % 60).toString().padStart(2, '0')}`}</StatusValue>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <StatusLabel>Call Duration</StatusLabel>
                          <StatusValue sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {`${Math.floor(durations[key].callDuration / 60).toString().padStart(2, '0')}:${(durations[key].callDuration % 60).toString().padStart(2, '0')}`}
                          </StatusValue>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <StatusLabel>Number</StatusLabel>
                          <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon size={16} style={{ marginRight: '8px' }} />
                            {displayCall.callNumber}
                          </StatusValue>
                        </Grid>
                      </CallInfoGrid>
                    </CallInfoCard>
                  );
                }

                return (
                  // Show Calling/Ringing info
                  <CallInfoCard elevation={1}>
                    <Chip 
                      icon={<PhoneXIcon size={16} />}
                      label="Ringing"
                      size="small"
                      color="warning"
                      variant="filled"
                      sx={{ mb: 1.5 }}
                    />
                    
                    <CallInfoGrid container spacing={2}>
                      <Grid item xs={6}>
                        <StatusLabel>Status</StatusLabel>
                        <StatusValue>
                          {displayCall.callInfo}
                        </StatusValue>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <StatusLabel>Direction</StatusLabel>
                        <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                          {displayCall.direction === 'outgoing' ? (
                            <>
                              <PhoneOutgoingIcon size={16} style={{ marginRight: '4px', color: '#4caf50' }} />
                              Outgoing
                            </>
                          ) : (
                            <>
                              <PhoneIncomingIcon size={16} style={{ marginRight: '4px', color: '#2196f3' }} />
                              Incoming
                            </>
                          )}
                        </StatusValue>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <StatusLabel>Ring Duration</StatusLabel>
                        <StatusValue sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                          {`${Math.floor(durations[key].ringDuration / 60).toString().padStart(2, '0')}:${(durations[key].ringDuration % 60).toString().padStart(2, '0')}`}
                        </StatusValue>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <StatusLabel>Number</StatusLabel>
                        <StatusValue sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon size={16} style={{ marginRight: '8px' }} />
                          {displayCall.callNumber}
                        </StatusValue>
                      </Grid>
                    </CallInfoGrid>
                  </CallInfoCard>
                );
              }

              return (
                // Show Ready info
                <CallInfoCard >
                  <Chip 
                    icon={<DeviceMobileIcon size={16} />}
                    label="Ready"
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ mb: 1.5 }}
                  />
                  
                  <CallInfoGrid container spacing={2}>
                    <Grid item xs={12}>
                      <StatusLabel>Status</StatusLabel>
                      <StatusValue color="primary"                      >
                        {displayCall.callInfo} {displayCall.info}
                      </StatusValue>
                    </Grid>
                  </CallInfoGrid>
                </CallInfoCard>
              );
            }}

          </TabPanel>
        ))}

      </MuiSwipeableViews>
    </div>
  );
}

export default SwipeCaruselBlock;
