/* exported ContactsHelper */

'use strict';

(function(exports) {

  function noop() {}

  var _ = navigator.mozL10n.get;

  function _findById(id, onsuccessCB, onerrorCB) {
    var options = {
      filterBy: ['id'],
      filterOp: 'equals',
      filterValue: id
    };

    var request = navigator.mozContacts.find(options);

    request.onsuccess = function onsuccess(e) {
      var contact = e.target.result[0];
      if (!contact) {
        onerrorCB();
        return;
      }
      onsuccessCB({
        contactIds: [contact.id],
        contacts: [contact]
      });
    };

    request.onerror = onerrorCB;
  }

  function _findByIdentity(identities, onsuccessCB, onerrorCB) {
    if (!Array.isArray(identities)) {
      identities = [identities];
    }

    var _contacts = null;
    var _ids = null;
    var _error;

    function _unique(array) {
      for(var i = 0; i < array.length; ++i) {
        for(var j = i +1 ; j < array.length; ++j) {
          if(array[i] === array[j]) {
            array.splice(j, 1);
          }
        }
      }
      return array;
    }

    function _onasyncreturn() {
      _asyncCalls--;
      if (_asyncCalls) {
        return;
      }

      if (_error || !_contacts || !_ids) {
        onerrorCB(_error);
      } else {
        onsuccessCB({ contactIds: _ids, contacts: _contacts });
      }
    }

    function _onsuccess(event) {
      var contacts = event.target.result;
      if (!contacts || !contacts.length) {
        _onasyncreturn();
        return;
      }

      if (!_contacts) {
        _contacts = [];
      }
      if (!_ids) {
        _ids = [];
      }

      _contacts = _unique(_contacts.concat(contacts));
      for (var i = 0, l = contacts.length; i < l; i++) {
        _ids.push(contacts[i].id);
        _ids = _unique(_ids);
      }
      _onasyncreturn();
    }

    function _onerror(event) {
      if (!_error) {
        _error = '';
      }
      _error += event.target.error.name;
      _onasyncreturn();
    }

    var _asyncCalls = 0;

    // Given that the Gaia Contacts app implements a duplicated contacts
    // detection feature, it is certaintly quite unlikely that we have
    // different contacts holding the same identity, but unlikely isn't
    // impossible, so we sadly need to check all the identities against
    // the Contacts API.
    var contactsAPI = navigator.mozContacts;
    identities.forEach((identity) => {
      _asyncCalls++;

      var options = {
        filterValue : identity
      };

      if (identity.indexOf('@') !== -1) {
        options.filterBy = ['email'];
        options.filterOp = 'equals';
      } else {
        options.filterBy = ['tel'];
        options.filterOp = 'match';
      }

      var request = contactsAPI.find(options);
      request.onsuccess = _onsuccess;
      request.onerror = _onerror;
    });
  }

  function getPrimaryInfo(contact) {
    var out = null;

    if (!contact) {
      return out;
    }

    out = _getValue(contact, 'name');
    if (!out.length) {
      out = _getValue(contact, 'email');
      if (!out.length) {
        out = _getValue(contact, 'tel');
        if (!out.length) {
          out = null;
        }
      }
    }

    return out
  }

  function prettyPrimaryInfo(contact) {
    return getPrimaryInfo(contact) || _('unknown');
  }

  function _getValue(contact, field) {
    var out = '';

    if (Array.isArray(contact[field]) && contact[field][0]) {
      out = contact[field][0].value || contact[field][0];
      out.trim();
    }

    return out;
  }

  var ContactsHelper = {
    /**
     * Search for contacts given a contact identifier or a list of identities.
     * The returned object will hold two arrays, one with a list of matching
     * ids and the other one with a list of matching mozContact objects.
     */
    find: function(filter, onsuccessCB, onerrorCB) {
      if (!onsuccessCB) {
        onsuccessCB = noop;
      }

      if (!onerrorCB) {
        onerrorCB = noop
      }

      if (!navigator.mozContacts) {
        console.error('mozContacts is not available');
        onerrorCB();
        return;
      }

      if (!filter) {
        onerrorCB();
        return;
      }

      if (filter.contactId) {
        _findById(
          filter.contactId,
          function onContactIDFound(contactInfo) {
            onsuccessCB(contactInfo);
          },
          function onFallback() {
            if (!filter.identities) {
              onerrorCB();
              return;
            }
            _findByIdentity(
              filter.identities,
              onsuccessCB,
              onerrorCB
            )
          }
        )
      } else {
        _findByIdentity(
          filter.identities,
          onsuccessCB,
          onerrorCB
        )
      }
    },

    /*
     * It returns the friendly name for a room participant. This object defines
     * an account and display name.
     */
    getParticipantName: function(participant) {
      var name = participant.displayName;
      name = (!name || (name === 'Guest')) ? _('guestTitle') : name;
      if (!participant.account) {
        return Promise.resolve(name);
      }

      return new Promise(resolve => {
        _findByIdentity(participant.account, result => {
          var contacts = result.contacts;
          if (!Array.isArray(contacts) || contacts.length === 0) {
            resolve(name);
          } else {
            resolve(getPrimaryInfo(contacts[0]));
          }
        }, error => {
          resolve(name);
        });
      });
    },

    getPrimaryInfo: getPrimaryInfo,

    prettyPrimaryInfo: prettyPrimaryInfo
  };

  exports.ContactsHelper = ContactsHelper;
}(this));
