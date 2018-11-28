import React from 'react';
import { shallow } from 'enzyme';
import { Footer } from '../../components/Footer';

test('should render footer correctly', () => {
  const wrapper = shallow(<Footer donations={[]} />);
  expect(wrapper).toMatchSnapshot();
});
