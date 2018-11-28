import { addDonation } from '../../actions/donations';

test('should setup add donation action object', () => {
  const donation = {
    name: 'ylv',
    url: 'ylv.io',
    value: '0.1',
    timestamp: 1231,
  };
  const action = addDonation(donation);
  expect(action).toEqual({
    type: 'ADD_DONATION',
    donation,
  });
});
