import React, { createRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Divider,
  Drawer,
  IconButton,
  TextField,
  Snackbar
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Call as CallIcon
} from '@mui/icons-material';
import MuiAlert from '@mui/lab/Alert';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Page from './phoneBlocks/Page';
import KeypadBlock from './phoneBlocks/KeypadBlock';
import SwipeCaruselBlock from './phoneBlocks/SwipeCaruselBlock';
import SwipeCaruselBodyBlock from './phoneBlocks/SwipeCaruselBodyBlock';
import StatusBlock from './phoneBlocks/StatusBlock';
import CallQueue from './phoneBlocks/CallQueue';
import CallsFlowControl from './CallsFlowControl';

const flowRoute = new CallsFlowControl();
const player = createRef();
const ringer = createRef();

const SoftPhoneRoot = styled('div')({
  paddingTop: 24,
  paddingBottom: 24,
  position: 'relative'
});

const PhoneButton = styled(IconButton)({
  color: 'white',
  backgroundColor: '#3949ab',
  position: 'fixed',
  right: '27px',
  bottom: '27px',
  '&:hover': {
    backgroundColor: '#94a3fc'
  },
  zIndex: 1200
});

const StyledDrawer = styled(Drawer)({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    position: 'fixed',
    height: '100%',
    overflowY: 'auto'
  }
});

const DrawerHeader = styled('div')({
  marginTop: 64,
  minHeight: 30,
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  justifyContent: 'flex-start',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
});

const PhoneContainer = styled('div')({
  padding: '27px'
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    textAlign: 'right'
  },
  '& .MuiInputBase-root': {
    fontSize: '1.2rem'
  },
  marginBottom: '16px'
});

const StyledSnackbar = styled(Snackbar)({
  '& .MuiAlert-filledWarning': {
    backgroundColor: '#ff9800'
  }
});

const AudioElement = styled('audio')({
  display: 'none'
});

const DividerStyled = styled(Divider)({
  margin: '8px 0'
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SoftPhone({
  callVolume,
  ringVolume,
  setConnectOnStartToLocalStorage,
  setNotifications,
  setCallVolume,
  setRingVolume,
  notifications = true,
  connectOnStart = true,
  config,
  timelocale = 'UTC',
  asteriskAccounts = []
}) {
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
    phoneConnectOnStart: connectOnStart,
    notifications,
    phoneCalls: [],
    connectedPhone: false,
    connectingPhone: false,
    activeCalls: [],
    callVolume,
    ringVolume
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialState, setDialState] = useState('');
  const [activeChannel, setActiveChannel] = useState(0);
  const [localStatePhone, setLocalStatePhone] = useState(defaultSoftPhoneState);
  const [notificationState, setNotificationState] = useState({ open: false, message: '' });
  const [calls, setCalls] = useState([]);

  const notify = (message) => {
    setNotificationState((prev) => ({ ...prev, open: true, message }));
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotificationState((prev) => ({ ...prev, open: false }));
  };

  // Setup flow route handlers
  flowRoute.activeChanel = localStatePhone.displayCalls[activeChannel];
  flowRoute.connectedPhone = localStatePhone.connectedPhone;

  flowRoute.engineEvent = (event, payload) => {
    switch (event) {
      case 'connected':
        setLocalStatePhone((prev) => ({
          ...prev,
          connectingPhone: false,
          connectedPhone: true
        }));
        break;
      case 'disconnected':
        setLocalStatePhone((prev) => ({
          ...prev,
          connectingPhone: false,
          connectedPhone: false
        }));
        break;
      default:
        break;
    }
  };

  flowRoute.onCallActionConnection = (type, payload, data) => {
    switch (type) {
      case 'reinvite':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => 
            a.sessionId === payload ? {
              ...a,
              allowAttendedTransfer: true,
              allowTransfer: true,
              inAnswerTransfer: true,
              inTransfer: true,
              attendedTransferOnline: data.request.headers['P-Asserted-Identity'][0].raw.split(' ')[0]
            } : a
          )
        }));
        break;

      case 'incomingCall':
        setLocalStatePhone((prev) => ({
          ...prev,
          phoneCalls: [
            ...prev.phoneCalls,
            {
              callNumber: payload.remote_identity.display_name || payload.remote_identity.uri.user,
              sessionId: payload.id,
              ring: false,
              duration: 0,
              direction: payload.direction
            }
          ]
        }));

        if (document.visibilityState !== 'visible' && localStatePhone.notifications) {
          new Notification('Incoming Call', {
            icon: 'https://voip.robofx.com/static/images/call-icon-telefono.png',
            body: `Caller: ${payload.remote_identity.display_name || payload.remote_identity.uri.user}`
          }).onclick = function() {
            window.parent.focus();
            window.focus();
            this.close();
          };
        }
        break;

      case 'outgoingCall':
        const newProgressState = _.cloneDeep(localStatePhone);
        newProgressState.displayCalls[activeChannel] = {
          ...localStatePhone.displayCalls[activeChannel],
          inCall: true,
          hold: false,
          inAnswer: false,
          direction: payload.direction,
          sessionId: payload.id,
          callNumber: payload.remote_identity.uri.user,
          callInfo: 'In out call'
        };

        setLocalStatePhone(newProgressState);
        setDialState('');
        break;

      case 'callEnded':
        setLocalStatePhone((prev) => ({
          ...prev,
          phoneCalls: localStatePhone.phoneCalls.filter((item) => item.sessionId !== payload),
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload ? {
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
            } : a
          )
        }));

        const missedCall = localStatePhone.phoneCalls.find(
          (item) => item.sessionId === payload && item.direction === 'incoming'
        );
        const endedCall = localStatePhone.displayCalls.find(
          (item) => item.sessionId === payload
        );

        if (missedCall || endedCall) {
          setCalls((prev) => [{
            status: endedCall?.inAnswer ? 'answered' : 'missed',
            sessionId: (missedCall || endedCall).sessionId,
            direction: (missedCall || endedCall).direction,
            number: (missedCall || endedCall).callNumber,
            time: new Date()
          }, ...prev]);
        }
        break;

      case 'callAccepted':
        const displayCallId = data?.customPayload;
        const acceptedCall = localStatePhone.phoneCalls.find(
          (item) => item.sessionId === payload
        ) || localStatePhone.displayCalls.find(
          (item) => item.sessionId === payload
        );

        if (acceptedCall) {
          const callDisplayId = displayCallId || acceptedCall.id;
          setLocalStatePhone((prev) => ({
            ...prev,
            phoneCalls: prev.phoneCalls.filter((item) => item.sessionId !== payload),
            displayCalls: _.map(prev.displayCalls, (a) =>
              a.id === callDisplayId ? {
                ...a,
                callNumber: acceptedCall.callNumber,
                sessionId: payload,
                duration: 0,
                direction: acceptedCall.direction,
                inCall: true,
                inAnswer: true,
                hold: false,
                callInfo: 'In call'
              } : a
            )
          }));
        }
        break;

      case 'hold':
      case 'unhold':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: _.map(prev.displayCalls, (a) =>
            a.sessionId === payload ? {
              ...a,
              hold: type === 'hold'
            } : a
          )
        }));
        break;

      case 'mute':
      case 'unmute':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: _.map(prev.displayCalls, (a) =>
            a.sessionId === payload ? {
              ...a,
              muted: type === 'mute' ? 1 : 0
            } : a
          )
        }));
        break;

      case 'notify':
        notify(payload);
        break;

      default:
        break;
    }
  };

  const handleSettingsSlider = (name, newValue) => {
    const volume = parseInt(newValue, 10) / 100;
    
    if (name === 'ringVolume' && ringer.current) {
      ringer.current.volume = volume;
      setRingVolume(newValue);
    } else if (name === 'callVolume' && player.current) {
      player.current.volume = volume;
      setCallVolume(newValue);
    }
  };

  const handleConnectPhone = (event, connectionStatus) => {
    try {
      event?.persist();
    } catch (e) {
      // Ignore
    }

    setLocalStatePhone((prev) => ({
      ...prev,
      connectingPhone: true
    }));

    if (connectionStatus) {
      flowRoute.start();
    } else {
      flowRoute.stop();
    }

    return true;
  };

  const handleDialStateChange = (event) => {
    event.persist();
    setDialState(event.target.value);
  };

  const handleConnectOnStart = (event, newValue) => {
    event.persist();
    setLocalStatePhone((prev) => ({
      ...prev,
      phoneConnectOnStart: newValue
    }));
    setConnectOnStartToLocalStorage(newValue);
  };

  const handleNotifications = (event, newValue) => {
    event.persist();
    setLocalStatePhone((prev) => ({
      ...prev,
      notifications: newValue
    }));
    setNotifications(newValue);
  };

  const handlePressKey = (event) => {
    event.persist();
    setDialState((prev) => prev + event.currentTarget.value);
  };

  const handleCall = (event) => {
    event.persist();
    if (dialState.match(/^[0-9]+$/)) {
      flowRoute.call(dialState);
    }
  };

  const handleEndCall = (event) => {
    event.persist();
    flowRoute.hungup(localStatePhone.displayCalls[activeChannel].sessionId);
  };

  const handleHold = (sessionId, hold) => {
    if (!hold) {
      flowRoute.hold(sessionId);
    } else {
      flowRoute.unhold(sessionId);
    }
  };

  const handleAnswer = (event) => {
    flowRoute.answer(event.currentTarget.value);
  };

  const handleReject = (event) => {
    flowRoute.hungup(event.currentTarget.value);
  };

  const handleMicMute = () => {
    flowRoute.setMicMuted();
  };

  const handleCallTransfer = (transferedNumber) => {
    if (!dialState && !transferedNumber) return;

    setLocalStatePhone((prev) => ({
      ...prev,
      displayCalls: prev.displayCalls.map((a) =>
        a.id === activeChannel ? {
          ...a,
          transferNumber: dialState || transferedNumber,
          inTransfer: true,
          allowAttendedTransfer: false,
          allowFinishTransfer: false,
          allowTransfer: false,
          callInfo: 'Transfering...'
        } : a
      )
    }));

    flowRoute.activeCall.sendDTMF(`##${dialState || transferedNumber}`);
  };

  const handleCallAttendedTransfer = (event, number) => {
    switch (event) {
      case 'transfer':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: prev.displayCalls.map((a) =>
            a.id === activeChannel ? {
              ...a,
              transferNumber: dialState || number,
              allowAttendedTransfer: false,
              allowTransfer: false,
              transferControl: true,
              allowFinishTransfer: false,
              callInfo: 'Attended Transferring...',
              inTransfer: true
            } : a
          )
        }));
        flowRoute.activeCall.sendDTMF(`*2${dialState || number}`);
        break;

      case 'merge':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: prev.displayCalls.map((a) =>
            a.id === activeChannel ? {
              ...a,
              callInfo: 'Conference',
              inConference: true
            } : a
          )
        }));
        flowRoute.activeCall.sendDTMF('*5');
        break;

      case 'swap':
        flowRoute.activeCall.sendDTMF('*6');
        break;

      case 'finish':
        flowRoute.activeCall.sendDTMF('*4');
        break;

      case 'cancel':
        setLocalStatePhone((prev) => ({
          ...prev,
          displayCalls: prev.displayCalls.map((a) =>
            a.id === activeChannel ? {
              ...a,
              transferNumber: dialState,
              allowAttendedTransfer: true,
              allowTransfer: true,
              allowFinishTransfer: false,
              transferControl: false,
              inAnswerTransfer: false,
              callInfo: 'In Call',
              inTransfer: false
            } : a
          )
        }));
        flowRoute.activeCall.sendDTMF('*3');
        break;
    }
  };

  const dialNumberOnEnter = (event) => {
    if (event.key === 'Enter') {
      handleCall(event);
    }
  };

  useEffect(() => {
    // Request notification permissions
    Notification.requestPermission();

    // Initialize flow route
    flowRoute.config = config;
    flowRoute.init();

    if (localStatePhone.phoneConnectOnStart) {
      handleConnectPhone(null, true);
    }

    // Setup audio elements
    try {
      if (player.current) {
        player.current.defaultMuted = false;
        player.current.autoplay = true;
        player.current.volume = parseInt(localStatePhone.callVolume, 10) / 100;
        flowRoute.player = player;
      }

      if (ringer.current) {
        ringer.current.src = '/sound/ringing.mp3';
        ringer.current.loop = true;
        ringer.current.volume = parseInt(localStatePhone.ringVolume, 10) / 100;
        flowRoute.ringer = ringer;
      }
    } catch (error) {
      console.error('Error setting up audio elements:', error);
    }

    // Cleanup function
    return () => {
      if (flowRoute.connectedPhone) {
        flowRoute.stop();
      }
    };
  }, [config, localStatePhone.callVolume, localStatePhone.phoneConnectOnStart, localStatePhone.ringVolume]);

  return (
    <Page
      title="Phone"
    >
      <PhoneButton
        color="primary"
        aria-label="open phone"
        onClick={() => setDrawerOpen(true)}
      >
        <CallIcon />
      </PhoneButton>

      <StyledDrawer
        anchor="right"
        open={drawerOpen}
        variant="persistent"
      >
        <DrawerHeader>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronRightIcon />
          </IconButton>
        </DrawerHeader>

        <Snackbar 
          open={notificationState.open} 
          autoHideDuration={3000} 
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="warning">
            {notificationState.message}
          </Alert>
        </Snackbar>

        <Divider />

        <CallQueue
          calls={localStatePhone.phoneCalls}
          handleAnswer={handleAnswer}
          handleReject={handleReject}
        />

        <SwipeCaruselBlock
          setLocalStatePhone={setLocalStatePhone}
          setActiveChannel={setActiveChannel}
          activeChannel={activeChannel}
          localStatePhone={localStatePhone}
        />

        <PhoneContainer>
          <StyledTextField
            value={dialState}
            id="standard-basic"
            label="Number"
            fullWidth
            onKeyUp={dialNumberOnEnter}
            onChange={handleDialStateChange}
          />

          <KeypadBlock
            handleCallAttendedTransfer={handleCallAttendedTransfer}
            handleCallTransfer={handleCallTransfer}
            handleMicMute={handleMicMute}
            handleHold={handleHold}
            handleCall={handleCall}
            handleEndCall={handleEndCall}
            handlePressKey={handlePressKey}
            activeChanel={localStatePhone.displayCalls[activeChannel]}
            asteriskAccounts={asteriskAccounts}
            dialState={dialState}
            setDialState={setDialState}
          />
        </PhoneContainer>

        <Divider />

        <SwipeCaruselBodyBlock
          localStatePhone={localStatePhone}
          handleConnectPhone={handleConnectPhone}
          handleSettingsSlider={handleSettingsSlider}
          handleConnectOnStart={handleConnectOnStart}
          handleNotifications={handleNotifications}
          calls={calls}
          timelocale={timelocale}
          callVolume={callVolume}
        />

        <Divider />

        <StatusBlock
          connectedPhone={localStatePhone.connectedPhone}
          connectingPhone={localStatePhone.connectingPhone}
        />

        <Divider />
      </StyledDrawer>

      <audio preload="auto" ref={player} hidden />
      <audio preload="auto" ref={ringer} hidden />
    </Page>
  );
}

SoftPhone.propTypes = {
  callVolume: PropTypes.number,
  ringVolume: PropTypes.number,
  setConnectOnStartToLocalStorage: PropTypes.func.isRequired,
  setNotifications: PropTypes.func.isRequired,
  setCallVolume: PropTypes.func.isRequired,
  setRingVolume: PropTypes.func.isRequired,
  notifications: PropTypes.bool,
  connectOnStart: PropTypes.bool,
  config: PropTypes.shape({
    domain: PropTypes.string.isRequired,
    uri: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    ws_servers: PropTypes.string.isRequired,
    debug: PropTypes.bool
  }).isRequired,
  timelocale: PropTypes.string,
  asteriskAccounts: PropTypes.arrayOf(PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    online: PropTypes.string.isRequired
  }))
};

SoftPhone.defaultProps = {
  callVolume: 50,
  ringVolume: 50,
  notifications: true,
  connectOnStart: true,
  timelocale: 'UTC',
  asteriskAccounts: []
};

export default SoftPhone;