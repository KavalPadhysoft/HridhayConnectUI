import { DASHBOARD_NAME } from "../../config";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner, Input, Form, FormGroup, Label } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { GetInvoiceReport } from "../../helpers/fakebackend_helper";
import { formatDateDMY } from "../../utils/dateFormat";
import Select from "react-select";
import { InvoicereportExportToExcel, InvoicereportExportToPdf } from "../../helpers/fakebackend_helper";
import { getClientDropdownList, getLovDropdownList } from "../../helpers/api_helper";
const INVOICE_REPORT_SORT_COLUMN = "invoiceDate";
const INVOICE_REPORT_SORT_DIR = "desc";

const InvoiceReport = props => {
  document.title = `Invoice Report | ${DASHBOARD_NAME}`;

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
  const [sortColumn, setSortColumn] = useState(INVOICE_REPORT_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(INVOICE_REPORT_SORT_DIR);
const [statusList, setStatusList] = useState([]);
const [hasSearched, setHasSearched] = useState(false);
const [serviceList, setServiceList] = useState([]);

  const [clientList, setClientList] = useState([]);


// export to excel
const handleExport = async () => {
  try {
    const response = await InvoicereportExportToExcel({
      start: 0,
      length: 1000,
      sortColumn,
      sortColumnDir,
      searchValue: "",

      // ✅ ADD THESE
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
      clientId: filters.clientId || null,
      invoiceType: filters.invoiceType || null,
      status: filters.status || null,
    });

    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "InvoiceReport.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed", err);
  }
};
// pdf
const handleExportPdf = async () => {
  try {
    const response = await InvoicereportExportToPdf({
      start: 0,
      length: 1000,
      sortColumn,
      sortColumnDir,
      searchValue: "",

      // ✅ ADD THESE
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
      clientId: filters.clientId || null,
      invoiceType: filters.invoiceType || null,
      status: filters.status || null,
    });

    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "InvoiceReport.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF export failed", err);
  }
};

  useEffect(() => {
    props.setBreadcrumbItems("Invoice Report");
  }, []);

useEffect(() => {
  // Status
  getLovDropdownList("InvoiceStatus")
    .then((res) => {
      if (res.isSuccess && Array.isArray(res.data)) {
        setStatusList(res.data);
      } else {
        setStatusList([]);
      }
    })
    .catch(() => setStatusList([]));

  // Client
  getClientDropdownList()
    .then((res) => {
      if (res.isSuccess && Array.isArray(res.data)) {
        console.log("Client API res.data:", res.data);
        setClientList(res.data);
      } else {
        setClientList([]);
      }
    })
    .catch(() => setClientList([]));

}, []);

  useEffect(() => {
  getLovDropdownList("InvoiceType")
    .then((res) => {
      if (res.isSuccess && Array.isArray(res.data)) {
        setServiceList(res.data);
         console.log("Status API res.data:", res.data); 
                  console.log("Status API res:", res); 
      } else {
        setServiceList([]);
      }
    })
    .catch(() => setServiceList([]));
}, []);


  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);
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

  const tableData = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
      //    { label: "Invoice ID", field: "invoiceId", sort: "asc" },
          { label: "Client Name", field: "clientName", sort: "asc" },
          { label: "Invoice Number", field: "invoiceNumber", sort: "asc" },
          { label: "Invoice Date", field: "invoiceDate", sort: "asc" },
          { label: "Due Date", field: "dueDate", sort: "asc" },
          { label: "Sub Total", field: "subTotal", sort: "asc" },
          { label: "Discount", field: "discount", sort: "asc" },
          { label: "Final Amount", field: "finalAmount", sort: "asc" },
          { label: "Status", field: "statusName", sort: "asc" },
          { label: "Type", field: "invoiceTypeName", sort: "asc" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir: sortColumnDir,
      }),
      rows: data.map(item => ({
        ...item,
        invoiceDate: item.invoiceDate ? formatDateDMY(item.invoiceDate) : "",
        dueDate: item.dueDate ? formatDateDMY(item.dueDate) : "",
      })),
    });
  }, [data, sortColumn, sortColumnDir]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>

              <Form onSubmit={handleSearch} className="mb-3">
<Row>
  <Col md={2}>
    <FormGroup>
      <Label>From Date</Label>
      <Input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} />
    </FormGroup>
  </Col>

  <Col md={2}>
    <FormGroup>
      <Label>To Date</Label>
      <Input type="date" name="toDate" value={filters.toDate} onChange={handleChange} />
    </FormGroup>
  </Col>

  <Col md={2}>
    <FormGroup>
     <Label>Client</Label>
<Select
  classNamePrefix="select2-selection"
  placeholder="Select Client"
  options={clientList.map(item => ({
    value: item.id,
    label: item.name
  }))}

  value={clientList
    .map(item => ({
      value: item.id,
      label: item.name
    }))
    .find(option => option.value === filters.clientId) || null}

  onChange={(selected) =>
    setFilters(prev => ({
      ...prev,
      clientId: selected ? selected.value : ""
    }))
  }

  isClearable
/>
      {/* <Input type="text" name="clientId" value={filters.clientId} onChange={handleChange} /> */}
    </FormGroup>
  </Col>

<Col md={2}>
  <FormGroup>
    <Label>Service</Label>
   <Select
  classNamePrefix="select2-selection"
  placeholder="Select Service"
  options={serviceList.map(item => ({
    value: item.code,
    label: item.name
  }))}
  value={serviceList
    .map(item => ({ value: item.code, label: item.name }))
    .find(option => option.value === filters.invoiceType) || null}
  onChange={(selected) =>
    setFilters(prev => ({
      ...prev,
      invoiceType: selected ? selected.value : ""
    }))
  }
  isClearable
/>
  </FormGroup>
</Col>

  <Col md={2}>
    <FormGroup>
      <Label>Status</Label>
    <Select
  classNamePrefix="select2-selection"
  placeholder="Select Status"
  options={statusList.map(item => ({
    value: item.code,
    label: item.name
  }))}
  value={statusList
    .map(item => ({ value: item.code, label: item.name }))
    .find(option => option.value === filters.status) || null}
  onChange={(selected) =>
    setFilters(prev => ({
      ...prev,
      status: selected ? selected.value : ""
    }))
  }
  isClearable
/>
    </FormGroup>
  </Col>

<Col md={2}>
  <FormGroup>
    <Label>&nbsp;</Label> {/* empty label for alignment */}

    <Button
      color="primary"
      type="submit"
      disabled={loading}
      className="w-100"
      style={{
        height: "38px",        // same as input
        borderRadius: "0.375rem"
      }}
    >
      {loading ? "Searching..." : "Search"}
    </Button>
  </FormGroup>
</Col>
</Row>
              </Form>
{hasSearched && data.length > 0 && (
  <div className="d-flex justify-content-end mb-3">
    <Button color="success" className="me-2" onClick={handleExport}>
      <i className="mdi mdi-file-excel me-1" />
      Export Excel
    </Button>

    <Button color="danger" className="me-2" onClick={handleExportPdf}>
      <i className="mdi mdi-file-pdf me-1" />
      Export PDF
    </Button>
  </div>
)}
              {error && <Alert color="danger">{error}</Alert>}
             {hasSearched && (
  <>
    {loading ? (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    ) : (
      <MDBDataTable
        striped
        bordered
        small
        noBottomColumns
        data={tableData}
        className={data && data.length > 0 ? "table-auto-sr" : undefined}
        noRecordsFoundLabel={
          <span style={{ display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888' }}>
            You don't have any record
          </span>
        }
      />
    )}
  </>
)}
            
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(InvoiceReport);