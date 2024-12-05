import { UA, debug } from 'jssip';
import _ from 'lodash';

class CallsFlowControl {
  constructor() {
    this.onUserAgentAction = () => {};
    this.onCallActionConnection = () => {};
    this.engineEvent = () => {};
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
  }

  notify = (message) => {
    this.onCallActionConnection('notify', message);
  };

  tmpEvent = () => {
    console.log('Active Call:', this.activeCall);
    console.log('Calls Queue:', this.callsQueue);
    console.log('Hold Calls Queue:', this.holdCallsQueue);
  };

  setMicMuted = () => {
    if (!this.activeCall) return;

    if (this.micMuted) {
      this.activeCall.unmute();
      this.micMuted = false;
      this.onCallActionConnection('unmute', this.activeCall.id);
    } else {
      this.activeCall.mute();
      this.micMuted = true;
      this.onCallActionConnection('mute', this.activeCall.id);
    }
  };

  hold = (sessionId) => {
    if (this.activeCall?.id === sessionId) {
      this.activeCall.hold();
    }
  };

  unhold = (sessionId) => {
    if (!this.activeCall) {
      const toUnhold = _.find(this.holdCallsQueue, { id: sessionId });
      if (toUnhold) {
        toUnhold.unhold();
      }
    } else {
      console.warn('Please exit from all active calls to unhold');
    }
  };

  playRing = () => {
    if (this.ringer?.current) {
      this.ringer.current.currentTime = 0;
      this.ringer.current.play().catch(error => {
        console.warn('Error playing ring:', error);
      });
    }
  };

  stopRing = () => {
    if (this.ringer?.current) {
      this.ringer.current.currentTime = 0;
      this.ringer.current.pause();
    }
  };

  removeCallFromQueue = (callId) => {
    _.remove(this.callsQueue, (calls) => calls.id === callId);
  };

  addCallToHoldQueue = (callId) => {
    if (this.activeCall?.id === callId) {
      this.holdCallsQueue.push(this.activeCall);
    }
  };

  removeCallFromActiveCall = (callId) => {
    if (this.activeCall?.id === callId) {
      this.activeCall = null;
    }
  };

  removeCallFromHoldQueue = (callId) => {
    _.remove(this.holdCallsQueue, (calls) => calls.id === callId);
  };

  connectAudio = () => {
    if (!this.activeCall?.connection) return;

    this.activeCall.connection.addEventListener('addstream', (event) => {
      if (this.player?.current) {
        this.player.current.srcObject = event.stream;
      }
    });
  };

  sessionEvent = (type, data, cause, callId) => {
    switch (type) {
      case 'reinvite':
        this.onCallActionConnection('reinvite', callId, data);
        this.addCallToHoldQueue(callId);
        this.removeCallFromActiveCall(callId);
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

      case 'confirmed':
        if (!this.activeCall) {
          this.activeCall = _.find(this.callsQueue, { id: callId });
        }
        this.removeCallFromQueue(callId);
        this.onCallActionConnection('callAccepted', callId, this.activeCall);
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
        this.onCallActionConnection('callEnded', callId);
        this.removeCallFromQueue(callId);
        this.removeCallFromActiveCall(callId);
        if (this.callsQueue.length === 0) {
          this.stopRing();
        }
        break;

      default:
        break;
    }
  };

  handleNewRTCSession = (rtcPayload) => {
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

    defaultCallEventsToHandle.forEach((eventType) => {
      call.on(eventType, (data, cause) => {
        this.sessionEvent(eventType, data, cause, call.id);
      });
    });
  };

  init = () => {
    try {
      this.phone = new UA(this.config);
      this.phone.on('newRTCSession', this.handleNewRTCSession);

      const events = [
        'connected',
        'disconnected',
        'registered',
        'unregistered',
        'registrationFailed',
        'invite',
        'message',
        'connecting'
      ];

      events.forEach((event) => {
        this.phone.on(event, (e) => {
          this.engineEvent(event, e);
        });
      });

      this.initiated = true;
    } catch (error) {
      console.error('Error initializing phone:', error);
    }
  };

  call = (to) => {
    if (!this.connectedPhone) {
      this.notify('Please connect to VoIP Server in order to make calls');
      return;
    }

    if (this.activeCall) {
      this.notify('Already have an active call');
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

  answer = (sessionId) => {
    if (this.activeCall) {
      this.notify('Already have an active call');
      return;
    }

    if (this.activeChanel.inCall) {
      this.notify('Current channel is busy');
      return;
    }

    this.stopRing();
    this.activeCall = _.find(this.callsQueue, { id: sessionId });

    if (this.activeCall) {
      this.activeCall.customPayload = this.activeChanel.id;
      this.activeCall.answer({
        mediaConstraints: {
          audio: true
        }
      });
      this.connectAudio();
    }
  };

  hungup = (sessionId) => {
    try {
      if (this.phone?._sessions[sessionId]) {
        this.phone._sessions[sessionId].terminate();
      }
    } catch (error) {
      console.warn('Call already terminated:', error);
    }
  };

  start = () => {
    if (!this.initiated) {
      this.notify('Error: 356 Please report');
      return;
    }

    if (this.config.debug) {
      debug.enable('JsSIP:*');
    } else {
      debug.disable();
    }

    this.phone.start();
  };

  stop = () => {
    if (this.phone) {
      this.phone.stop();
    }
  };
}

export default CallsFlowControl;