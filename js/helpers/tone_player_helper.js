/** exported TonePlayerHelper */

/** globals Audio */

'use strict';

(function(exports) {
  var debug = Config.debug;
  var _audioElement = null;
  var _channel = null;

  var TONE_TIMEOUT = 5000;

  var DIAL_TONE = '../../resources/media/tones/dial.wav';
  var RINGBACK_TONE = '../../resources/media/tones/ringback.wav';
  var CONNECTED_TONE = '../../resources/media/tones/connected.wav';
  var BUSY_TONE = '../../resources/media/tones/busy.wav';
  var HOLD_TONE = '../../resources/media/tones/hold.mp3';
  var FAILED_TONE = '../../resources/media/tones/failed.wav';
  var ENDED_TONE = '../../resources/media/tones/ended.wav';

  var SOMEONE_JOINED_ROOM_TONE = '../../resources/media/tones/someoneJoined.wav';

  function _playTone(src, isSpeaker, cb) {
    debug && console.log('Playing tone with channel ' + _audioElement.mozAudioChannelType);
    _audioElement.src = src;
    _audioElement.addEventListener(
      'playing',
      function tonePlaying() {
        _audioElement.removeEventListener('playing', tonePlaying);
        // The MozSpeakerManager API is able to route the audio to the
        // speakers only if the phone audio state is either
        // MODE_IN_CALL or MODE_IN_COMMUNICATION (which happens only
        // when the telephony audio channel is in use). There is no
        // reason to change anything if the telephony audio channel is
        // not in use.
        if ((_channel === 'telephony') &&
            (typeof isSpeaker === 'boolean')) {
          SpeakerManagerHelper.forcespeaker = isSpeaker;
        }
        if (typeof cb === 'function') {
          cb();
        }
      }
    );
    _audioElement.play();
  };

  var TonePlayerHelper = {
    init: function tph_init(channel) {
      this.setChannel(channel);
    },

    setChannel: function tph_setChannel(channel) {
      var ctx = _audioElement;
      if (!channel || (ctx && (ctx.mozAudioChannelType === channel))) {
        return;
      }

      // If the channel needs to change we need to release resources and to
      // create a new audio context object.
      this.releaseResources();
      _channel = channel;
      this.ensureAudio();
    },

    ensureAudio: function tph_ensureAudio() {
      if (_audioElement || !_channel) {
        return;
      }
      _audioElement = new Audio();
      _audioElement.mozAudioChannelType = _channel;
    },

    playDialing: function tph_playDialing(isSpeaker, cb) {
      _audioElement.loop = true;
      _playTone(DIAL_TONE, isSpeaker, cb);
    },

    playRingback: function tph_playRingback(isSpeaker) {
      _audioElement.loop = true;
      _playTone(RINGBACK_TONE, isSpeaker);
    },

    playConnected: function tph_playFailed(isSpeaker) {
      _audioElement.loop = false;
      return new Promise(function(resolve, reject) {
        var timeout = window.setTimeout(resolve, TONE_TIMEOUT);
        _audioElement.addEventListener('ended', function onplaybackcompleted() {
          _audioElement.removeEventListener('ended', onplaybackcompleted);
          window.clearTimeout(timeout);
          resolve();
        });
        _playTone(CONNECTED_TONE, isSpeaker);
      });
    },

    playBusy: function tph_playBusy(isSpeaker) {
      _audioElement.loop = false;
      return new Promise(function(resolve, reject) {
        var timeout = window.setTimeout(resolve, TONE_TIMEOUT);
        _audioElement.addEventListener('ended', function onplaybackcompleted() {
          _audioElement.removeEventListener('ended', onplaybackcompleted);
          window.clearTimeout(timeout);
          resolve();
        });
        _playTone(BUSY_TONE, isSpeaker);
      });
    },

    playHold: function tph_playHold() {
      _audioElement.loop = true;
      _playTone(HOLD_TONE);
    },

    playFailed: function tph_playFailed(isSpeaker) {
      _audioElement.loop = false;
      return new Promise(function(resolve, reject) {
        var timeout = window.setTimeout(resolve, TONE_TIMEOUT);
        _audioElement.addEventListener('ended', function onplaybackcompleted() {
          _audioElement.removeEventListener('ended', onplaybackcompleted);
          window.clearTimeout(timeout);
          resolve();
        });
        _playTone(FAILED_TONE, isSpeaker);
      });
    },

    playEnded: function tph_playEnded(isSpeaker) {
      if (!_audioElement) {
        return;
      }
      _audioElement.loop = false;
      return new Promise(function(resolve, reject) {
        var timeout = window.setTimeout(resolve, TONE_TIMEOUT);
        _audioElement.addEventListener('ended', function onplaybackcompleted() {
          _audioElement.removeEventListener('ended', onplaybackcompleted);
          window.clearTimeout(timeout);
          resolve();
        });
        _playTone(ENDED_TONE, isSpeaker);
      });
    },

    playSomeoneJoinedARoomYouOwn: function tph_playSomeoneJoinedARoomYouOwn() {
      _audioElement.loop = false;
      return new Promise(function(resolve, reject) {
        var timeout = window.setTimeout(resolve, TONE_TIMEOUT);
        _audioElement.addEventListener('ended', function onplaybackcompleted() {
          _audioElement.removeEventListener('ended', onplaybackcompleted);
          window.clearTimeout(timeout);
          resolve();
        });
        // This tone is played on the notification audio channel, we
        // do not force routing the audio through the speaker.
        _playTone(SOMEONE_JOINED_ROOM_TONE);
      });
    },

    stop: function tph_stop() {
      if (!_audioElement) {
        return;
      }
      _audioElement.pause();
      _audioElement.src = '';
    },

    releaseResources: function tph_releaseResources() {
      if ((_channel === 'telephony') && _audioElement) {
        _audioElement.mozAudioChannelType = 'normal';
      }
      _audioElement = null;
    }
  };

  exports.TonePlayerHelper = TonePlayerHelper;
}(this));
