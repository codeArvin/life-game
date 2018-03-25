import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getPageCoord } from '../../utils/offset';
import './index.css'

class Bar extends Component {
    constructor(props) {
        super(props);

        this.drag = false;
        this.bar_pageLeft = 0;

        this.handleDotMouseDown = this.handleDotMouseDown.bind(this);
        this.handleDotMouseUp = this.handleDotMouseUp.bind(this);
        this.handleBarMouseMove = this.handleBarMouseMove.bind(this);
        this.handleBarMouseLeave = this.handleBarMouseLeave.bind(this);
    }

    getCorrectLeftValue(value) {
        if (value < 0) {
            return 0;
        } else if (value > 200) {
            return 200;
        } else {
            return Math.ceil(value);
        }
    }

    handleDotMouseDown() {
        this.drag = true;
    }

    handleDotMouseUp() {
        this.drag = false;
    }

    handleBarMouseLeave() {
        this.drag = false;
    }

    handleBarMouseMove(e) {
        if (this.drag) {
            this.props.onChange(this.getCorrectLeftValue(e.nativeEvent.pageX - this.bar_pageLeft) / 2);
        }
    }

    componentDidMount() {
        this.bar_pageLeft = getPageCoord(this.bar).X;
    }

    render() {
        const dot_style = {
            left: `${this.getCorrectLeftValue(this.props.value * 2)}px`,
        };
        return (
            <div
                className="bar"
                onMouseMove={this.handleBarMouseMove}
                onMouseLeave={this.handleBarMouseLeave}
                ref={(bar) => { this.bar = bar; }}
            >
                <div
                    className="dot"
                    style={dot_style}
                    onMouseDown={this.handleDotMouseDown}
                    onMouseUp={this.handleDotMouseUp}
                ></div>
            </div>
        );
    };
}

Bar.propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func,
}

export default Bar;
