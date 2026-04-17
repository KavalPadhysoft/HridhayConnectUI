import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";



import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getAdvancePaymentsPages, deleteAdvancePaymentById, getAdvancePaymentById, saveAdvancePayment, getClientsPages } from "../../helpers/fakebackend_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import AdvancePaymentForm from "./AdvancePaymentForm";
import axios from "axios";
import { getClientDropdownList, getLovDropdownList } from "../../helpers/api_helper";

const ADVANCE_PAYMENT_LIST_SORT_COLUMN = "id";
const ADVANCE_PAYMENT_LIST_SORT_DIR = "asc";

const AdvancePayment = props => {
  document.title = "Advance Payment | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const advancePaymentId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/AdvancePayment/manage");
  const isEditMode = isFormPage && advancePaymentId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(ADVANCE_PAYMENT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(ADVANCE_PAYMENT_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Advance Payment" : "Create Advance Payment");
  const [formData, setFormData] = useState({
    id: 0,
    clientId: 0,
    totalAmount: 0,
    remainingAmount: 0,
    status: ""
  });

  // Client dropdown state
  const [clientList, setClientList] = useState([]);
  const [clientListLoading, setClientListLoading] = useState(false);

  // Status dropdown state
  const [statusList, setStatusList] = useState([]);
  const [statusListLoading, setStatusListLoading] = useState(false);

  useEffect(() => {
    if (isFormPage) {
      setClientListLoading(true);
      getClientDropdownList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setClientList(res.data);
          } else {
            setClientList([]);
          }
        })
        .catch(() => setClientList([]))
        .finally(() => setClientListLoading(false));

      setStatusListLoading(true);
      getLovDropdownList("AdvancePaymentStatus")
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setStatusList(res.data);
          } else {
            setStatusList([]);
          }
        })
        .catch(() => setStatusList([]))
        .finally(() => setStatusListLoading(false));
    }
  }, [isFormPage]);

  // List logic
  const loadAdvancePayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdvancePaymentsPages({
        start: 0,
        length: 10,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Advance Payments.");
      }
    } catch (err) {
      setError("Error loading Advance Payments.");
    }
    setLoading(false);
  };

 useEffect(() => {
    props.setBreadcrumbItems("Advance Payment")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadAdvancePayments();
    }
  }, [isFormPage, sortColumn, sortColumnDir]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/AdvancePayment/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this Advance Payment?")) {
      setDeletingId(id);
      try {
        const response = await deleteAdvancePaymentById(id);
        if (response.isSuccess) {
          await showSuccess(response.message || "Advance Payment deleted successfully.");
          setTimeout(() => loadAdvancePayments(), 600);
        } else {
          await showError(response.message || "Failed to delete Advance Payment.");
        }
      } catch (err) {
        await showError("Error deleting Advance Payment.");
      }
      setDeletingId(0);
    }
  };

  const handleAdd = () => {
    navigate("/AdvancePayment/manage");
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Advance Payment");
      setFormData({
        id: 0,
        clientId: 0,
        totalAmount: 0,
        remainingAmount: 0,
        status: ""
      });
      setFormError("");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getAdvancePaymentById(advancePaymentId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Advance Payment");
          setFormData({ ...response.data });
        } else {
          setFormError(response?.message || "Failed to load Advance Payment");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Advance Payment"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, advancePaymentId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      let payload = { ...formData };
      // On add, set status to 1
      if (!isEditMode) {
        payload.status = "1";
      }
      const response = await saveAdvancePayment(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        setTimeout(() => navigate("/AdvancePayment"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Advance Payment");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Advance Payment";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClientChange = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option ? option.value : "",
    }));
  };

  const handleStatusChange = (option) => {
    setFormData(prev => ({
      ...prev,
      status: option ? option.value : "",
    }));
  };

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Client Name", field: "clientName", sort: "asc" },
          { label: "Total Amount", field: "totalAmount", sort: "asc" },
          { label: "Remaining Amount", field: "remainingAmount", sort: "asc" },
          { label: "Status", field: "statusName", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        clientName: item.clientName || "",
        totalAmount: item.totalAmount ?? 0,
        remainingAmount: item.remainingAmount ?? 0,
        statusName: item.statusName || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => handleEdit(item.id)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              {deletingId === item.id ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    });
  }, [rows, sortColumn, sortColumnDir, deletingId]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            formLoading || clientListLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <AdvancePaymentForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/AdvancePayment")}
                clientList={clientList}
                onClientChange={handleClientChange}
                statusList={statusList}
                onStatusChange={handleStatusChange}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={handleAdd}>
                    <i className="mdi mdi-plus me-1" />Add Advance Payment
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AdvancePayment);

