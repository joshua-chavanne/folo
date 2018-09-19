import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import { GridConsumer } from "./context";

import { keyGenerator } from "../../utils";
import withContext from "../withContext";

function location(colOrRow, to) {
  if (colOrRow && to) {
    return `${colOrRow} / ${to}`;
  }
  return `${colOrRow}`;
}

const CENTER = "center";
const START = "flex-start ";
const ROW = "row";
const COLUMN = "column";

const container = {
  display: "flex",
  backgroundColor: "red"
};

const propTypes = {
  component: PropTypes.node,

  row: PropTypes.number,
  toRow: PropTypes.number,

  col: PropTypes.number,
  toCol: PropTypes.number,
  isCenter: PropTypes.bool,

  style: PropTypes.objectOf(PropTypes.string),

  autoPositionCell: PropTypes.func.isRequired,

  isHorizontal: PropTypes.bool,
  children: PropTypes.node.isRequired
};

const defaultProps = {
  component: "div",

  row: null,
  toRow: null,

  col: null,
  toCol: null,
  isCenter: false,

  style: {},

  isHorizontal: true
};

/**
 * Used only when the Cell type is list
 * render option as defautl
 */
class GridItem extends PureComponent {
  state = {
    key: keyGenerator("gridItem")
  };

  render() {
    const {
      component: CellComponent,

      row,
      toRow,

      col,
      toCol,

      isCenter,

      style,

      autoPositionCell,

      isHorizontal,
      children
    } = this.props;

    const { key } = this.state;

    // console.log('GridItem updated');

    const autoPosition = autoPositionCell({ key, row, toRow });

    container.flexDirection = isHorizontal ? ROW : COLUMN;
    container.gridRow = location(autoPosition, toRow);

    if (isCenter) {
      container.justifyContent = CENTER;
      container.gridColumn = location(1, -1);
    } else if (col || toCol) {
      container.justifyContent = START;
      container.gridColumn = location(col || 0, toCol);
    }

    const styles = Object.assign({}, container, style);

    return <CellComponent style={styles}>{children}</CellComponent>;
  }
}

GridItem.propTypes = propTypes;
GridItem.defaultProps = defaultProps;

export { GridItem as PureGrid };

export default withContext({
  Component: GridItem,
  Consumer: GridConsumer,
  contextProps: ["autoPositionCell"]
});
