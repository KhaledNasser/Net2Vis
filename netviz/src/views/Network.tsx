import * as React from 'react';
import { ajax } from 'jquery';
import { connect, Dispatch } from 'react-redux';

import { Network, NetworkState } from '../types/NetworkTypes';
import { NetworkAction } from '../actions';
import * as actions from '../actions';
import { StoreProps } from '../types';

interface StateProps {
  network: Network;
}

interface DispatchProps {
  getNetwork: (network: NetworkState) => NetworkAction;
}

class NetworkComponent extends React.Component<StateProps & DispatchProps, {}> {
  
  constructor(props: StateProps & DispatchProps) {
    super(props);
    this.loadNetwork();
  }

  render() {  
    return (
        <g />
    );
  }

  loadNetwork = () => {
    ajax({
      method: 'GET',
      url: '/api/network',
      contentType: 'application/json'
    }).done(data => {
      console.log(data);
      this.props.getNetwork(data.data);
    }).fail((jqXHR, textStatus, error) => {
      console.warn(`Request failed! status: ${textStatus} error: ${error}`);
    });
  }
}
  
const mapStateToProps = ({
  network
}: StoreProps) => ({
  network
});

const mapDispatchToProps = (
  dispatch: Dispatch<NetworkAction>
) => ({
  getNetwork: (network: NetworkState) => dispatch(actions.getNetwork(network))
});

export default connect(mapStateToProps, mapDispatchToProps)(NetworkComponent);
