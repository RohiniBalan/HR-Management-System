import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Card, Button, 
  Dropdown, Pagination, Form, Alert 
} from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import OnboardingDetail from './OnboardingDetail';
import AssetAllocation from './AssetAllocation';
import { useHistory } from 'react-router-dom';

const OnboardingList = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ 
    key: 'requestDate', 
    direction: 'desc' 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDetail, setViewDetail] = useState(false);
  const [viewAssetAllocation, setViewAssetAllocation] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const history = useHistory();

  const authConfig = {
    headers: { 
      Authorization: `Bearer ${localStorage.getItem("token")}` 
    }
  };

  // Fetch data with filters
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/onboarding/requests?filter=${filter}&sort=${sortConfig.key}&order=${sortConfig.direction}&page=${pagination.currentPage}`,
        authConfig
      );
      setRequests(res.data.requests || []);
      setPagination({
        currentPage: res.data.currentPage || 1,
        totalPages: res.data.totalPages || 1,
        total: res.data.total || 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch requests');
      setRequests([]);
    }
  }, [filter, sortConfig, pagination.currentPage, authConfig]);
  
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handler functions for navigation
  const onViewDetail = (request) => (e) => {
    e.preventDefault();
    history.push(`/onboarding-detail/${request.id}`);
  };

  const onAssignAssets = (request) => (e) => {
    e.preventDefault();
    setSelectedRequest(request);
    setViewAssetAllocation(true);
  };

  // Handle checkbox changes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(requests.map(request => request.id));
      setIsAllSelected(true);
    } else {
      setSelectedRows([]);
      setIsAllSelected(false);
    }
  };

  const handleSelectRow = (e, id) => {
    if (e.target.checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
      setIsAllSelected(false);
    }
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Bulk complete
  const handleBulkComplete = async () => {
    try {
      // Since there's no bulk complete endpoint, we'll complete each request individually
      const promises = selectedRows.map(id => 
        axios.patch(`/api/onboarding/requests/${id}/complete`, {}, authConfig)
      );
      
      await Promise.all(promises);
      
      setSelectedRows([]);
      setIsAllSelected(false);
      setSuccess(`${selectedRows.length} request(s) completed successfully`);
      setTimeout(() => setSuccess(null), 3000);
      fetchRequests();
    } catch (err) {
      console.error('Error completing requests:', err);
      setError(err.response?.data?.message || 'Failed to complete requests');
    }
  };

  // Handle single completion
  const handleComplete = async (id) => {
    try {
      await axios.patch(`/api/onboarding/requests/${id}/complete`, {}, authConfig);

      setSuccess('Request completed successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchRequests();
    } catch (err) {
      console.error('Error completing request:', err);
      setError(err.response?.data?.message || 'Failed to complete request');
    }
  };

  if (viewDetail) {
    return (
      <OnboardingDetail 
        request={selectedRequest} 
        onBack={() => setViewDetail(false)}
      />
    );
  }

  if (viewAssetAllocation) {
    return (
      <AssetAllocation 
        userId={selectedRequest.userId} 
        onBack={() => setViewAssetAllocation(false)}
      />
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3" onClose={() => setError(null)} dismissible>
        {error}
      </Alert>
    );
  }

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5>Pending Onboarding</h5>
          <small className="text-muted">
            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
          </small>
        </div>
        
        <div>
          <Dropdown className="d-inline me-2">
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilter('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter('high')}>High Priority</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>

      <Card.Body>
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}

        {selectedRows.length > 0 && (
          <div className="mb-3 p-2 bg-light rounded d-flex align-items-center">
            <span className="me-3">{selectedRows.length} selected</span>
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleBulkComplete}
              className="me-2"
            >
              Complete Selected
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => {
                setSelectedRows([]);
                setIsAllSelected(false);
              }}
            >
              Clear Selection
            </Button>
          </div>
        )}

        <Table striped hover responsive>
          <thead>
            <tr>
              <th>
                <Form.Check 
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('employee.fullName')}>
                Employee {sortConfig.key === 'employee.fullName' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th onClick={() => handleSort('requestDate')}>
                Requested {sortConfig.key === 'requestDate' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}
              </th>
              <th>Requested By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map(request => (
                <tr key={request.id}>
                  <td>
                    <Form.Check 
                      type="checkbox"
                      checked={selectedRows.includes(request.id)}
                      onChange={(e) => handleSelectRow(e, request.id)}
                    />
                  </td>
                  <td>
                    <div>{request.employee?.fullName || 'N/A'}</div>
                    <small className="text-muted">
                      User ID: {request.userId}
                    </small>
                  </td>
                  <td>
                    {moment(request.requestDate).format('MMM D, YYYY')}
                    <div className="text-muted small">
                      {moment(request.requestDate).fromNow()}
                    </div>
                  </td>
                  <td>
                    {request.requester?.fullName || 'System'}
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="link" size="sm" id={`actions-${request.id}`}>
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={onViewDetail(request)}>
                          View Details
                        </Dropdown.Item>
                        <Dropdown.Item onClick={onAssignAssets(request)}>
                          Assign Assets
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleComplete(request.id)}>
                          Mark Complete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No pending onboarding requests found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {requests.length > 0 && (
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev 
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage - 1}))}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item 
                key={page}
                active={page === pagination.currentPage}
                onClick={() => setPagination(prev => ({...prev, currentPage: page}))}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage + 1}))}
            />
          </Pagination>
        )}
      </Card.Body>
    </Card>
  );
};

export default OnboardingList;