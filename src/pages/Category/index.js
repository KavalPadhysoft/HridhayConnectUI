import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteCategoryById, getCategoryById, getCategoriesPages, saveCategory } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import CategoryForm from "./CategoryForm"

const CATEGORY_LIST_SORT_COLUMN = "name"
const CATEGORY_LIST_SORT_DIR = "asc"

const Categories = props => {
  document.title = `Category | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const categoryId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Category/manage")
  const isEditMode = isFormPage && categoryId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(CATEGORY_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(CATEGORY_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Category" : "Create Category")
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    isDeleted: false,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Category", link: "#" },
  ]

  const loadCategories = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getCategoriesPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load categories")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Category")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadCategories()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  // Load category data for edit mode or reset for create mode
  useEffect(() => {
    const loadCategory = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Category")
        setFormData({
          id: 0,
          name: "",
          isDeleted: false,
        })
        return
      }

      setLoading(true)
      try {
        const response = await getCategoryById(categoryId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load category")
        }

        const category = response?.data || {}
        setFormTitle("Edit Category")
        setFormData({
          id: category.id || 0,
          name: category.name || "",
          isDeleted: Boolean(category.isDeleted),
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load category")
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [isFormPage, isEditMode, categoryId])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Category Name", field: "name", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        name: item.name || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Category/manage/${item.id}`)}
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
    })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this category?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteCategoryById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Category deleted successfully")
        await loadCategories()
        return
      }

      throw new Error(response?.message || "Failed to delete category")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete category"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
      }

      if (isEditMode) {
        payload.id = Number(formData.id) || categoryId
      }

      const response = await saveCategory(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Category saved successfully")
        navigate("/Category")
        return
      }

      throw new Error(response?.message || "Failed to save category")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save category"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isFormPage) {
    return (
      <CategoryForm
        title={formTitle}
        formData={formData}
        saving={saving}
        formError={formError}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/Category")}
      />
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/Category/manage")}>
            <i className="mdi mdi-plus me-1" />Add Category
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
  )
}

export default connect(null, { setBreadcrumbItems })(Categories)
