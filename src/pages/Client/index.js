import { DASHBOARD_NAME } from "../../config";
import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

import { useNavigate, useLocation, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"
import { getClientsPages, deleteClientById, getClientById, saveClient } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ClientForm from "./ClientForm"

const CLIENT_LIST_SORT_COLUMN = "clientName"
const CLIENT_LIST_SORT_DIR = "asc"

const Client = props => {
  document.title = `Clients | ${DASHBOARD_NAME}`;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const clientId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Client/manage");
  const isEditMode = isFormPage && clientId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(CLIENT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(CLIENT_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Client" : "Create Client");
  const [formData, setFormData] = useState({
    clientId: 0,
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
  });

  // List logic
  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getClientsPages({
        start: 0,
        length: 10,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load clients.");
      }
    } catch (err) {
      setError("Error loading clients.");
    }
    setLoading(false);
  };

 useEffect(() => {
    props.setBreadcrumbItems("Client")
  }, [])


  useEffect(() => {
    if (!isFormPage) {
      loadClients();
    }
  }, [isFormPage, sortColumn, sortColumnDir]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/Client/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this client?")) {
      setDeletingId(id);
      try {
        const response = await deleteClientById(id);
        if (response.isSuccess) {
          showSuccess("Client deleted successfully.");
          loadClients();
        } else {
          showError(response.message || "Failed to delete client.");
        }
      } catch (err) {
        showError("Error deleting client.");
      }
      setDeletingId(0);
    }
  };

  const handleAdd = () => {
    navigate("/Client/manage");
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Client");
      setFormData({
        clientId: 0,
        clientName: "",
        companyName: "",
        email: "",
        phone: "",
        gstNumber: "",
        address: "",
      });
      setFormError("");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getClientById(clientId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Client");
          setFormData(response.data);
        } else {
          setFormError(response?.message || "Failed to load client");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load client"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, clientId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const response = await saveClient(formData);
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        navigate("/Client");
        return;
      }
      throw new Error(response?.message || "Failed to save client");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save client";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Table data
  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Client Name", field: "clientName", sort: "asc" },
          { label: "Company Name", field: "companyName", sort: "asc" },
          { label: "Email", field: "email", sort: "asc" },
          { label: "Phone", field: "phone", sort: "asc" },
     //     { label: "GST Number", field: "gstNumber", sort: "asc" },
          { label: "Address", field: "address", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        clientId: item.clientId,
        clientName: item.clientName || "",
        companyName: item.companyName || "",
        email: item.email || "",
        phone: item.phone || "",
        gstNumber: item.gstNumber || "",
        address: item.address || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => handleEdit(item.clientId)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.clientId}
              onClick={() => handleDelete(item.clientId)}
            >
              {deletingId === item.clientId ? (
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

  // Render (User-style)
  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            formLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <ClientForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/Client")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Client/manage")}> 
                    <i className="mdi mdi-plus me-1" />Add Client
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
                    className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
                    noRecordsFoundLabel={<span style={{display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888'}}>You don't have any record</span>}
                  />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default connect(null, { setBreadcrumbItems })(Client);
