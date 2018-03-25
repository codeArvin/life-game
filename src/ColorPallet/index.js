import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bar from './Bar';
import './index.css';

const _ = {
    get: function g (value, key, defaultValue) {
        let keys = key.split('.');
        while ( typeof value === 'object' && keys[0] in value) {
            value = value[keys.shift()];
        }
        if (keys.length === 0) {
            return value;
        }
        return defaultValue;
    }
};

export default class ColorPallet extends Component {
    constructor(props) {
        super(props);

        this.state = {
            r: _.get(this.props, 'defaultColor.r', 0),
            g: _.get(this.props, 'defaultColor.g', 0),
            b: _.get(this.props, 'defaultColor.b', 0)
        };
    }

    handleRGBChange(key, value) {
        this.setState({
            ...this.state,
            [key]: this.format(value),
        }, () => {
            this.props.onChange(this.state);
        });
    }

    handleInputChange(key, value) {
        value = value.split('.')[0] // 排除小数
                     .replace(/[^0-9]/, '') // 排除数字以外的输入
                     .slice(0, 3); // 只能输入三位以内

        if (value > 255) {
            value = 255;
        }
        this.handleRGBChange(key, value);
    }

    format(value) {
        return Math.round(value);
    }

    render() {
        const { r, g, b } = this.state;
        const color_style = {
            backgroundColor: `rgb(${r},${g},${b})`,
        };
        return (
            <div className="color-pallet">
                <div className="left">
                    <div>
                        <Bar value={this.format(r / 2.55)} onChange={(value)=>{this.handleRGBChange('r', value * 2.55)}} />
                        <div className="input">
                            <label htmlFor="r">R</label>
                            <input id="r" value={r} onChange={(e) => {this.handleInputChange('r', e.target.value)}} />
                        </div>
                    </div>
                    <div>
                        <Bar value={this.format(g / 2.55)} onChange={(value)=>{this.handleRGBChange('g', value * 2.55)}} />
                        <div className="input">
                            <label htmlFor="g">G</label>
                            <input id="g" value={g} onChange={(e) => {this.handleInputChange('g', e.target.value)}} />
                        </div>
                    </div>
                    <div>
                        <Bar value={this.format(b / 2.55)} onChange={(value)=>{this.handleRGBChange('b', value * 2.55)}} />
                        <div className="input">
                            <label htmlFor="b">B</label>
                            <input id="b" value={b} onChange={(e) => {this.handleInputChange('b', e.target.value)}} />
                        </div>
                    </div>
                </div><div className="right">
                    <div className="color" style={color_style}></div>
                </div>
            </div>
        );
    }
}

ColorPallet.propTypes = {
    onChange: PropTypes.func,
    defaultColor: PropTypes.shape({
        r: PropTypes.number,
        g: PropTypes.number,
        b: PropTypes.number,
    }),
}
