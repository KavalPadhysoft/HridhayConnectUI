
import React , {useEffect} from "react"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import PendingInvoicePaymentTable from "./PendingInvoicePaymentTable";
import PendingPaymentFollowUp from "./PendingPaymentFollowUp";

const Dashboard = (props) => {

  document.title = "Dashboard | Lexa - Responsive Bootstrap 5 Admin Dashboard";


  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Dashboard", link: "#" }
  ]

  useEffect(() => {
    props.setBreadcrumbItems('Dashboard')
  },)

 

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
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);