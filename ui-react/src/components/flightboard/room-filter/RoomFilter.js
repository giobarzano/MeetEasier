import React, { Component } from 'react';
import { Link } from 'react-router-dom';

let fbConfig = require('../../../config/flightboard.config.js');

class RoomFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: false,
      roomlists: []
    }
  }

  componentDidMount() {
    return fetch('/api/roomlists')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          response: true,
          roomlists: data
        });

      })
  }

  render() {
    const { response } = this.state,
      selectedRoomList = this.props.selectedRoomList;
    return (
      <li>
        <Link to={'/' + selectedRoomList.toLowerCase().replace(/\s+/g, "-")} className="current-filter">
          {fbConfig.roomFilter.filterTitle}
        </Link>
        <ul className="menu fb__child-dropdown">
          <li id="roomlist-all">
            <Link to={'/'}>{fbConfig.roomFilter.filterAllTitle}</Link>
          </li>
          { response ?
            this.state.roomlists.map((item) => {
              // TODO don't re-slugify the room name. Use the `RoomAlias` instead (this will require changes in the API)
              const slugifiedRoomName = item.toLowerCase().replace(/\s+/g, "-");
              return (
                <li key={slugifiedRoomName} id={'roomlist-' + slugifiedRoomName}>
                  <Link to={'/' + slugifiedRoomName}>{item}</Link>
                </li>
              )
            })
            : <p>Loading ...</p>
          }
        </ul>
      </li>
    );
  }
}

export default RoomFilter;
