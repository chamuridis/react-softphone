import React, { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Fab,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Typography,
  Box,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Phone as PhoneIcon,
  Close as CloseIcon,
  Call as CallIcon,
  CallEnd as CallEndIcon,
  ChevronRight as ChevronRightIcon,
  Clear as XIcon
} from '@mui/icons-material';
import _ from 'lodash';
import { WebSocketInterface } from 'jssip';
import KeypadBlock from './phoneBlocks/KeypadBlock';
import SwipeCaruselBlock from './phoneBlocks/swipe-carusel-block';
import SwipeCaruselBodyBlock from './phoneBlocks/SwipeCaruselBodyBlock';
import StatusBlock from './phoneBlocks/status-block';
import CallQueue from './phoneBlocks/call-queue';
import CallsFlowControl from './CallsFlowControl';
import { NOTIFICATION_DEFAULTS, debugLog, debugError, debugWarn } from './constants';

const flowRoute = new CallsFlowControl();

// Modern styled components with MUI v6 best practices
const PhoneRoot = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}));

const Results = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(3),
  flexGrow: 1,
  overflow: 'auto'
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: '320px',
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: '320px',
    boxSizing: 'border-box',
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius * 2 + 'px 0 0 ' + theme.shape.borderRadius * 2 + 'px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRight: 'none',
    overflow: 'hidden'
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  justifyContent: 'space-between',
  height: '48px'
}));

const PhoneTextFieldStyled = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2, 1, 1.5, 1),
  '& .MuiInputBase-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.background.paper 
      : theme.palette.grey[50],
    padding: theme.spacing(0.5, 1),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.action.hover 
        : theme.palette.grey[100],
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiInputBase-input': {
    fontSize: '1.25rem',
    letterSpacing: '0.05em',
    fontWeight: 500,
  }
}));

const Connected = styled('span')({
  color: 'green'
});

const Disconnected = styled('span')({
  color: 'red'
});

// Used for call buttons in the keypad
const _PhoneFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  margin: 'auto',
  width: '56px',
  height: '56px',
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem'
  }
}));

const TextForm = styled('div')({
  '& > *': {
    textAlign: 'right',
    width: '100%'
  },
  '.MuiInputBase-input': {
    textAlign: 'right'
  }
});

function SoftPhone({ 
  timelocale,
  setConnectOnStartToLocalStorage,
  connectOnStart,
  asteriskAccounts,
  setNotifications,
  notifications,
  setCallVolume,
  setRingVolume,
  softPhoneOpen,
  setSoftPhoneOpen,
  callVolume,
  ringVolume,
  config,
}) {
  const player = useRef(null);
  const ringer = useRef(null);

  const defaultSoftPhoneState = {
    displayCalls: [
      {
        id: 0,
        info: 'Ch 1',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inAnswer: false,
        inTransfer: false,
        callInfo: 'Ready',
        inAnswerTransfer: false,
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        inConference: false,
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: ''
      },
      {
        id: 1,
        info: 'Ch 2',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inAnswer: false,
        inAnswerTransfer: false,
        inConference: false,
        inTransfer: false,
        callInfo: 'Ready',
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: ''
      },
      {
        id: 2,
        info: 'Ch 3',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inConference: false,
        inAnswer: false,
        callInfo: 'Ready',
        inTransfer: false,
        inAnswerTransfer: false,
        Transfer: false,
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: ''
      }
    ],
    connectOnStart: connectOnStart,
    notifications,
    phoneCalls: [],
    connectedPhone: false,
    connectingPhone: false,
    activeCalls: [],
    callVolume: typeof callVolume === 'number' && !isNaN(callVolume) ? callVolume : 0.5,
    ringVolume: typeof ringVolume === 'number' && !isNaN(ringVolume) ? ringVolume : 0.5,
    userPresence: 'available', // New user presence state
    darkMode: false, // New dark mode state
  };
  const [drawerOpen, drawerSetOpen] = useState(softPhoneOpen);
  const [dialState, setDialState] = useState('');
  const [activeChannel, setActiveChannel] = useState(0);
  const [localStatePhone, setLocalStatePhone] = useState(defaultSoftPhoneState);
  const [notificationState, setNotificationState] = useState({ open: false, message: '' });
  const [calls, setCalls] = useState([]);
  
  // Keep drawerOpen in sync with softPhoneOpen prop
  useEffect(() => {
    drawerSetOpen(softPhoneOpen);
  }, [softPhoneOpen]);
  
  
  const notify = (message) => {
    // Safely update notification state
    if (message) {
      setNotificationState({ open: true, message });
    }
  };
  
  // Request permission only when user interacts with notifications setting
  const requestNotificationPermission = () => {
    Notification.requestPermission().then((permission) => {
      debugLog('Notification permission:', permission);
    });
  };
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setNotificationState((notification) => ({ ...notification, open: false }));
  };

  // Safety check to ensure flowRoute exists before setting properties
  if (flowRoute) {
    flowRoute.activeChanel = localStatePhone.displayCalls[activeChannel];
    flowRoute.connectedPhone = localStatePhone.connectedPhone;
    flowRoute.engineEvent = (event, payload) => {
    // Listen Here for Engine "UA jssip" events
    switch (event) {
      case 'connecting':
        break;
      case 'connected':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          connectingPhone: false,
          connectedPhone: true
        }));
        break;
      case 'registered':
        break;
      case 'disconnected':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          connectingPhone: false,
          connectedPhone: false
        }));
        break;
      case 'registrationFailed':
        break;

      default:
        break;
    }
  };

  // Not currently used but kept for potential future use
  const _getStatusDetails = (state) => {
    switch (state) {
      case 'connected':
        return { color: 'primary', label: 'Connected', icon: <PhoneIcon fontSize="small" /> };
      case 'registered':
        return { color: 'primary', label: 'Registered', icon: <PhoneIcon fontSize="small" /> };
      case 'disconnected':
        return { color: 'primary', label: 'Disconnected', icon: <CallEndIcon fontSize="small" /> };
      case 'connecting':
        return { color: 'primary', label: 'Connecting...', icon: <CloseIcon fontSize="small" /> };
      case 'new':
        return { color: 'primary', label: 'Ready', icon: <PhoneIcon fontSize="small" /> };
      default:
        return { color: 'primary', label: 'Offline', icon: <CloseIcon fontSize="small" /> };
    }
  };
  }

  if (flowRoute) {
    flowRoute.onCallActionConnection = async (type, payload, data) => {
    switch (type) {
      case 'reinvite':
        // looks like its Attended Transfer
        // Success transfer
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            allowAttendedTransfer: true,
            allowTransfer: true,
            inAnswerTransfer: true,
            inTransfer: true,
            attendedTransferOnline: data.request.headers['P-Asserted-Identity'][0].raw.split(' ')[0]

          } : a))
        }));

        break;
      case 'incomingCall':
        // looks like new call its incoming call
        // Save new object with the Phone data of new incoming call into the array with Phone data
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: [
            ...prevState.phoneCalls,
            {
              callNumber: (payload.remote_identity.display_name !== '') ? `${payload.remote_identity.display_name || ''}` : payload.remote_identity.uri.user,
              sessionId: payload.id,
              ring: false,
              duration: 0,
              direction: payload.direction
            }
          ]
        }));
        // Show notification for incoming calls
        debugLog('Incoming call received, preparing notification')
        
        // Check if the browser supports notifications
        if ('Notification' in globalThis) {
          // Check if permission is already granted
          if (Notification.permission === 'granted') {
            try {
              debugLog('Creating notification - permission already granted')
              const notification = new Notification(NOTIFICATION_DEFAULTS.TITLE, {
                icon: NOTIFICATION_DEFAULTS.ICON,
                body: `Caller: ${(payload.remote_identity.display_name !== '') ? `${payload.remote_identity.display_name || ''}` : payload.remote_identity.uri.user}`
              });
              
              // Use proper event listener instead of onclick property
              const handleNotificationClick = function() {
                globalThis.parent.focus();
                globalThis.focus(); // just in case, older browsers
                notification.close();
              };
              notification.addEventListener('click', handleNotificationClick);
              
              debugLog('Notification created successfully');
            } catch (error) {
              debugError('Error creating notification:', error);
            }
          } 
          // Check if permission is 'default' (not yet decided)
          else if (Notification.permission === 'default') {
            // Request permission
            debugLog('Requesting notification permission')
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                try {
                  debugLog('Creating notification after permission granted')
                  const notification = new Notification(NOTIFICATION_DEFAULTS.TITLE, {
                    icon: NOTIFICATION_DEFAULTS.ICON,
                    body: `Caller: ${(payload.remote_identity.display_name !== '') ? `${payload.remote_identity.display_name || ''}` : payload.remote_identity.uri.user}`
                  });
                  
                  // Use proper event listener instead of onclick property
                  const handleNotificationClick = function() {
                    globalThis.parent.focus();
                    globalThis.focus();
                    notification.close();
                  };
                  notification.addEventListener('click', handleNotificationClick);
                  
                  debugLog('Notification created successfully after permission');
                } catch (error) {
                  debugError('Error creating notification after permission:', error);
                }
              } else {
                debugLog('Notification permission denied');
              }
            });
          } else {
            debugLog('Notification permission was previously denied');
          }
        } else {
          debugLog('Browser does not support notifications');
        }

        break;
      case 'outgoingCall':
        // looks like new call its outgoing call
        // Create object with the Display data of new outgoing call

        const newProgressLocalStatePhone = _.cloneDeep(localStatePhone);
        newProgressLocalStatePhone.displayCalls[activeChannel] = {
          ...localStatePhone.displayCalls[activeChannel],
          inCall: true,
          hold: false,
          inAnswer: false,
          direction: payload.direction,
          sessionId: payload.id,
          callNumber: payload.remote_identity.uri.user,
          callInfo: 'Ringing'
        };
        // Save new object into the array with display calls

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newProgressLocalStatePhone.displayCalls
        }));
        setDialState('');

        break;
      case 'callEnded':
        // Call is ended, lets delete the call from calling queue
        // Call is ended, lets check and delete the call from  display calls list
        //        const ifExist= _.findIndex(localStatePhone.displayCalls,{sessionId:e.sessionId})
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: localStatePhone.phoneCalls.filter((item) => item.sessionId !== payload),
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            inCall: false,
            inAnswer: false,
            hold: false,
            muted: 0,
            inTransfer: false,
            inAnswerTransfer: false,
            allowFinishTransfer: false,
            allowTransfer: true,
            allowAttendedTransfer: true,
            inConference: false,
            callInfo: 'Ready'

          } : a))
        }));

        const firstCheck = localStatePhone.phoneCalls.filter((item) => item.sessionId === payload && item.direction === 'incoming');
        const secondCheck = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);
        if (firstCheck.length === 1) {
          setCalls((call) => [{
            status: 'missed',
            sessionId: firstCheck[0].sessionId,
            direction: firstCheck[0].direction,
            number: firstCheck[0].callNumber,
            time: new Date()
          }, ...call]);
        } else if (secondCheck.length === 1) {
          setCalls((call) => [{
            status: secondCheck[0].inAnswer ? 'answered' : 'missed',
            sessionId: secondCheck[0].sessionId,
            direction: secondCheck[0].direction,
            number: secondCheck[0].callNumber,
            time: new Date()
          }, ...call]);
        }
        break;
      case 'callAccepted':
        // Established conection
        // Set caller number for Display calls
        let displayCallId = data.customPayload;
        let acceptedCall = localStatePhone.phoneCalls.filter((item) => item.sessionId === payload);

        if (!acceptedCall[0]) {
          acceptedCall = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);
          displayCallId = acceptedCall[0].id;
        }

        // Call is Established
        // Lets make a copy of localStatePhone Object
        const newAcceptedLocalStatePhone = _.cloneDeep(localStatePhone);
        // Lets check and delete the call from  phone calls list
        const newAcceptedPhoneCalls = newAcceptedLocalStatePhone.phoneCalls.filter((item) => item.sessionId !== payload);
        // Save to the local state
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: newAcceptedPhoneCalls,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.id === displayCallId ? {
            ...a,
            callNumber: acceptedCall[0].callNumber,
            sessionId: payload,
            duration: 0,
            direction: acceptedCall[0].direction,
            inCall: true,
            inAnswer: true,
            hold: false,
            callInfo: 'Answered'
          } : a))
        }));

        break;
      case 'hold':

        // let holdCall = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            hold: true
          } : a))
        }));
        break;
      case 'unhold':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            hold: false
          } : a))
        }));
        break;
      case 'unmute':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            muted: 0
          } : a))
        }));
        break;
      case 'mute':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            muted: 1
          } : a))
        }));
        break;
      case 'notify':
        notify(payload);
        break;
      default:
        break;
    }
    };
  }

  const handleSettingsSlider = (name, newValue) => {
    // Ensure we have a valid number between 0 and 1
    const safeValue = typeof newValue === 'number' && !Number.isNaN(newValue) ? 
      Math.max(0, Math.min(1, newValue)) : 0;
    
    // Use safeValue for all operations
    setLocalStatePhone((prevState) => ({
      ...prevState,
      [name]: safeValue
    }));

    switch (name) {
      case 'ringVolume':
        if (ringer.current) {
          ringer.current.volume = safeValue;
        }
        if (flowRoute?.ringbackTone) {
          flowRoute.ringbackTone.volume = safeValue;
        }
        setRingVolume(safeValue);
        break;

      case 'callVolume':
        if (player.current) {
          player.current.volume = safeValue;
        }
        setCallVolume(safeValue);
        break;

      default:
        break;
    }
  };
  const handleConnectPhone = (event, connectionStatus) => {
    try {
      if (event) {
        event.persist();
      }
    } catch (e) {
      // Error handling without logging
    }
    setLocalStatePhone((prevState) => ({
      ...prevState,
      connectingPhone: true
    }));
    if (flowRoute) {
      if (connectionStatus === true) {
        flowRoute.start();
      } else {
        flowRoute.stop();
      }
    }



    return true;
  };
  const toggleDrawer = (openDrawer) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setSoftPhoneOpen(openDrawer);
    drawerSetOpen(openDrawer);
  };
  const handleDialStateChange = (event) => {
    event.persist();
    setDialState(event.target.value);
  };
  const handleConnectOnStart = (event,newValue) => {
    event.persist();
    setLocalStatePhone((prevState) => ({
      ...prevState,
      connectOnStart: newValue
    }));

    setConnectOnStartToLocalStorage(newValue);
  };
  const handleNotifications = (event, newValue) => {
    event.persist();
    setLocalStatePhone((prevState) => ({
      ...prevState,
      notifications: newValue
    }));

    setNotifications(newValue);
    if (newValue) {
      requestNotificationPermission();
    }
  };
  const handlePressKey = (event) => {
    event.persist();
    setDialState(dialState + event.currentTarget.value);
  };

  const handleCall = (event) => {
    event.persist();
    if (dialState.match(/^[0-9]+$/) != null && flowRoute) {
      flowRoute.call(dialState);
    }
  };

  const handleEndCall = (event) => {
    event.persist();
    if (flowRoute) {
      flowRoute.hungup(localStatePhone.displayCalls[activeChannel].sessionId);
    }
  };
  const handleHold = (sessionId, hold) => {
    if (!flowRoute) return;
    if (hold === false) {
      flowRoute.hold(sessionId);
    } else if (hold === true) {
      flowRoute.unhold(sessionId);
    }
  };
  const handleAnswer = (event) => {
    if (flowRoute) {
      flowRoute.answer(event.currentTarget.value);
    }
  };
  const handleReject = (event) => {
    if (flowRoute) {
      flowRoute.hungup(event.currentTarget.value);
    }
  };
  const handleMicMute = () => {
    if (flowRoute) {
      flowRoute.setMicMuted();
    }
  };

  const handleCallTransfer = (transferedNumber) => {
    if (!dialState && !transferedNumber) return;
    const newCallTransferDisplayCalls = _.map(
      localStatePhone.displayCalls, (a) => (a.id === activeChannel ? {
        ...a,
        transferNumber: dialState || transferedNumber,
        inTransfer: true,
        allowAttendedTransfer: false,
        allowFinishTransfer: false,
        allowTransfer: false,
        callInfo: 'Transferring...'
      } : a)
    );
    setLocalStatePhone((prevState) => ({
      ...prevState,
      displayCalls: newCallTransferDisplayCalls
    }));
    if (flowRoute?.activeCall) {
      flowRoute.activeCall.sendDTMF(`##${dialState || transferedNumber}`);
    }
  };

  const handleCallAttendedTransfer = (event, number) => {
    switch (event) {
      case 'transfer':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.id === activeChannel ? {
            ...a,
            transferNumber: dialState || number,
            allowAttendedTransfer: false,
            allowTransfer: false,
            transferControl: true,
            allowFinishTransfer: false,
            callInfo: 'Attended Transfer',
            inTransfer: true
          } : a))
        }));
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF(`*2${dialState || number}`);
        }
        break;
      case 'merge':
        const newCallMergeAttendedTransferDisplayCalls = _.map(
          localStatePhone.displayCalls,
          (a) => (a.sessionId === localStatePhone.displayCalls[activeChannel].sessionId ? {
            ...a,
            inTransfer: false,
            attendedTransferOnline: ''
          } : a)
        );
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newCallMergeAttendedTransferDisplayCalls
        }));

        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*5');
        }
        break;
      case 'swap':
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*6');
        }
        break;
      case 'finish':
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*4');
        }
        break;
      case 'cancel':
        const newCallCancelAttendedTransferDisplayCalls = _.map(
          localStatePhone.displayCalls,
          (a) => (a.sessionId === localStatePhone.displayCalls[activeChannel].sessionId ? {
            ...a,
            inTransfer: false,
            attendedTransferOnline: '',
            transferControl: false,
            allowTransfer: true,
            allowAttendedTransfer: true
          } : a)
        );
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newCallCancelAttendedTransferDisplayCalls
        }));
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*3');
        }
        break;
      default:
        break;
    }
  };
  const handleSettingsButton = () => {
    if (flowRoute) {
      flowRoute.tmpEvent();
    }
  };

  const handleDarkMode = (checked) => {
    setLocalStatePhone({
      ...localStatePhone,
      darkMode: checked
    });
  };

  const handleUserPresence = (status) => {
    setLocalStatePhone({
      ...localStatePhone,
      userPresence: status
    });
  };

  useEffect(() => {
    if (flowRoute) {
      flowRoute.config = {
        ...config,
        sockets: new WebSocketInterface(config.ws_servers)
      };
      flowRoute.init();
      if (localStatePhone.connectOnStart) {
        handleConnectPhone(null, true);
      }
    }

    try {
      player.current.defaultMuted = false;
      player.current.autoplay = true;
      
      // Set volume safely with validation
      const safeCallVolume = typeof localStatePhone.callVolume === 'number' && !Number.isNaN(localStatePhone.callVolume) ? 
        Math.max(0, Math.min(1, localStatePhone.callVolume)) : 0.5;
      player.current.volume = safeCallVolume;
      
      if (flowRoute) {
        flowRoute.player = player;
      }
      ringer.current.src = '/sound/ringing.ogg';
      ringer.current.loop = true;
      
      const safeRingVolume = localStatePhone.ringVolume ? 
        Math.max(0, Math.min(1, localStatePhone.ringVolume)) : 0.5;
      ringer.current.volume = safeRingVolume;
      
      if (flowRoute) {
        flowRoute.ringer = ringer;
        // Add a new element for the "beep beep" ringback tone
        const ringbackTone = new Audio('/sound/ringback.ogg');
        ringbackTone.loop = true;
        ringbackTone.volume = safeRingVolume;
        flowRoute.ringbackTone = ringbackTone; // Attach it to the flowRoute object
      }
      // Prevent media keys from controlling playback
      if ('mediaSession' in navigator) {
        // Override default media key behaviors
        navigator.mediaSession.setActionHandler('play', () => {
          // Prevent default play behavior for all media elements
          debugLog('Media play key blocked to prevent playing the ringer');

        });
      }
    } catch (e) {
      debugError('Media session error:', e);
    }
  }, []);
  const dialNumberOnEnter = (event) => {
    if (event.key === 'Enter') {
      handleCall(event);
    }
  };
  return (
    <Box

    >

      <DrawerStyled
        anchor="right"
        open={drawerOpen}
        variant="persistent"
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' // Prevent overall container from scrolling
        }}>
          {/* Header */}
          <DrawerHeader>
            <Typography variant="subtitle1" fontWeight={500}>Softphone</Typography>
            <IconButton 
              onClick={() => setSoftPhoneOpen(false)} 
              data-testid="hide-soft-phone-button" 
              size="large"
              sx={{ 
                m: 0.5, 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </DrawerHeader>

          <Snackbar open={notificationState.open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleClose} severity="warning">
              {notificationState.message}
            </Alert>
          </Snackbar>

          <Divider />
          
          {/* Main content - Scrollable area */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden' // Control overflow in the main content area
          }}>
            {/* Call Queue Block */}
            <CallQueue
              calls={localStatePhone.phoneCalls}
              handleAnswer={handleAnswer}
              handleReject={handleReject}
            />
            
            {/* Swipe Carusel */}
            <SwipeCaruselBlock
              setLocalStatePhone={setLocalStatePhone}
              setActiveChannel={setActiveChannel}
              activeChannel={activeChannel}
              localStatePhone={localStatePhone}
            />

            {/* Main Phone */}
            <Box 
              sx={{
                padding: theme => theme.spacing(2),
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.background.paper 
                  : theme.palette.background.paper,
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 6px rgba(0, 0, 0, 0.1)',
                mb: 2
              }}
            >
              {/* Dial number input with icon */}
              <PhoneTextFieldStyled
                value={dialState}
                id="phone-input"
                label="Phone Number"
                fullWidth
                onKeyUp={(event) => dialNumberOnEnter(event)}
                onChange={handleDialStateChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon size={20} weight="bold" color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: dialState && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => setDialState('')}
                        edge="end"
                        aria-label="clear number"
                      >
                        <XIcon size={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Dial Keypad with improved spacing */}
              <Box sx={{ mt: 2 }}>
                <KeypadBlock
                  handleCallAttendedTransfer={handleCallAttendedTransfer}
                  handleCallTransfer={handleCallTransfer}
                  handleMicMute={handleMicMute}
                  handleHold={handleHold}
                  handleCall={handleCall}
                  handleEndCall={handleEndCall}
                  handlePressKey={handlePressKey}
                  activeChanel={localStatePhone.displayCalls[activeChannel]}
                  handleSettingsButton={handleSettingsButton}
                  asteriskAccounts={asteriskAccounts}
                  dialState={dialState}
                  setDialState={setDialState}
                />
              </Box>
            </Box>

            
            {/* Swipe Carusel Body - Scrollable section */}
            <Box sx={{ 
              overflow: 'auto', 
            }}>
              <SwipeCaruselBodyBlock
                localStatePhone={localStatePhone}
                handleConnectPhone={handleConnectPhone}
                handleSettingsSlider={handleSettingsSlider}
                handleConnectOnStart={handleConnectOnStart}
                handleNotifications={handleNotifications}
                handleDarkMode={handleDarkMode}
                calls={calls}
                timelocale={timelocale}
                callVolume={callVolume}
              />
            </Box>
          </Box>

          <Divider />
          
          {/* Status Block - Fixed at bottom */}
          <Box sx={{ padding: 1 }}>
            <StatusBlock
              connectedPhone={localStatePhone.connectedPhone}
              connectingPhone={localStatePhone.connectingPhone}
              />
          </Box>
        </Box>
      </DrawerStyled>

      <div hidden>
        <audio preload="auto" ref={player} />
      </div>
      <div hidden>
        <audio preload="auto" ref={ringer} />
      </div>
    </Box>
  );
}


export default SoftPhone;
