import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderLayoutData } from "../../helpers/fakebackend_helper";
import { showError } from "../../Pop_show/alertService";
import logo from "../../assets/images/ChamperOfimg/HridhayConnect-Logo.png";
import html2pdf from "html2pdf.js";
import { DASHBOARD_NAME } from "../../config";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

const OrderLayout = props => {
  const navigate = useNavigate();
  const { id, status } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const logoColor = '#5a318c';

  useEffect(() => {
    document.title = `Order Preview | ${DASHBOARD_NAME}`;
    props.setBreadcrumbItems("");
  }, []);

  useEffect(() => {
    loadOrderLayout();
  }, [id, status]);

  const loadOrderLayout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrderLayoutData(id, status);
      if (response?.isSuccess && response?.data) {
        setOrderData(response.data.order || null);
        setOrderItems(response.data.orderItems || []);
      } else {
        setError(response?.message || "Failed to load order layout");
      }
    } catch (err) {
      setError(err?.message || "Error loading order layout");
      showError(err?.message || "Error loading order layout");
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate("/Order");
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("order-layout-print");
    const opt = {
      margin:0,
      filename: `Order-${orderData?.order_No || 'layout'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
  };
    html2pdf().set(opt).from(element).save();
  };
    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateStr) => {
