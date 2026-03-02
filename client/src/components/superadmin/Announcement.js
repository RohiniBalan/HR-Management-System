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

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announcements: [],
      title: "",
      description: "",
      selectedCollege: "",
      hasError: false,
      errorMsg: "",
      isLoading: false,
      isSubmitting: false,
      completed: false,
      showDeleteModal: false,
      announcementToDelete: null,
      showSuccessAlert: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.setState({ isLoading: true, hasError: false });

    axios
      .get("/api/collegeAnnouncements", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        this.setState({
          announcements: res.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg:
            err.response?.data?.message || "Failed to load announcements",
          isLoading: false,
        });
      });
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ isSubmitting: true, hasError: false });

    const { title, description, selectedCollege } = this.state;
    const userId = JSON.parse(localStorage.getItem("user"))?.id;

    if (!userId || !selectedCollege) {
      this.setState({
        hasError: true,
        errorMsg: "User information or college not selected",
        isSubmitting: false,
      });
      return;
    }

    const data = {
      announcementTitle: title,
      announcementDescription: description,
      createdByUserId: userId,
      college: selectedCollege,
    };

    axios
      .post("/api/collegeAnnouncements", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        this.setState({
          completed: true,
          isSubmitting: false,
          showSuccessAlert: true,
          title: "",
          description: "",
          selectedCollege: "",
        });
        this.fetchData();
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg:
            err.response?.data?.message || "Failed to create announcement",
          isSubmitting: false,
        });
      });
  };

  handleDeleteClick = (announcement) => {
    this.setState({
      showDeleteModal: true,
      announcementToDelete: announcement,
    });
  };

  handleDeleteConfirm = () => {
    const { announcementToDelete } = this.state;

    axios
      .delete(`/api/collegeAnnouncements/${announcementToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        this.setState({
          showDeleteModal: false,
          showSuccessAlert: true,
          announcementToDelete: null,
        });
        this.fetchData();
      })
      .catch((err) => {
        this.setState({
          hasError: true,
          errorMsg:
            err.response?.data?.message || "Failed to delete announcement",
          showDeleteModal: false,
        });
      });
  };

  handleDeleteCancel = () => {
    this.setState({
      showDeleteModal: false,
      announcementToDelete: null,
    });
  };

  renderCollegeOptions = () => {
    return COLLEGES.map((college) => (
      <option key={college} value={college}>
        {college}
      </option>
    ));
  };

  render() {
    const theme = createMuiTheme({
      overrides: {
        MuiTableCell: {
          root: {
            padding: "6px 6px 6px 6px",
          },
        },
      },
    });

    return (
      <div className="container-fluid pt-2">
        {/* Success Alert */}
        {this.state.showSuccessAlert && (
          <Alert
            variant="success"
            onClose={() => this.setState({ showSuccessAlert: false })}
            dismissible
          >
            Announcement published successfully!
          </Alert>
        )}

        {/* Error Alert */}
        {this.state.hasError && (
          <Alert
            variant="danger"
            onClose={() => this.setState({ hasError: false })}
            dismissible
          >
            {this.state.errorMsg}
          </Alert>
        )}

        {/* Add Announcement Form */}
        <div className="row">
          <div className="col-sm-12">
            <Card className="main-card">
              <Card.Header>
                <strong>Add College Announcement</strong>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={this.state.title}
                      onChange={this.handleChange}
                      name="title"
                      required
                      maxLength={100}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={this.state.description}
                      onChange={this.handleChange}
                      name="description"
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>College</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.selectedCollege}
                      onChange={this.handleChange}
                      name="selectedCollege"
                      required
                    >
                      <option value="">Choose one...</option>
                      {this.renderCollegeOptions()}
                    </Form.Control>
                  </Form.Group>
                  <Button
                    type="submit"
                    size="sm"
                    className="mt-1"
                    disabled={this.state.isSubmitting}
                  >
                    {this.state.isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                        />
                        <span className="ml-2">Publishing...</span>
                      </>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
