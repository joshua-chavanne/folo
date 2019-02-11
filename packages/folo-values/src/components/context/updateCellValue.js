/**
 * update cell value in the previousState
 *
 * @param {object} cell - new cell that should be register
 * @param {string} cell.nameRef   key for value
 * @param {string||boolean} cell.initValue value
 * @param {string} cell.groupName group name in case the cell is group-toggle
 */
function updateValue({
  values: oldValues,
  isGroupValuesUpdate,
  btnGroup,
  nameRef,
  newValue,
  groupName
}) {
  const newValuesHolder = {};

  newValuesHolder[nameRef] = newValue;

  if (groupName) {
    isGroupValuesUpdate = !isGroupValuesUpdate;

    if (newValue !== false) {
      // update group of values

      // toggle group values
      btnGroup[groupName].forEach(cellNameRef => {
        // toggle all except the targeted key name which called nameRef
        // since we already changed its value above
        if (cellNameRef !== nameRef) {
          newValuesHolder[cellNameRef] = !newValue;
        }
      });
    }
  }
  return {
    values: { ...oldValues, ...newValuesHolder },
    isGroupValuesUpdate
  };
}

export default updateValue;