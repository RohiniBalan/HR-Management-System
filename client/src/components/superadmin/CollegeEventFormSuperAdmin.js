import React, { Component } from "react";
import { Card, Button, Form, Alert, Spinner, Modal } from "react-bootstrap";
import axios from "axios";
import MaterialTable from "material-table";
import { ThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";

const COLLEGES = [
  "Engineering",
  "Pharmacy",
  "Nursing",
  "Allied_Health_Science",
  "Medical_Science_Research",
  "Educational Institution",
];

export default class EventManagement extends Component {
  state = {
    events: [],
    eventName: "",
    eventDescription: "",
    startDate: "",
    endDate: "",
    selectedCollege: "",
    hasError: false,
    errorMsg: "",
    isLoading: false,
    isSubmitting: false,
    showDeleteModal: false,
    eventToDelete: null,
    showSuccessAlert: false,
  };

  componentDidMount() {
    this.fetchEvents();
  }

  fetchEvents = () => {
    this.setState({ isLoading: true, hasError: false });

    axios
      .get("/api/collegeEvents", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        this.setState({ events: res.data, isLoading: false });
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg: err.response?.data?.message || "Failed to load events",
          isLoading: false,
        });
      });
  };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { eventName, eventDescription, startDate, endDate, selectedCollege } =
      this.state;
    const createdByUserId = JSON.parse(localStorage.getItem("user"))?.id;

    if (
      !eventName ||
      !startDate ||
      !endDate ||
      !selectedCollege ||
      !createdByUserId
    ) {
      this.setState({
        hasError: true,
        errorMsg: "All fields are required",
        isSubmitting: false,
      });
      return;
    }

    this.setState({ isSubmitting: true });

    axios
      .post(
        "/api/collegeEvents",
        {
          eventName,
          eventDescription,
          startDate,
          endDate,
          college: selectedCollege,
          createdByUserId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then(() => {
        this.setState({
          showSuccessAlert: true,
          isSubmitting: false,
          eventName: "",
          eventDescription: "",
          startDate: "",
          endDate: "",
          selectedCollege: "",
        });
        this.fetchEvents();
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg: err.response?.data?.message || "Failed to create event",
          isSubmitting: false,
        });
      });
  };

  handleDeleteClick = (event) =>
    this.setState({ showDeleteModal: true, eventToDelete: event });

  handleDeleteConfirm = () => {
    axios
      .delete(`/api/collegeEvents/${this.state.eventToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        this.setState({
          showDeleteModal: false,
          showSuccessAlert: true,
          eventToDelete: null,
        });
        this.fetchEvents();
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg: err.response?.data?.message || "Failed to delete event",
          showDeleteModal: false,
        });
      });
  };

  renderCollegeOptions = () =>
    COLLEGES.map((college) => (
      <option key={college} value={college}>
        {college}
      </option>
    ));

  render() {
    const theme = createMuiTheme({
      overrides: {
        MuiTableCell: { root: { padding: "6px" } },
      },
    });

    return (
      <div className="container-fluid pt-2">
        {this.state.showSuccessAlert && (
          <Alert
            variant="success"
            onClose={() => this.setState({ showSuccessAlert: false })}
            dismissible
          >
            Event operation successful!
          </Alert>
        )}

        {this.state.hasError && (
          <Alert
            variant="danger"
            onClose={() => this.setState({ hasError: false })}
            dismissible
          >
            {this.state.errorMsg}
          </Alert>
        )}

        <div className="row">
          <div className="col-sm-12">
            <Card className="main-card">
              <Card.Header>
                <strong>Add College Event</strong>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group>
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="eventName"
                      value={this.state.eventName}
                      onChange={this.handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="eventDescription"
                      value={this.state.eventDescription}
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={this.state.startDate}
                      onChange={this.handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={this.state.endDate}
                      onChange={this.handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>College</Form.Label>
                    <Form.Control
                      as="select"
                      name="selectedCollege"
                      value={this.state.selectedCollege}
                      onChange={this.handleChange}
                      required
                    >
                      <option value="">Select College</option>
                      {this.renderCollegeOptions()}
                    </Form.Control>
                  </Form.Group>
                  <div className="mt-3">
                    <Button type="submit" disabled={this.state.isSubmitting}>
                      {this.state.isSubmitting
                        ? "Publishing..."
                        : "Publish Event"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
