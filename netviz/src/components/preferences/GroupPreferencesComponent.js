import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import * as actions from '../../actions';

import Typography from '@material-ui/core/Typography';

import InputField from './InputField'

import * as removal from '../../groups/Removal';
import * as activation from '../../groups/Activation';

// Component for displaying the Preferences of the Visualization
class GroupPreferences extends React.Component {
  // Called when the Color of the Colorpicker changes
  handleColorChange = (e) => {
    var layerTypes = this.props.layer_types_settings;
    layerTypes[this.props.selected_legend_item].color = e.hex;
    this.props.actions.updateLayerTypes(layerTypes, this.props.network, this.props.id);
  }

  // Called when the Name of the Layer Alias changes
  handleAliasChange = (e) => {
    var layerTypes = this.props.layer_types_settings;
    layerTypes[this.props.selected_legend_item].alias = e.currentTarget.value;
    this.props.actions.updateLayerTypes(layerTypes, this.props.network, this.props.id);
  }

  // Toggles a Group and others that build on it
  toggleGroup = (e) => {
    var selectedGroup = removal.getGroupByName(this.props.selected_legend_item, this.props.groups);
    if (selectedGroup.group.active === true) { // If the currently selected group is active
      activation.deactivateGroup(this.props.selected_legend_item, this.props.groups); // Deactivate the current Group
    } else { // Group was inactive
      activation.activateGroup(this.props.selected_legend_item, this.props.groups); // Deactivate the current Group
    }
    this.props.actions.updateGroups(this.props.groups, this.props.network, this.props.id); // Push the groups update to the state
  }
  
  // Removes a Group and others that build on it from the State
  deleteGroup = (e) => {
    var currLegend = this.props.layer_types_settings; // Current Legend Items in the State
    var name = this.props.selected_legend_item; // Get the name of the currently selected Item
    removal.deleteGroup(name, this.props.groups); // Delete the group and expand Groups that depend on it
    delete currLegend[name]; // Delete the LegendItem
    this.props.actions.deleteGroups(this.props.groups, currLegend, this.props.network, this.props.id); // Push the deletion to the state
  }

  render() {
    return(
      <div className='preferencesWrapper'>
        <div>
          <Typography variant="h6" color="inherit">
            Group
          </Typography>
          <InputField value={this.props.layer_types_settings[this.props.selected_legend_item].alias} type={'text'} description={'Layer Alias'} action={this.handleAliasChange}/>
          <InputField value={this.props.layer_types_settings[this.props.selected_legend_item].color} type={'color'} description={'Layer Color'} action={this.handleColorChange}/>
          <InputField value={this.props.group.active} type={'switch'} description={'Group Active'} action={this.toggleGroup}/>
        </div>
        <div>
          <InputField value={'Delete'} type={'button'} description={'Ungroup'} action={this.deleteGroup}/>
        </div>
      </div>
    );
  }
}

// Prop Types holding all the Preferences
GroupPreferences.propTypes = {
  id: PropTypes.string.isRequired,
  layer_types_settings: PropTypes.object.isRequired,
  selected_legend_item: PropTypes.string.isRequired,
  network: PropTypes.object.isRequired,
  groups: PropTypes.array.isRequired,
};

// Map the State to the Properties of this Component
function mapStateToProps(state, ownProps) {
  return {
    id: state.id,
    layer_types_settings: state.layer_types_settings,
    selected_legend_item: state.selected_legend_item,
    network: state.network,
    groups: state.groups,
  };
}

// Map the actions of the State to the Props of this Class 
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPreferences);