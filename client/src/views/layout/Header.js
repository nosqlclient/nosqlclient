import React, { Component } from "react";
import { AppSidebarToggler, AppHeaderDropdown } from "@coreui/react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";

class Header extends Component {
  render() {
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="ml-auto" navbar>
          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <i className="fa fa-chevron-circle-down" />
              More
            </DropdownToggle>
            <DropdownMenu right style={{ right: "auto" }}>
              <DropdownItem>
                <i className="fa fa-wrench" />
                Settings
              </DropdownItem>
              <DropdownItem>
                <i className="fa fa-download" />
                Import Nosqlclient Data
              </DropdownItem>
              <DropdownItem>
                <i className="fa fa-upload" />
                Export Nosqlclient Data
              </DropdownItem>
              <DropdownItem>
                <i className="fa fa-globe" />
                About
              </DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
          <NavItem className="px-3">
            <NavLink href="#">
              <i className="fa fa-sign-in" />
              <strong>Connect</strong>
            </NavLink>
          </NavItem>
        </Nav>
      </React.Fragment>
    );
  }
}

export default Header;
