import { UA, debug } from 'jssip';
import _ from 'lodash';
import { debugLog, debugError, debugWarn } from './constants';

function CallsFlowControl() {
  this.onUserAgentAction = () => {};

  this.notify = (message) => {
    this.onCallActionConnection('notify', message);
  };
  this.tmpEvent = () => {
    console.log(this.activeCall);
    console.log(this.callsQueue);
    console.log(this.holdCallsQueue);
  };
  this.onCallActionConnection = () => {};
  this.engineEvent = () => {};
  this.setMicMuted = () => {
    if (this.micMuted && this.activeCall) {
      this.activeCall.unmute();
      this.micMuted = false;
      this.onCallActionConnection('unmute', this.activeCall.id);
    } else if (!this.micMuted && this.activeCall) {
      this.micMuted = true;
      this.activeCall.mute();
      this.onCallActionConnection('mute', this.activeCall.id);
    }
  };
  this.hold = (sessionId) => {
    // If there is an active call with id that is requested then fire hold
    if (this.activeCall.id === sessionId) {
      this.activeCall.hold();
    }
  };
  this.unhold = (sessionId) => {
    // If we dont have active call then unhold the the call with requested id
    if (!this.activeCall) {
      // Find the Requested call in hold calls array
      const toUnhold = _.find(this.holdCallsQueue, { id: sessionId });
      // If we found the call in hold calls array the fire unhold function
      if (toUnhold) {
        toUnhold.unhold();
      }
    } else {
      debugLog('Please exit from all active calls to unhold');
      this.notify('Please exit from all active calls to unhold');

    }
  };
  this.micMuted = false;
  this.activeCall = null;
  this.activeChanel = null;
  this.callsQueue = [];
  this.holdCallsQueue = [];
  this.player = {};
  this.ringer = null;
  this.connectedPhone = null;
  this.config = {};
  this.initiated = false;
  this.playRing = () => {
    if (this.ringer && this.ringer.current) {
      try {
        this.ringer.current.currentTime = 0;
        this.ringer.current.play().catch((err) => console.error('Ringtone play error:', err));
      } catch (err) {
        console.error('Failed to play ringtone:', err);
      }
    }
  };
  this.stopRing = () => {
    this.ringer.current.currentTime = 0;
    this.ringer.current.pause();
  };

  this.startRingback = () => {
    if (this.ringbackTone) {
      try {
        this.ringbackTone.currentTime = 0; // Reset to the start
        this.ringbackTone.play().catch((err) => console.error('Ringback tone play error:', err));
      } catch (e) {
        console.error('Failed to play ringback tone:', e);
      }
    }
  };

  this.stopRingback = () => {
    if (this.ringbackTone) {
      try {
        this.ringbackTone.pause();
        this.ringbackTone.currentTime = 0; // Reset to the start for future calls
      } catch (e) {
        console.error('Failed to stop ringback tone:', e);
      }
    }
  };

  this.removeCallFromQueue = (callId) => {
    _.remove(this.callsQueue, (calls) => calls.id === callId);
  };
  this.addCallToHoldQueue = (callId) => {
    if (this.activeCall.id === callId) {
      this.holdCallsQueue.push(this.activeCall);
    }
  };
  this.removeCallFromActiveCall = (callId) => {
    if (this.activeCall && callId === this.activeCall.id) {
      this.activeCall = null;
    }
  };
  this.removeCallFromHoldQueue = (callId) => {
    _.remove(this.holdCallsQueue, (calls) => calls.id === callId);
  };
  this.connectAudio = () => {
    this.activeCall.connection.addEventListener('addstream', (event) => {
      this.player.current.srcObject = event.stream;
    });
  };

  this.sessionEvent = (type, data, cause, callId) => {
    // console.log(`Session: ${type}`);
    // console.log('Data: ', data);
    // console.log('callid: ', callId);

    switch (type) {
      case 'terminated':
        //  this.endCall(data, cause);
        break;
      case 'progress':
        if (data.originator === 'remote') {
          // Play ringback tone for outgoing calls only
          if (data.response.status_code === 180) {
            this.startRingback();
          }
          if (data.response.status_code === 183) {
            this.stopRingback();
          }
        } else {
          // Do nothing for incoming calls
          console.log('Progress event for incoming call, ignoring...');
        }
        break;
      case 'accepted':
        // this.startCall(data);
        break;
      case 'reinvite':
        this.onCallActionConnection('reinvite', callId, data);
        break;
      case 'hold':
        this.onCallActionConnection('hold', callId);
        this.addCallToHoldQueue(callId);
        this.removeCallFromActiveCall(callId);
        break;
      case 'unhold':
        this.onCallActionConnection('unhold', callId);
        this.activeCall = _.find(this.holdCallsQueue, { id: callId });
        this.removeCallFromHoldQueue(callId);
        break;
      case 'dtmf':
        break;
      case 'muted':
        this.onCallActionConnection('muted', callId);
        break;
      case 'unmuted':
        break;
      case 'confirmed':
        this.stopRingback();
        if (!this.activeCall) {
          this.activeCall = _.find(this.callsQueue, { id: callId });
        }
        this.removeCallFromQueue(callId);
        this.onCallActionConnection('callAccepted', callId, this.activeCall);
        break;
      case 'connecting':
        break;
      case 'ended':
        this.onCallActionConnection('callEnded', callId);
        this.removeCallFromQueue(callId);
        this.removeCallFromActiveCall(callId);
        this.removeCallFromHoldQueue(callId);
        if (this.callsQueue.length === 0) {
          this.stopRing();
        }
        break;
      case 'failed':
        this.stopRingback();
        this.onCallActionConnection('callEnded', callId);
        this.removeCallFromQueue(callId);
        this.removeCallFromActiveCall(callId);
        if (this.callsQueue.length === 0) {
          this.stopRing();
        }
        break;
      default:
        // console.warn(`Unhandled event: ${type}`, { data, cause, callId });
        break;
    }
  };

  this.handleNewRTCSession = (rtcPayload) => {
    const { session: call } = rtcPayload;
    if (call.direction === 'incoming') {
      this.callsQueue.push(call);
      this.onCallActionConnection('incomingCall', call);
      if (!this.activeCall) {
        this.playRing();
      }
    } else {
      this.activeCall = call;
      this.onCallActionConnection('outgoingCall', call);
      this.connectAudio();
    }
    const defaultCallEventsToHandle = [
      'peerconnection',
      'connecting',
      'sending',
      'progress',
      'accepted',
      'newDTMF',
      'newInfo',
      'hold',
      'unhold',
      'muted',
      'unmuted',
      'reinvite',
      'update',
      'refer',
      'replaces',
      'sdp',
      'icecandidate',
      'getusermediafailed',
      'ended',
      'failed',
      'connecting',
      'confirmed'
    ];
    _.forEach(defaultCallEventsToHandle, (eventType) => {
      call.on(eventType, (data, cause) => {
        this.sessionEvent(eventType, data, cause, call.id);
      });
    });
  };

  this.validateConfig = () => {
    if (!this.config.domain) {
      console.warn('Config error: Missing domain');
    }
  };
  this.init = () => {
    try {
      this.validateConfig();
      this.phone = new UA(this.config);
      this.phone.on('newRTCSession', this.handleNewRTCSession.bind(this));
      const binds = [
        'connected',
        'disconnected',
        'registered',
        'unregistered',
        'registrationFailed',
        'invite',
        'message',
        'connecting'
      ];
      _.forEach(binds, (value) => {
        this.phone.on(value, (e) => {
          this.engineEvent(value, e);
        });
      });
      this.initiated = true;
    } catch (e) {
      console.log(e);
    }
  };

  this.call = (to) => {
    if (!this.connectedPhone) {
      this.notify('Please connect to VoIP server first');
      console.log('User agent not registered yet');
      return;
    }
    if (this.activeCall) {
      this.notify('Active call already exists');
      console.log('Already has active call');
      return;
    }
    this.phone.call(`sip:${to}@${this.config.domain}`, {
      extraHeaders: ['First: first', 'Second: second'],
      RTCConstraints: {
        optional: [{ DtlsSrtpKeyAgreement: 'true' }]
      },
      mediaConstraints: {
        audio: true
      },
      sessionTimersExpires: 600
    });
  };

  this.answer = (sessionId) => {
    if (this.activeCall) {
      console.log('Already has active call');
      return;
    }
    try {
      this.stopRing();
      this.activeCall = _.find(this.callsQueue, { id: sessionId });
      if (this.activeCall) {
        this.activeCall.customPayload = this.activeChanel.id;
        this.activeCall.answer({
          mediaConstraints: { audio: true },
        });
        this.connectAudio();
      }
    } catch (err) {
      console.error('Error answering call:', err);
      this.notify('Error answering call');
    }
  };

  this.hungup = (e) => {
    try {
      this.phone._sessions[e].terminate();
    } catch (s) {
      console.log(s);
      console.log('Call already terminated');
    }
  };

  this.start = () => {
    if (!this.initiated) {
      this.notify('Please initialize phone before connecting');
      console.log('Please call .init() before connect');
      return;
    }

    if (this.config.debug) {
      debug.enable('JsSIP:*');
    } else {
      debug.disable();
    }
    this.phone.start();
  };

  this.stop = () => {
    this.phone.stop();
  };
}

export default CallsFlowControl;
