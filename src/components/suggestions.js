import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import autoBind from 'react-autobind';
import Suggestion from './suggestion';

class Suggestions extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidUpdate() {
    if (this.focusedSuggestion) {
      const { list, focusedSuggestion } = this;
      const listRect = list.getBoundingClientRect();
      const suggestionRect = focusedSuggestion.getBoundingClientRect();

      if (suggestionRect.bottom > listRect.bottom) {
        list.scrollTop = (
          focusedSuggestion.offsetTop +
          focusedSuggestion.clientHeight -
          list.clientHeight
        );
      } else if (suggestionRect.top < listRect.top) {
        list.scrollTop = focusedSuggestion.offsetTop;
      }
    }
  }

  onMouseMove(event, index) {
    const { movementX, movementY } = event.nativeEvent;

    if (movementX || movementY) {
      this.props.onSuggestionHover(index);
    }
  }

  onMouseLeave() {
    this.props.onSuggestionHover(-1);
  }

  setFocusedSuggestion(ref) {
    if (ref && ref.item) {
      this.focusedSuggestion = ref.item;
    }
  }

  renderSuggestion(suggestion, index) {
    const { props } = this;
    const { styles } = props;
    const isFocused = props.focusedSuggestion === index;

    return (
      <Suggestion
        className={classNames({
          [styles.suggestion]: true,
          [styles.suggestionFocused]: isFocused
        })}
        index={index}
        key={suggestion}
        onClick={props.onSelection}
        onMouseMove={this.onMouseMove}
        ref={isFocused && this.setFocusedSuggestion}
        searchTerm={props.searchTerm}
        suggestion={suggestion}
        suggestionRenderer={props.suggestionRenderer}
      />
    );
  }

  render() {
    return (
      <ul
        className={this.props.styles.suggestions}
        ref={ref => this.list = ref}
        onMouseLeave={this.onMouseLeave}
      >
        {this.props.suggestions.map(this.renderSuggestion)}
      </ul>
    );
  }
}

Suggestions.defaultProps = {
  styles: {
    suggestions: 'react-search-bar__suggestions',
    suggestion: 'react-search-bar__suggestion',
    focusedSuggestion: 'react-search-bar__suggestion--focused'
  }
};

Suggestions.propTypes = {
  focusedSuggestion: PropTypes.number.isRequired,
  onSelection: PropTypes.func.isRequired,
  onSuggestionHover: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  styles: PropTypes.object,
  suggestions: PropTypes.array.isRequired
};

export default Suggestions;
