(function(exports) {
  'use strict';

  /*
   * The goal of this code is to have a unique entry point to request
   * the lazy loading of a given piece of code.
   *
   * For importing an external 'element', we need to create it in
   * /elements folder. Each element should contain the links & scripts
   * needed to work and the 'template' with all the content to load into
   * the panel.
   *
   * The panel, for reusable elements (as feedback) will be added via JS.
   *
   * In the case of standalone elements, as create screen, will be directly
   * into the HEAD of our HTML. Dont forget to add 'is' attribute in the HEAD
   * link or script and in the element within the markup.
   *
   */

  const PANELS_ID = {
    feedback: 'feedback',
    join_room: 'join-room',
    create_room: 'new-room',
    room_detail: 'room-detail-panel',
    room_ui: 'room-ui',
    conversation_detail: 'conversation-detail',
    room_history: 'room-history-panel',
    shared_with: 'shared-with'
  };

  var Loader = {
    getShare: function() {
      if (window.Share) {
        return Promise.resolve(Share);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          ['js/helpers/share.js'],
          () => {
            resolve(Share);
          }
        );
      });
    },
    getShareScreen: function() {
      if (window.ShareScreen) {
        return Promise.resolve(ShareScreen);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(['js/screens/share.js'], () => {
          resolve(ShareScreen);
        });
      });
    },
    getStatus: function() {
      if (window.Status) {
        return Promise.resolve(Status);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          ['libs/components/gaia-status/style.css',
           'libs/components/gaia-status/status.js'],
          () => {
            resolve(Status);
          }
        );
      });
    },
    getHawkCredentials: function() {
      if (window.hawkCredentials) {
        return window.hawkCredentials;
      } else {
        return new Promise((resolve,reject) => {
          LazyLoader.load(['js/helpers/hawk_creds.js'],
                          () => window.hawkCredentials.then(hc => resolve(hc)));
        });
      }
    },
    getNotificationHelper: function() {
      if (window.NotificationHelper) {
        return Promise.resolve(NotificationHelper);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          ['libs/notification_helper.js'],
          () => {
            resolve(NotificationHelper);
          }
        );
      });
    },
    getWizard: function() {
      if (window.Wizard) {
        return Promise.resolve(Wizard);
      }

      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'style/wizard.css',
            'js/screens/wizard/authenticate.js',
            'js/screens/wizard/tutorial.js',
            'js/screens/wizard/wizard.js'
          ],
          () => {
            resolve(Wizard);
          }
        );
      });
    },
    getRoomCreateObj: function() {
      if (window.RoomCreate) {
        return Promise.resolve(RoomCreate);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load('js/screens/create_room.js', () => {
          resolve(RoomCreate);
        });
      });
    },
    getRoomCreate: function() {
      // RoomCreate could have been loaded by means of "getRoomCreateObj" method
      // but we need to load the panel as well.
      if (window.RoomCreate && window.RoomCreate.contentLoaded) {
        return Promise.resolve(RoomCreate);
      }
      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(RoomCreate);
        }, PANELS_ID.create_room);
      });
    },
    getSharedWith: function() {
      if (window.SharedWith) {
        return Promise.resolve(SharedWith);
      }
      return new Promise(function(resolve, reject) {
        HtmlImports.populate(function() {
          resolve(SharedWith);
        }, PANELS_ID.shared_with);
      });
    },
    getConversationDetail: function() {
      if (window.ConversationDetail) {
        return Promise.resolve(ConversationDetail);
      }
      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(ConversationDetail);
        }, PANELS_ID.conversation_detail);
      });
    },
    getRoomDetail: function() {
      if (window.RoomDetail) {
        return Promise.resolve(RoomDetail);
      }

      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(RoomDetail);
        }, PANELS_ID.room_detail);
      });
    },
    getRoomHistory: function() {
      if (window.RoomHistory) {
        return Promise.resolve(RoomHistory);
      }

      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(RoomHistory);
        }, PANELS_ID.room_history);
      });
    },
    getFeedback: function(attention) {
      if (window.FeedbackScreen) {
        return Promise.resolve(FeedbackScreen);
      }

      return new Promise((resolve, reject) => {
        // Shield against multiple requests
        if (!document.querySelector('#' + PANELS_ID.feedback)) {
          // Create the panel
          var panel = document.createElement('section');
          panel.id = PANELS_ID.feedback;
          panel.setAttribute('is', PANELS_ID.feedback);
          panel.className = 'vbox modal hide';
          document.body.appendChild(panel);

          var link = document.createElement('link');
          link.href = attention ? '../elements/feedback.html':'elements/feedback.html';
          link.setAttribute('rel', 'import');
          // This is adding an extra functionality to our code. This is pointing
          // the 'import' we need to load feedback, so we are going to load just
          // this panel.
          link.setAttribute('is', 'feedback');
          document.head.appendChild(link);
        }

        HtmlImports.populate(function() {
          resolve(FeedbackScreen);
        }, PANELS_ID.feedback);
      });
    },
    getRoomsSynchronizer: function() {
      if (window.RoomsSynchronizer) {
        return Promise.resolve(RoomsSynchronizer);
      }

      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/helpers/rooms_synchronizer.js'
          ],
          () => {
            resolve(RoomsSynchronizer);
          }
        );
      });
    },
    getRoomDelete: function() {
      if (window.RoomDelete) {
        return Promise.resolve(RoomDelete);
      }

      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/screens/delete_room.js'
          ],
          () => {
            resolve(RoomDelete);
          }
        );
      });
    },
    getRoomController: function() {
      if (window.RoomController) {
        return Promise.resolve(RoomController);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/helpers/room/room_controller.js'
          ],
          () => {
            resolve(RoomController);
          }
        );
      });
    },
    getRoomUI: function() {
      if (window.RoomUI) {
        return Promise.resolve(RoomUI);
      }
      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(RoomUI);
        }, PANELS_ID.room_ui);
      });
    },
    getJoinRoom: function() {
      if (window.JoinRoom) {
        return Promise.resolve(JoinRoom);
      }
      return new Promise((resolve, reject) => {
        HtmlImports.populate(function() {
          resolve(JoinRoom);
        }, PANELS_ID.join_room);
      });
    },
    getRoomManager: function() {
      if (window.RoomManager) {
        return Promise.resolve(RoomManager);
      }

      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'libs/tokbox/' + window.OTProperties.version + '/js/TB.js',
            'libs/opentok.js',
            'js/helpers/codec_helper.js',
            'js/helpers/room/room_manager.js'
          ],
          () => {
            resolve(RoomManager);
          }
        );
      });
    },
    getRoomEvent: function() {
      if (window.RoomEvent) {
        return Promise.resolve(RoomEvent);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/helpers/room/room_event.js'
          ],
          () => {
            resolve(RoomEvent);
          }
        );
      });
    },
    getErrorScreen: function() {
      if (window.ErrorScreen) {
        return Promise.resolve(ErrorScreen);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/screens/error_screen.js'
          ],
          () => {
            resolve(ErrorScreen);
          }
        );
      });
    },
    getOfflineScreen: function() {
      if (window.OfflineScreen) {
        return Promise.resolve(OfflineScreen);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/screens/error_screen.js'
          ],
          () => {
            resolve(OfflineScreen);
          }
        );
      });
    },
    getSignUpErrorScreen: function() {
      if (window.SignUpErrorScreen) {
        return Promise.resolve(SignUpErrorScreen);
      }
      return new Promise((resolve, reject) => {
        LazyLoader.load(
          [
            'js/screens/error_screen.js'
          ],
          () => {
            resolve(SignUpErrorScreen);
          }
        );
      });
    }
  };

  exports.Loader = Loader;
}(this));
