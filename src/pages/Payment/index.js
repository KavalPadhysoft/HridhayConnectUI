import React from "react";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import PendingInvoicePaymentTable from "../Dashboard/PendingInvoicePaymentTable";
import PendingPaymentFollowUp from "../Dashboard/PendingPaymentFollowUp";
// import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
// import { MDBDataTable } from "mdbreact";

// //Bradcrum
// import { connect } from "react-redux";
// import { setBreadcrumbItems } from "../../store/actions";


// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
// import { getPaymentsPages, deletePaymentById, getPaymentById, savePayment } from "../../helpers/fakebackend_helper";
// import { getClientDropdownList, getInvoiceDropdownList } from "../../helpers/api_helper";
// import { getLovDropdownList } from "../../helpers/api_helper";
// import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
// import PaymentForm from "./PaymentForm";

// const PAYMENT_LIST_SORT_COLUMN = "paymentId";
// const PAYMENT_LIST_SORT_DIR = "asc";
// // Bradcrum

const Payment = (props) => {
	React.useEffect(() => {
		props.setBreadcrumbItems('Payment');
	}, [props]);

	return (
		<React.Fragment>
			<div className="container-fluid">
				{/* Pending Invoice Payment Table */}
				<div className="row">
					<div className="col-12">
						{/* <PendingInvoicePaymentTable /> */}
						<PendingPaymentFollowUp />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default connect(null, { setBreadcrumbItems })(Payment);

