import _ from 'lodash';

import { shortAddress } from '../utils/web3';

export const getChallenges = (challenges, users, filter) => _.orderBy(
  challenges.filter(filter).map((o) => {
    const user = users.find(i => i.addr === o.user);
    const mentor = users.find(i => i.addr === o.mentor);
    return {
      ...o,
      username: user ? user.username : shortAddress(o.user),
      mentorname: mentor ? mentor.username : shortAddress(o.mentor),
    };
  }, [o => o.startDate]), ['startDate'], ['desc'],
);
