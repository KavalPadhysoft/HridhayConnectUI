import React, { useEffect, useMemo, useState } from "react";
import { showConfirm, showSuccess, showError } from "../../Pop_show/alertService";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { Eye } from "react-feather";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  getPendingPaymentFollowUps,
  getPendingPaymentFollowUpById,
  savePendingPaymentFollowUp,
  deletePendingPaymentFollowUpById,
} from "../../helpers/fakebackend_helper";
import PendingPaymentFollowUpForm from "./PendingPaymentFollowUpForm";
import { formatDateDMY } from "../../utils/dateFormat";

const PendingPaymentFollowUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  // Get invoiceId from query string
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = Number(searchParams.get("invoiceId") || 0);
  const followUpId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/PendingPaymentFollowUp/manage");
  const isEditMode = isFormPage && followUpId > 0;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  // Removed modal state, using alertService instead
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState("statusName");
  const [sortColumnDir, setSortColumnDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    id: 0,
    invoiceId: invoiceId,
    dueDate: "",
    followUpDate: "",
    nextFollowUpDate: "",
    status: "",
    remark: "",
  });

  const loadFollowUps = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingPaymentFollowUps({
        start: page * pageSize,
        length: pageSize,
        sortColumn,
        sortColumnDir,
        searchValue: formData.remark,
        invoiceId,
      });
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

  const handleSortChange = fieldName => {
    setSortColumn(fieldName);
    setSortColumnDir(sortColumnDir === "asc" ? "desc" : "asc");
  };

  const handleDelete = async id => {
    const confirmed = await showConfirm("Are you sure you want to delete this follow-up?", "Delete", "Cancel");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deletePendingPaymentFollowUpById(id);
      showSuccess("Follow-up deleted successfully");
      loadFollowUps();
    } catch (err) {
      showError("Failed to delete follow-up");
    } finally {
      setDeletingId(0);
    }
  };

  const data = useMemo(() => ({
    columns: [
      { label: "Sr.", field: null, sort: "asc" },
      { label: "Due Date", field: "dueDate", sort: "asc" },
      { label: "Follow Up Date", field: "followUpDate", sort: "asc" },
      { label: "Next Follow Up", field: "nextFollowUpDate", sort: "asc" },
    //  { label: "Status", field: "statusName", sort: "asc" },
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
          <Button color="link" className="p-0 text-primary" title="Edit" type="button" onClick={() => navigate(`/PendingPaymentFollowUp/manage/${item.id}?invoiceId=${invoiceId}`)}>
            <i className="mdi mdi-pencil font-size-18" />
          </Button>
          <Button color="link" className="p-0 text-danger" title="Delete" type="button" disabled={deletingId === item.id} onClick={() => handleDelete(item.id)}>
            {deletingId === item.id ? <Spinner size="sm" /> : <i className="mdi mdi-trash-can-outline font-size-18" />}
          </Button>
          <Eye
            style={{ cursor: 'pointer', color: '#8f6ed5' }}
            size={20}
            title="History"
            onClick={() => navigate(`/PendingPaymentHistory?FollowupId=${item.id}&invoiceId=${invoiceId}`)}
          />
        </div>
      ),
    })),
  }), [rows, deletingId, invoiceId]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <h4 className="mb-4">Pending Payment Follow Up</h4>
          {isFormPage ? (
            <PendingPaymentFollowUpForm invoiceId={invoiceId} followUpId={followUpId} />
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3 gap-2">
                  <Button color="secondary" type="button" onClick={() => navigate('/dashboard')}>
                    <i className="mdi mdi-arrow-left me-1" />Back
                  </Button>
                  {/* hide this if rows exist */}
                  {rows.length === 0 && (
                    <Button color="primary" type="button" onClick={() => navigate(`/PendingPaymentFollowUp/manage/0?invoiceId=${invoiceId}`)}>
                      <i className="mdi mdi-plus me-1" />Add Follow Up
                    </Button>
                  )}
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
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PendingPaymentFollowUp;
