import PropTypes from "prop-types"
import React, { useState, useEffect } from "react"
import { Row, Col, Collapse } from "reactstrap"
import { Link} from "react-router-dom"
import withRouter from "components/Common/withRouter"
import classname from "classnames"

//i18n
import { withTranslation } from "react-i18next"

import { connect } from "react-redux"

const Navbar = props => {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <React.Fragment>
      <div className="container-fluid">
        <div className="topnav">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse
              isOpen={props.leftMenu}
              className="navbar-collapse"
              id="topnav-menu-content"
            >
              <ul className="navbar-nav">
                {/* Dynamic menu rendering, same as vertical */}
                {(() => {
                  try {
                    const menuRaw = localStorage.getItem("menuPages");
                    const menuList = menuRaw ? JSON.parse(menuRaw) : [];
                    if (!Array.isArray(menuList) || !menuList.length) {
                      return (
                        <li className="nav-item">
                          <Link className="nav-link" to="/dashboard">
                            <i className="mdi mdi-view-dashboard"></i>
                            <span>{props.t("Dashboard")}</span>
                          </Link>
                        </li>
                      );
                    }
                    const activeItems = menuList
                      .filter(item => item && item.isActive && !item.isDeleted)
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    const menuById = new Map(activeItems.map(item => [Number(item.id), item]));
                    const rootParents = activeItems.filter(item => Number(item.parentId) === 0);
                    const parentWithChildren = rootParents.map(parent => ({
                      ...parent,
                      children: activeItems.filter(
                        child => Number(child.parentId) === Number(parent.id)
                      ),
                    }));
                    const orphanChildrenAsTopLevel = activeItems
                      .filter(item => Number(item.parentId) !== 0 && !menuById.has(Number(item.parentId)))
                      .map(item => ({
                        ...item,
                        parentId: 0,
                        children: [],
                      }));
                    const dynamicMenu = [...parentWithChildren, ...orphanChildrenAsTopLevel];
                    const getDynamicMenuLink = child => {
                      const controller = (child?.controller || "").toLowerCase();
                      if (child?.url && child.url !== "string") {
                        return child.url.startsWith("/") ? child.url : `/${child.url}`;
                      }
                      if (controller) {
                        return controller.endsWith("s") ? `/${controller}` : `/${controller}s`;
                      }
                      return "/#";
                    };
                    const getDynamicMenuIconClass = menuItem => {
                      const iconValue = String(menuItem?.icon || "").trim();
                      if (!iconValue) {
                        return "mdi mdi-folder-outline";
                      }
                      if (iconValue.startsWith("mdi ")) {
                        return iconValue;
                      }
                      if (iconValue.startsWith("mdi-")) {
                        return `mdi ${iconValue}`;
                      }
                      return iconValue;
                    };
                    return dynamicMenu.map(parent => {
                      const isOpen = openDropdown === parent.id;
                      return (
                        <li
                          className={parent.children.length ? "nav-item dropdown" : "nav-item"}
                          key={`dynamic-parent-${parent.id}`}
                          onMouseEnter={() => parent.children.length && setOpenDropdown(parent.id)}
                          onMouseLeave={() => parent.children.length && setOpenDropdown(null)}
                        >
                          <Link
                            to={parent.children.length ? "/#" : getDynamicMenuLink(parent)}
                            className={parent.children.length ? "nav-link dropdown-toggle arrow-none" : "nav-link"}
                            onClick={e => {
                              if (parent.children.length) {
                                e.preventDefault();
                                setOpenDropdown(isOpen ? null : parent.id);
                              }
                            }}
                          >
                            <i className={getDynamicMenuIconClass(parent)}></i>
                            <span>{parent.name}</span>
                          </Link>
                          {parent.children.length > 0 && (
                            <div className={
                              isOpen
                                ? "dropdown-menu dropdown-menu-left show"
                                : "dropdown-menu dropdown-menu-left"
                            }>
                              {parent.children.map(child => (
                                <Link to={getDynamicMenuLink(child)} className="dropdown-item" key={`dynamic-child-${child.id}`}>
                                  <i className={getDynamicMenuIconClass(child)}></i> {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    });
                  } catch (error) {
                    return null;
                  }
                })()}
              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
}

Navbar.propTypes = {
  leftMenu: PropTypes.any,
  location: PropTypes.any,
  menuOpen: PropTypes.any,
  t: PropTypes.any,
}

const mapStatetoProps = state => {
  const { leftMenu } = state.Layout
  return { leftMenu }
}

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(Navbar))
)
