
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import { getTermsList, getTermsById, saveTerms, deleteTermsById } from "../../helpers/fakebackend_helper";
import { showSuccess } from "../../Pop_show/alertService";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import TermsForm from "./TermsForm";

const TERMS_LIST_SORT_COLUMN = "terms";
const TERMS_LIST_SORT_DIR = "asc";

const Terms = (props) => {
  document.title = "Terms | Lexa - Responsive Bootstrap 5 Admin Dashboard";

  useEffect(() => {
    props.setBreadcrumbItems("Terms");
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const termsId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Terms/manage");
  const isEditMode = isFormPage && termsId > 0;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(TERMS_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(TERMS_LIST_SORT_DIR);
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Terms" : "Create Terms");

  // Update form title when switching between create/edit
  useEffect(() => {
    setFormTitle(isEditMode ? "Edit Terms" : "Create Terms");
  }, [isEditMode]);
  const [formData, setFormData] = useState({
    id: 0,
    terms: "",
    displaySeqNo: 0,
  });

  const loadTerms = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getTermsList({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      });
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load terms");
      }
      const list = response?.data?.data || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || err || "Failed to load terms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFormPage) loadTerms();
  }, [isFormPage, sortColumn, sortColumnDir]);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getTermsById(termsId)
        .then(res => {
          if (res?.isSuccess && res?.data) {
            setFormData({ ...res.data });
          } else {
            setFormError(res?.message || "Failed to load data");
          }
        })
        .catch(err => setFormError(err?.message || err))
        .finally(() => setLoading(false));
    } else {
      setFormData({
        id: 0,
        terms: "",
        displaySeqNo: 0,
      });
    }
  }, [isEditMode, termsId]);

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Terms", field: "terms", sort: "asc" },
          { label: "Display Seq No", field: "displaySeqNo", sort: "asc" },
      //    { label: "Active", field: "isActive", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        terms: item.terms || "",
        displaySeqNo: item.displaySeqNo ?? 0,
      //  isActive: item.isActive ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Terms/manage/${item.id}`)}
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
  }, [rows, sortColumn, sortColumnDir, deletingId, navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    setDeletingId(id);
    try {
      const res = await deleteTermsById(id);
      if (res?.isSuccess) {
        await loadTerms();
      } else {
        setError(res?.message || "Delete failed");
      }
    } catch (err) {
      setError(err?.message || err);
    } finally {
      setDeletingId(0);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await saveTerms(formData);
      if (res?.isSuccess) {
        await showSuccess(res?.message || "Terms saved successfully");
        navigate("/Terms");
      } else {
        setFormError(res?.message || "Save failed");
      }
    } catch (err) {
      setFormError(err?.message || err);
    } finally {
      setSaving(false);
    }
  };

  if (isFormPage) {
    return (
      <TermsForm
        title={formTitle}
        formError={formError}
        formData={formData}
        isEditMode={isEditMode}
        saving={saving}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/Terms")}
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/Terms/manage")}> 
            <i className="mdi mdi-plus me-1" />Add Terms
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
  );
};

export default connect(null, { setBreadcrumbItems })(Terms);
