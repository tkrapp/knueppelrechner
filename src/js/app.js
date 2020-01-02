import 'bootstrap';
import ko from 'knockout';

import '../css/app.css';

const PARTICIPANT_DEFAULT_QUANTITY = 1;
const PARTICIPANT_DEFAULT_NAME = '';
const ORDERITEM_DEFAULT_PRICE = 0.01;
const ORDERITEM_DEFAULT_NAME = '';

function Participant(name) {
  'use strict';

  let self = this;

  self.name = ko.observable(name);
  self.quantity = (
    ko.observable(PARTICIPANT_DEFAULT_QUANTITY).extend({numeric: 2})
  );
  self.reset = function () {
    self.name(PARTICIPANT_DEFAULT_NAME);
    self.quantity(PARTICIPANT_DEFAULT_QUANTITY);
  };
  self.clone = function () {
    let participant = new Participant(ko.unwrap(self.name));

    participant.quantity(ko.unwrap(self.quantity));

    return participant;
  };
}

function OrderItem(name, price, participant) {
  'use strict';

  let self = this;

  self.name = ko.observable(name);
  self.price = ko.observable(price).extend({numeric: 2});
  self.assignedParticipant = ko.observable(participant);

  self.reset = function (defaultParticipant) {
    self.name(ORDERITEM_DEFAULT_NAME);
    self.price(ORDERITEM_DEFAULT_PRICE);
    self.assignedParticipant(defaultParticipant);
  };
  self.clone = function () {
    let orderItem = new OrderItem(
      ko.unwrap(self.name),
      ko.unwrap(self.price),
      ko.unwrap(self.assignedParticipant)
    );

    return orderItem;
  };
}

function ViewModel() {
  'use strict';

  let self = this;

  self.commonParticipant = new Participant('Allgemein');
  self.participants = ko.observableArray([]);
  self.orderItems = ko.observableArray([]);

  self.participantsOrCommon = ko.pureComputed(
    () => [self.commonParticipant].concat(ko.unwrap(self.participants))
  );
  self.newParticipant = new Participant(PARTICIPANT_DEFAULT_NAME);
  self.newOrderItem = new OrderItem(
    ORDERITEM_DEFAULT_NAME,
    ORDERITEM_DEFAULT_PRICE,
    self.commonParticipant
  );

  self.totalOrder = ko.pureComputed(function () {
    return ko.unwrap(self.participants)
      .map((participant) => ko.unwrap(participant.quantity))
      .reduce(sum, 0);
  }).extend({numeric: 2});

  self.addParticipant = function() {
    self.participants.push(self.newParticipant.clone());

    self.newParticipant.reset();
  };

  self.addOrderItem = function() {
    self.orderItems.push(self.newOrderItem.clone());

    self.newOrderItem.reset(self.commonParticipant);
  };

  self.removeParticipant = (participant) => self.participants.remove(participant);
  self.removeOrderItem = (orderItem) => self.orderItems.remove(orderItem);

  self.costsPerParticipant = ko.pureComputed(function() {
    let total = ko.unwrap(self.totalOrder),
        commonCosts = ko.unwrap(self.orderItems)
          .filter((item) => ko.unwrap(item.assignedParticipant) === self.commonParticipant)
          .map((item) => ko.unwrap(item.price))
          .reduce(sum, 0),
        participants = ko.unwrap(self.participants);

    return participants.map((participant) => {
      let ratio = ko.unwrap(participant.quantity) / total || 0,
          personally = ko.unwrap(self.orderItems)
            .filter((item) => ko.unwrap(item.assignedParticipant) === participant)
            .map((item) => ko.unwrap(item.price))
            .reduce(sum, 0);

      return {
        name: participant.name,
        costs: `${((ratio * commonCosts) + personally).toFixed(2)} €`
      };
    });
  });

  window.vm = self;
}

function sum(a, b) {
  return a + b;
}

ko.extenders.numeric = function(target, precision) {
  // create a writable computed observable to intercept writes to our observable
  let result = ko.pureComputed({
      read: target,  // always return the original observables value
      write: function(newValue) {
          var current = target(),
              roundingMultiplier = Math.pow(10, precision),
              newValueAsNum = isNaN(newValue) ? 0 : +newValue,
              valueToWrite = (
                Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier
              );

          // only write if it changed
          if (valueToWrite !== current) {
              target(valueToWrite);
          } else {
              // if the rounded value is the same, but a different value was written,
              // force a notification for the current field
              if (newValue !== current) {
                  target.notifySubscribers(valueToWrite);
              }
          }
      }
  }).extend({ notify: 'always' });

  // initialize with current value to make sure it is rounded appropriately
  result(target());

  //return the new computed observable
  return result;
};

ko.applyBindings(new ViewModel());
