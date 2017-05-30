import React from 'react';
import { shallow } from 'enzyme';
import SearchBar from '../../src';
import Suggestions from '../../src/components/suggestions';

describe('<SearchBar />', () => {
  describe('should throw exceptions when missing required props', () => {
    // Suppress propType warnings
    before(() => {
      sinon.stub(console, 'error');
    });

    after(() => {
      console.error.restore();
    });

    it('onChange', () => {
      const component = <SearchBar />;
      expect(() => shallow(component)).to.throw();
    });

    it('onClear', () => {
      const component = <SearchBar onChange={noop} />;
      expect(() => shallow(component)).to.throw();
    });

    it('suggestions', () => {
      const component = <SearchBar onChange={noop} onClear={noop} />;
      expect(() => shallow(component)).to.throw();
    });

    it('onSearch when renderSearchButton is true', () => {
      const component = (
        <SearchBar 
          renderSearchButton 
          onChange={noop} 
          onClear={noop}
          suggestions={[]}
        />
      );

      expect(() => shallow(component)).to.throw();
    });
  });

  it('should render suggestions', () => {
    const suggestions = ['macbook air', 'macbook pro'];

    const wrapper = shallow(
      <SearchBar
        onChange={noop}
        onClear={noop}
        suggestions={suggestions}
      />
    );

    wrapper.setState({
      value: 'mac'
    });

    expect(wrapper.find(Suggestions).prop('suggestions')).to.equal(suggestions);
  });
});
