import React, { Component } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import moment from "moment";
import ReactToolTip from "react-tooltip";
import EventModal from "./EventModal";

export default class Calendar extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      user: {},
      events: [],
      showModal: false,
      modalMode: "add",
      selectedEvent: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadUserEvents();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // ✅ Added missing method
  loadUserEvents = () => {
    axios
      .get("/api/events") // Replace with your actual API endpoint
      .then((response) => {
        if (this._isMounted) {
          this.setState({ events: response.data });
        }
      })
      .catch((error) => {
        console.error("Error loading events:", error);
      });
  };

  handleEventClick = (info) => {
    this.setState({
      selectedEvent: {
        id: info.event.id,
        title: info.event.title,
        description: info.event.extendedProps.description,
        start: info.event.start,
        end: info.event.end,
      },
      showModal: true,
      modalMode: "edit",
    });
  };

  handleEventPositioned = (info) => {
    info.el.setAttribute(
      "title",
      info.event.extendedProps.description || "No description"
    );
    ReactToolTip.rebuild();
  };

  render() {
    return (
      <>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          eventClick={this.handleEventClick}
          dateClick={() => this.setState({ showModal: true, modalMode: "add", selectedEvent: null })}
          events={this.state.events}
          eventPositioned={this.handleEventPositioned}
          customButtons={{
            addEventButton: {
              text: "Add Event",
              click: () =>
                this.setState({
                  showModal: true,
                  modalMode: "add",
                  selectedEvent: null,
                }),
              classNames: "fc-button fc-button-primary",
            },
          }}
          header={{
            left: "prev,next today addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          headerToolbar={{
            left: "prev,next today addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
          }}
        />

        <EventModal
          show={this.state.showModal}
          onHide={() => this.setState({ showModal: false })}
          onSuccess={this.loadUserEvents}
          mode={this.state.modalMode}
          data={this.state.selectedEvent}
        />

        <ReactToolTip />
      </>
    );
  }
}
