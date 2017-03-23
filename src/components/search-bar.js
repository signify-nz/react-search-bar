import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import autoBind from 'react-autobind';
import classNames from 'classnames';
import invariant from 'invariant';
import debounce from 'lodash.debounce';
import omit from 'lodash.omit';
import Suggestions from './suggestions';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    ['onChange', 'onClear', 'suggestions'].forEach(prop => {
      invariant(props[prop], `${prop} prop is required.`);
    });

    if (props.renderSearchButton) {
      invariant(
        props.onSearch, 
        'onSearch prop is required when rendering search button'
      );
    }

    this.state = {
      focusedSuggestion: -1,
      isFocused: false,
      searchTerm: '',
      value: ''
    };

    autoBind(this);

    this.onChange = debounce(
      searchTerm => props.onChange(searchTerm), 
      props.onChange
    );
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.input.focus();
    }

    document.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  setFocusedSuggestion(movingDown) {
    const { focusedSuggestion: focused, searchTerm } = this.state;
    const { suggestions } = this.props;
    const last = suggestions.length - 1;
    let next;

    if (movingDown) {
      next = focused === last ? -1 : focused + 1;
    } else {
      next = focused === -1 ? last : focused - 1;
    }

    this.setState({
      focusedSuggestion: next,
      value: suggestions[next] || searchTerm
    });
  }

  clearSearch() {
    this.props.onClear();

    this.setState({
      focusedSuggestion: -1,
      searchTerm: '',
      value: ''
    });
  }

  toggleFocus() {
    this.setState({
      isFocused: !this.state.isFocused
    });
  }

  handleClick(event) {
    const node = findDOMNode(this.container);

    if (!node.contains(event.target)) {
      this.props.onClear();
    }
  }

  handleChange(event) {
    const { value } = event.target;
    const searchTerm = value.toLowerCase().trim();

    if (!value) {
      this.clearSearch();
      return;
    }

    this.setState({
      searchTerm,
      value
    });

    this.onChange(searchTerm);
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        this.setFocusedSuggestion(event.key === 'ArrowDown');
        break;

      case 'Enter':
        this.handleSearch();
        break;

      case 'Escape':
        this.handleEscape();
        break;
    }
  }

  handleEscape() {
    this.input.blur();
    
    this.setState({
      focusedSuggestion: -1,
      searchTerm: ''
    });

    this.props.onClear();
  }

  handleHover(index) {
    this.setState({
      focusedSuggestion: index
    });
  }

  handleSelection(suggestion) {
    this.setState({
      focusedSuggestion: -1,
      value: suggestion
    });

    this.props.onClear();

    if (this.props.onSelection) {
      this.props.onSelection(suggestion);
    }
  }

  handleSearch() {
    this.props.onClear();
    this.props.onSearch(this.state.value.trim());
  }

  renderClearButton() {
    return (
      <button
        className={this.props.styles.clearButton}
        onClick={this.clearSearch}
      />
    );
  }

  renderSearchButton() {
    return (
      <button
        className={this.props.styles.submitButton}
        onClick={this.handleSearch}
      />
    )
  }

  render() {
    const { props, state } = this;
    const { renderSearchButton, styles } = props;
    const attributes = omit(props, Object.keys(SearchBar.propTypes));

    const renderClearButton = (
      state.value &&
      props.renderClearButton
    );

    const renderSuggestions = (
      state.value &&
      props.suggestions.length > 0
    );

    return (
      <div
        className={styles.wrapper}
        ref={ref => this.container = ref}
      >
        <div
          className={classNames({
            [styles.field]: true,
            [styles.fieldFocused]: state.isFocused,
            [styles.hasSuggestions]: props.suggestions.length > 0
          })}
        >
          <input
            {...attributes}
            className={styles.input}
            type="text"
            ref={ref => this.input = ref}
            value={state.value}
            onChange={this.handleChange}
            onFocus={this.toggleFocus}
            onBlur={this.toggleFocus}
            onKeyDown={props.suggestions && this.handleKeyDown}
          />
          {renderClearButton && this.renderClearButton()}
          {renderSearchButton && this.renderSearchButton()}
        </div>
        {renderSuggestions && (
          <Suggestions
            focusedSuggestion={state.focusedSuggestion}
            onSelection={this.handleSelection}
            onSuggestionHover={this.handleHover}
            searchTerm={state.searchTerm}
            styles={styles}
            suggestions={props.suggestions}
            suggestionRenderer={props.suggestionRenderer}
          />
        )}
      </div>
    );
  }
}

SearchBar.propTypes = {
  autoFocus: PropTypes.bool,
  delay: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  onClear: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  onSelection: PropTypes.func,
  renderClearButton: PropTypes.bool,
  renderSearchButton: PropTypes.bool,
  styles: PropTypes.object,
  suggestions: PropTypes.array.isRequired,
  suggestionRenderer: PropTypes.func
};

SearchBar.defaultProps = {
  autoCapitalize: 'off',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoFocus: false,
  delay: 0,
  maxLength: 100,
  placeholder: '',
  renderClearButton: false,
  renderSearchButton: false,
  styles: {
    wrapper: 'react-search-bar__wrapper',
    field: 'react-search-bar__field',
    focusedField: 'react-search-bar__field--focused',
    hasSuggestions: 'react-search-bar__field--has-suggestions',
    input: 'react-search-bar__input',
    clearButton: 'react-search-bar__clear',
    submitButton: 'react-search-bar__submit',
    suggestions: 'react-search-bar__suggestions',
    suggestion: 'react-search-bar__suggestion'
  },
  suggestionRenderer: suggestion => <div>{suggestion}</div>
};

export default SearchBar;
