import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Socket from '../../global/socket/Socket';

let fbConfig = require('../../../config/flightboard.config.js');

class Flightboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: false,
      now: new Date(),
      rooms: []
    }
  }

  componentDidMount() {
    return fetch('/api/rooms')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          response: true,
          rooms: data
        });
      })
  }

  handleSocket(socketResponse) {
    this.setState({
      response: socketResponse.response,
      now: socketResponse.now,
      rooms: socketResponse.rooms
    })
  }

  render() {
    const { now, response } = this.state,
      selectedRoomList = this.props.selectedRoomList;

    let styles = {
      show: {
        display: 'block'
      },
      hide: {
        display: 'none'
      },
      flex: {
        display: 'flex'
      }
    };

    return (
      <div className="tracker-wrap">
        <Socket response={this.handleSocket.bind(this)}/>
        {/* <Socket /> */}
        { response ?
          this.state.rooms.map(function(item, key) {
            let nextUp = '';
            let timesPresent = false;
            let skippedRoom = false;
            const slugifiedRoom = item.RoomAlias,
              slugifiedRoomlist = item.RoomlistAlias;

            fbConfig.board.roomsToSkip.forEach(function(configItem, configKey) {
              // do stuff
              if(configItem === item.Email) {
                skippedRoom = true;
              }
            });

            // check if there are times in the item.Start & item.End
            // then: if the meeting is not going on now, append "Next Up: "
            if (typeof item.Appointments !== 'undefined' && item.Appointments.length > 0) {
              if (item.Appointments[0].Start && item.Appointments[0].End) {
                timesPresent = true;
                if (item.Appointments[0].Start < now && now < item.Appointments[0].End) { } else {
                  nextUp = fbConfig.board.text.nextUp + ': ';
                }
              }
            }
            // if the room needs to be skipped, return null
            if (!skippedRoom) {
              let meetingRoomClass = `${ slugifiedRoom } meeting-room ${ item.Busy ? 'meeting-room-busy' : '' }`;
              meetingRoomClass += item.Busy ? ' meeting-room-busy' : '';
              meetingRoomClass += item.ErrorMessage ? ' meeting-room-error' : '';
              const meetingClass = item.ErrorMessage
                ? 'meeting-error'
                : item.Busy
                  ? 'meeting-busy'
                  : 'meeting-open';
              let statusText = item.ErrorMessage
                ? fbConfig.board.text.statusError
                : item.Busy
                  ? fbConfig.board.text.statusBusy
                  : fbConfig.board.text.statusAvailable;
              const isRoomVisible = selectedRoomList === slugifiedRoomlist
                || selectedRoomList === 'roomlist-all'
                || selectedRoomList === '';
              return (
                <div key={slugifiedRoom} className={'row-padder roomlist-' + slugifiedRoomlist} style={isRoomVisible ? styles.show : styles.hide}>
                  <div className="row">
                    <div className="medium-12 columns">
                      <div className={meetingRoomClass}>
                        <div className="row valign-middle">
                          <div className={slugifiedRoom + '-status meeting-room__status medium-2 columns'}>
                            <div className={meetingClass} title={item.ErrorMessage || ''}>
                              {statusText}
                            </div>
                          </div>
                          <div className="medium-3 columns">
                            <div className={slugifiedRoom + '-name meeting-room__name'}>
                              {item.Name}
                            </div>
                          </div>
                          <div className="medium-6 columns">
                            <div className={slugifiedRoom + '-meeting-information'}>
                                {timesPresent && item.Appointments[0].End >= now &&
                                  <div>
                                    <span className={slugifiedRoom + '-meeting-upcoming meeting-upcoming'}>
                                      {nextUp}
                                    </span>
                                    <span className={slugifiedRoom + '-subject meeting-subject'}>
                                      {item.Appointments[0].Subject}
                                    </span>
                                  </div>
                                }
                            </div>
                            <div className={slugifiedRoom + '-time meeting-time'}>
                              {timesPresent ?
                                new Date(parseInt(item.Appointments[0].Start, 10)).toLocaleDateString([],{month: 'short', day: '2-digit'}) + ' ' + new Date(parseInt(item.Appointments[0].Start, 10)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + ' - ' + new Date(parseInt(item.Appointments[0].End, 10)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                : ''
                              }
                            </div>
                            <div className={slugifiedRoom + '-organizer meeting-organizer'}>
                              {timesPresent && item.Appointments[0].End >= now &&
                                item.Appointments[0].Organizer
                              }
                            </div>
                          </div>
                          <div className="medium-1 columns">
                            <div className="meeting-fullscreen">

                              <Link to={'/' + slugifiedRoom + '/meetings'} target="_blank">
                                <i className="fi-monitor"></i>
                              </Link>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              )
            }
            else {
              return (null)
            }
          }.bind(this))
          : <p id="fb__spinner-wrap"><img id="fb__spinner" alt="Loading..." src="/svgs/spinner.svg" /></p>
        }
      </div>
    );
  }

}

export default Flightboard;
