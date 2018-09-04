import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import CellEngine from "./CellEngine";

import { ValuesConsumer } from "./context";

import { keyGenerator } from "../../utils";
import withContext from "../withContext";

import {
  VALUE,
  CHECKED,
  TEXT,
  SELECT,
  LIST,
  CHECKBOX,
  RADIO,
  INPUT,
  BTN
} from "./constants";

const propTypes = {
  component: PropTypes.node,
  valueKey: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  id: PropTypes.string,
  type: PropTypes.string,
  groupName: PropTypes.string,
  children: PropTypes.node,
  registerCellInfo: PropTypes.func,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

const defaultProps = {
  component: null,
  valueKey: null,
  value: "",
  checked: false,
  id: keyGenerator("autoID"),
  type: TEXT,
  groupName: null,
  children: null,
  registerCellInfo() {},
  onChange() {},
  onBlur() {}
};

/**
 * Gets the cell type
 * returns booleans type flage.
 *
 * @param {string} cell_type
 * @return {Object} - isBtn, isSelect, isInput
 */
function recognizeCellType(type, checked, value) {
  let isInput = false;
  let RecommendedComponent = INPUT;
  let valueRef = VALUE;
  let initValue = value;
  let cellType = INPUT;

  if (type === SELECT || type === LIST) {
    RecommendedComponent = SELECT;
    cellType = SELECT;
  } else if (type === CHECKBOX || type === RADIO) {
    valueRef = CHECKED;
    initValue = checked;
    cellType = BTN;
  } else {
    isInput = true;
  }
  return {
    isInput,
    valueRef,
    initValue,
    cellType,
    RecommendedComponent
  };
}

class Cell extends PureComponent {
  constructor(props) {
    super(props);
    this.cellUpdated = false;
  }

  render() {
    // console.log("Cell update");

    const {
      component: userComponent,
      valueKey,
      value,
      checked,
      id,
      type,
      groupName,
      children,
      registerCellInfo,
      onChange,
      onBlur,
      ...rest
    } = this.props;

    const {
      valueRef,
      isInput,
      initValue,
      cellType,
      RecommendedComponent
    } = recognizeCellType(type, checked, value);

    const nameRef =
      valueKey || `${type}_${id}${groupName ? `_${groupName}` : ""}`;

    // register cell info in context state
    console.log("initValue", initValue);

    registerCellInfo({
      nameRef,
      initValue,
      groupName
    });

    this.cellUpdated = !this.cellUpdated;

    return (
      <CellEngine
        id={id}
        type={type}
        valueRef={valueRef}
        initValue={initValue}
        isInput={isInput}
        cellType={cellType}
        groupName={groupName}
        nameRef={nameRef}
        cellUpdated={this.cellUpdated}
        CellComponent={userComponent || RecommendedComponent}
        onChange={onChange}
        onBlur={onBlur}
        rest={rest}
      >
        {children}
      </CellEngine>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export { Cell as PureCell };

export default withContext({
  Component: Cell,
  Consumer: ValuesConsumer,
  contextProps: ["registerCellInfo"]
});
