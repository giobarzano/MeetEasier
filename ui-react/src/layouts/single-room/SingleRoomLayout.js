import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Display from '../../components/single-room/display/Display';
import NotFound from '../../components/global/not-found/NotFound';

class SingleRoomLayout extends Component {
  render () {
    const roomList = this.props.match.params.roomList || '';
    return (
      <div id="single-room__wrap">
        { roomList ?
          <Display data={roomList} />
        :
          <div id="error-wrap">
            <NotFound />
          </div>
        }
      </div>
    );
  }
}

export default withRouter(SingleRoomLayout);
