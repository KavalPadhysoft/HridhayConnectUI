import React, { useEffect, useMemo, useState } from "react";
import { Alert, Card, CardBody, Col, Row, Spinner, Button } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useLocation, useNavigate } from "react-router-dom";
import { get } from "../../helpers/api_helper";
import { formatDateDMY } from "../../utils/dateFormat";

const PendingPaymentHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get FollowupId and invoiceId from query string
  const searchParams = new URLSearchParams(location.search);
  const followUpId = Number(searchParams.get("FollowupId") || 0);
  const invoiceId = Number(searchParams.get("invoiceId") || 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState("followUpDate");
  const [sortColumnDir, setSortColumnDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadPaymentHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await get(`/PaymentFollowUp/GetAllPaymentHistory?start=${page * pageSize}&length=${pageSize}&sortColumnDir=${sortColumnDir}&FollowupId=${followUpId}`);
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load payment history");
      }
      setRows(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err?.message || err || "Failed to load payment history");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, [page, pageSize, sortColumn, sortColumnDir, followUpId]);

  const handleSortChange = fieldName => {
    setSortColumn(fieldName);
    setSortColumnDir(sortColumnDir === "asc" ? "desc" : "asc");
  };

  const data = useMemo(() => ({
    columns: [
      { label: "Sr.No", field: null, sort: "asc" },
      { label: "Due Date", field: "dueDate", sort: "asc" },
      { label: "Follow Up Date", field: "followUpDate", sort: "asc" },
      { label: "Next Follow Up", field: "nextFollowUpDate", sort: "asc" },
   //   { label: "Status", field: "statusName", sort: "asc" },
      { label: "Remark", field: "remark", sort: "asc" },
    ],
    rows: rows.map((item, idx) => ({
      ...item,
      dueDate: formatDateDMY(item.dueDate),
      followUpDate: formatDateDMY(item.followUpDate),
      nextFollowUpDate: formatDateDMY(item.nextFollowUpDate),
    })),
  }), [rows]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Pending Payment History</h4>
           
          </div>
          <Card>
            <CardBody>
                  <div className="d-flex justify-content-end mb-3 gap-2">
                                    <Button color="secondary" type="button" onClick={() => navigate(`/PendingPaymentFollowUp?invoiceId=${invoiceId}`)}>
                    <i className="mdi mdi-arrow-left me-1" />Back
                  </Button>
                                </div>

              {error ? <Alert color="danger">{error}</Alert> : null}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                </div>
              ) : (
                rows.length === 0 ? (
                  <div className="text-center py-5">No records found.</div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PendingPaymentHistory;
