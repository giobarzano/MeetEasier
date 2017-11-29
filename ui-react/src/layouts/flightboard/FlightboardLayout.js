import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Flightboard from '../../components/flightboard/board/Flightboard';
import Navbar from '../../components/flightboard/navbar/Navbar';

class FlightboardTemplate extends Component {
  render () {
    const roomList = this.props.match.params.roomList || '';
    return (
      <div id="page-wrap">
        <Navbar selectedRoomList={roomList} />
        <Flightboard selectedRoomList={roomList}/>
      </div>
    )
  }
}

export default withRouter(FlightboardTemplate);
