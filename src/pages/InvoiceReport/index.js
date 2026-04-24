import React, { useState } from "react";
import { Button, Row, Col, Input, Form, FormGroup, Label } from "reactstrap";
import { GetInvoiceReport } from "../../helpers/fakebackend_helper";

const InvoiceReport = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    clientId: "",
    invoiceType: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        clientId: filters.clientId,
        invoiceType: filters.invoiceType,
        status: filters.status,
      };
      const response = await GetInvoiceReport(params);
      if (response?.isSuccess && response?.statusCode === 1) {
        setData(response.data.data || []);
      } else {
        setError(response?.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Invoice Report</h4>
      <Form onSubmit={handleSearch} className="mb-3">
        <Row form>
          <Col md={2}>
            <FormGroup>
              <Label for="fromDate">From Date</Label>
              <Input type="date" name="fromDate" id="fromDate" value={filters.fromDate} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="toDate">To Date</Label>
              <Input type="date" name="toDate" id="toDate" value={filters.toDate} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="clientId">Client ID</Label>
              <Input type="text" name="clientId" id="clientId" value={filters.clientId} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="invoiceType">Service</Label>
              <Input type="text" name="invoiceType" id="invoiceType" value={filters.invoiceType} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="status">Status</Label>
              <Input type="text" name="status" id="status" value={filters.status} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </Col>
        </Row>
      </Form>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Client Name</th>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Sub Total</th>
              <th>Discount</th>
              <th>Final Amount</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">No data found</td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.invoiceId}>
                  <td>{item.invoiceId}</td>
                  <td>{item.clientName}</td>
                  <td>{item.invoiceNumber}</td>
                  <td>{item.invoiceDate?.split("T")[0]}</td>
                  <td>{item.dueDate?.split("T")[0]}</td>
                  <td>{item.subTotal}</td>
                  <td>{item.discount}</td>
                  <td>{item.finalAmount}</td>
                  <td>{item.statusName}</td>
                  <td>{item.invoiceType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceReport;
