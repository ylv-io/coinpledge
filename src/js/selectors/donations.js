import _ from 'lodash';

export default donations => _.orderBy(
  donations,
  ['value'],
  ['desc'],
);
