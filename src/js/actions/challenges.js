
export const addExpense = (
  { 
    name = '', 
    value = 0, 
    time = 0, 
    mentor = '' 
  } = {}
) => ({
  type: 'ADD_CHALLENGE',
  challenge: {
    name,
    value,
    time,
    mentor
  }
});
