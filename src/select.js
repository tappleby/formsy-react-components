/*jshint node:true */

'use strict';

var React = require('react');
var Formsy = require('formsy-react');
var ComponentMixin = require('./mixins/component');
var Row = require('./row');
var propUtilities = require('./prop-utilities');

var Select = React.createClass({

    mixins: [Formsy.Mixin, ComponentMixin],

    componentDidMount: function () {
        // Temporary workaround for IE Edge until the following is resovled:
        // - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8794503/
        // - https://github.com/facebook/react/issues/7655
        if (this.element && this.element.selectedIndex >= 0) {
            var options = this.element.options;
            var selectedIndex = this.element.selectedIndex;
            var tempIndex = (selectedIndex + 1) % options.length;

            options[tempIndex].selected = true;
            options[selectedIndex].selected = true;    
        }
    },

    changeValue: function(event) {
        var target = event.currentTarget;
        var value;
        if (this.props.multiple) {
            value = [];
            for (var i = 0; i < target.length; i++){
                var option = target.options[i];
                if (option.selected) {
                    value.push(option.value);
                }
            }
        } else {
            value = target.value;
        }
        this.setValue(value);
        this.props.onChange(this.props.name, value);
    },

    render: function() {

        if (this.getLayout() === 'elementOnly') {
            return this.renderElement();
        }

        return (
            <Row
                {...this.getRowProperties()}
                htmlFor={this.getId()}
            >
                {this.renderElement()}
                {this.renderHelp()}
                {this.renderErrorMessage()}
            </Row>
        );
    },

    renderElement: function() {

        var renderOption = function(item, key) {
            const { group, label, ...rest } = item;
            return (
                <option key={key} {...rest}>{item.label}</option>
            )
        }

        var options = this.props.options;

        var groups = options.filter(function (item) {
            return item.group;
        }).map(function (item) {
            return item.group;
        });
        // Get the unique items in group.
        groups = [...new Set(groups)];

        var optionNodes = [];

        if (groups.length == 0) {
            optionNodes = options.map(function (item, index) {
                return renderOption(item, index);
            });
        } else {
            // For items without groups.
            var itemsWithoutGroup = options.filter(function (item) {
                return !item.group;
            })

            itemsWithoutGroup.forEach(function (item, index) {
                optionNodes.push(renderOption(item, 'no-group-' + index));
            });

            groups.forEach(function (group, groupIndex) {

                var groupItems = options.filter(function (item) {
                    return item.group === group;
                });

                var groupOptionNodes = groupItems.map(function (item, index) {
                    return renderOption(item, groupIndex + '-' + index);
                });

                optionNodes.push(<optgroup label={group} key={groupIndex}>{groupOptionNodes}</optgroup>);
            });
        }
        return (
            <select
                ref={(c) => this.element = c}
                className="form-control"
                {...propUtilities.cleanProps(this.props)}
                id={this.getId()}
                value={this.getValue()}
                onChange={this.changeValue}
                disabled={this.isFormDisabled() || this.props.disabled}
            >
                {optionNodes}
            </select>
        );
    }
});

module.exports = Select;
