import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Alert, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate } from "react-router-dom";
import { getCompanyMastersList, deleteCompanyMasterById } from "../../helpers/fakebackend_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

const CompanyMasterTable = (props) => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [deletingId, setDeletingId] = useState(0);
	const navigate = useNavigate();

	const fetchData = async () => {
		setLoading(true);
		setError("");
		try {
			const params = { start: 0, length: 100, sortColumnDir: "asc" };
			const res = await getCompanyMastersList(params);
            console.log("CompanyMasters API response", res);
						let list = [];
						if (Array.isArray(res)) {
							list = res;
						} else if (res && Array.isArray(res.data)) {
							list = res.data;
						} else if (res && res.data && Array.isArray(res.data.data)) {
							list = res.data.data;
						} else if (Array.isArray(res.items)) {
							list = res.items;
						}
						setRows(list);
		} catch (err) {
			setError("Failed to load company masters");
			setRows([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		props.setBreadcrumbItems("Company Master");
		fetchData();
	}, []);

	const handleDelete = async id => {
		const isConfirmed = await showConfirm("Are you sure you want to delete this company?", "Delete", "Cancel");
		if (!isConfirmed) return;
		setDeletingId(id);
		try {
			const response = await deleteCompanyMasterById(id);
			if (response?.isSuccess || response?.statusCode === 1) {
				await showSuccess(response?.message || "Company deleted successfully.");
				fetchData();
			} else {
				await showError(response?.message || "Failed to delete company");
			}
		} catch (err) {
			await showError(err?.message || "Failed to delete company");
		} finally {
			setDeletingId(0);
		}
	};

	const data = useMemo(() => ({
		columns: [
			{ label: "Sr.No", field: "NULL", sort: "disabled" },
            { label: "Account No", field: "accountNo", sort: "asc" },
			{ label: "Account Name", field: "accountName", sort: "asc" },
			{ label: "Bank", field: "bank", sort: "asc" },
			{ label: "IFSC", field: "ifscCode", sort: "asc" },
			{ label: "PAN", field: "pan", sort: "asc" },
			{ label: "Mobile", field: "mobile", sort: "asc" },
			{ label: "Email", field: "email", sort: "asc" },
			{ label: "Address", field: "address", sort: "asc" },
			{ label: "Action", field: "action", sort: "disabled" },
		],
		rows: rows.map(item => ({
			...item,
			action: (
				<div className="d-flex gap-2 justify-content-center">
					<Button color="link" className="p-0 text-primary" title="Edit" type="button" onClick={() => navigate(`/company-master/edit/${item.id}`)}>
						<i className="mdi mdi-pencil font-size-18" />
					</Button>
					{/* <Button color="link" className="p-0 text-danger" title="Delete" type="button" disabled={deletingId === item.id} onClick={() => handleDelete(item.id)}>
						{deletingId === item.id ? <Spinner size="sm" /> : <i className="mdi mdi-trash-can-outline font-size-18" />}
					</Button> */}
				</div>
			),
		})),
	}), [rows, deletingId, navigate]);

	return (
		<Card>
			<CardBody>
				<div className="d-flex justify-content-end mb-3">
					{rows.length === 0 && (
						<Button color="primary" type="button" onClick={() => navigate("/company-master/add")}> <i className="mdi mdi-plus me-1" />Add Company</Button>
					)}
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

export default connect(null, { setBreadcrumbItems })(CompanyMasterTable);
