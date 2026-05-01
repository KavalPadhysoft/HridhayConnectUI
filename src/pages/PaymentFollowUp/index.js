import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { get, post, getLovDropdownList,del } from "../../helpers/api_helper";
import PaymentFollowUpForm from "./PaymentFollowUpForm";
import { formatDateDMY } from "../../utils/dateFormat";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";

const PaymentFollowUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  // Get invoiceId from query string
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = Number(searchParams.get("invoiceId") || 0);
  const followUpId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/PaymentFollowUp/manage");
  const isEditMode = isFormPage && followUpId > 0;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [dueDaysList, setDueDaysList] = useState([]);
  const [sortColumn, setSortColumn] = useState("createdDate");
  const [sortColumnDir, setSortColumnDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    id: 0,
    invoiceId: invoiceId,
    dueDate: "",
    followUpDate: "",
    status: "1",
    remark: "",
  });

  const loadFollowUps = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await get(`/PaymentFollowUp/GetAll?start=${page * pageSize}&length=${pageSize}&sortColumn=${sortColumn}&sortColumnDir=${sortColumnDir}&searchValue=status&invoiceId=${invoiceId}`);
      console.log("PaymentFollowUp API response", response);
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load follow-ups");
      }
      setRows(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err?.message || err || "Failed to load follow-ups");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFormPage) {
      loadFollowUps();
    }
  }, [isFormPage, page, pageSize, sortColumn, sortColumnDir, invoiceId]);

  useEffect(() => {
    getLovDropdownList("duedays")
      .then((res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          setDueDaysList(res.data);
        } else {
          setDueDaysList([]);
        }
      })
      .catch(() => setDueDaysList([]));
  }, []);

  const handleSortChange = fieldName => {
    setSortColumn(fieldName);
    setSortColumnDir(sortColumnDir === "asc" ? "desc" : "asc");
  };

  const handleDelete = async id => {
    if (!await showConfirm("Are you sure you want to delete this follow-up?")) return;
    setDeletingId(id);
    try {
      await del (`/PaymentFollowUp/Delete?id=${id}`);
      await showSuccess("Follow-up deleted successfully.");
      loadFollowUps();
    } catch (err) {
      await showError("Failed to delete follow-up");
    } finally {
      setDeletingId(0);
    }
  };

  const data = useMemo(() => ({
    columns: [
      { label: "Sr.No", field: null, sort: "asc" },
       { label: "Due Date", field: "dueDate", sort: "asc" },
      { label: "Follow Up Date", field: "followUpDate", sort: "asc" },
      { label: "Next Follow Up", field: "nextFollowUpDate", sort: "asc" },
     // { label: "Status", field: "statusName", sort: "asc" },
      { label: "Remark", field: "remark", sort: "asc" },
      { label: "Action", field: "action", sort: "disabled" },
    ],  
    rows: rows.map((item, idx) => ({
      ...item,
      dueDate: formatDateDMY(item.dueDate),
      followUpDate: formatDateDMY(item.followUpDate),
      nextFollowUpDate: formatDateDMY(item.nextFollowUpDate),
      action: (
        <div className="d-flex gap-2 justify-content-center">
          {/* <Button color="link" className="p-0 text-primary" title="Edit" type="button" onClick={() => navigate(`/PaymentFollowUp/manage/${item.id}?invoiceId=${invoiceId}`)}>
            <i className="mdi mdi-pencil font-size-18" />
          </Button> */}
          <Button color="link" className="p-0 text-danger" title="Delete" type="button" disabled={deletingId === item.id} onClick={() => handleDelete(item.id)}>
            {deletingId === item.id ? <Spinner size="sm" /> : <i className="mdi mdi-trash-can-outline font-size-18" />}
          </Button>
        </div>
      ),
    })),
  }), [rows, deletingId, invoiceId]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {/* <h4 className="mb-4">Payment FollowUp</h4> */}
          {isFormPage ? (
            <PaymentFollowUpForm invoiceId={invoiceId} followUpId={followUpId} dueDaysList={dueDaysList} />
          ) : (
            <Card>
              <CardBody>
                    <h5 >
      Payment FollowUp
    </h5>
                <div className="d-flex justify-content-end mb-3 gap-2">
                  <Button color="secondary" type="button" onClick={() => navigate('/dashboard')}>
                    <i className="mdi mdi-arrow-left me-1" />Back
                  </Button>
                  <Button color="primary" type="button" onClick={() => navigate(`/PaymentFollowUp/manage/0?invoiceId=${invoiceId}`)}>
                    <i className="mdi mdi-plus me-1" />Add Follow Up
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
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
                  data={data}
                  className={
                    rows && rows.length > 0 ? "table-auto-sr" : undefined
                  }
                  noRecordsFoundLabel={
                    <span
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#888",
                      }}
                    >
                      You don't have any record
                    </span>
                  }
                />
              )}

            </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PaymentFollowUp;
