export default (users, account) => users.filter(o => o.addr !== account).map(o => ({ value: o.username, label: o.username }));
