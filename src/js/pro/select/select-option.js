import SelectorEngine from '../../mdb/dom/selector-engine';

class SelectOption {
  constructor(
    id,
    nativeOption,
    multiple,
    value,
    label,
    selected,
    disabled,
    secondaryText,
    groupId,
    icon
  ) {
    this.id = id;
    this.nativeOption = nativeOption;
    this.multiple = multiple;
    this.value = value;
    this.label = label;
    this.selected = selected;
    this.disabled = disabled;
    this.secondaryText = secondaryText;
    this.groupId = groupId;
    this.icon = icon;
    this.node = null;
    this.active = false;
  }

  select() {
    if (this.multiple) {
      this._selectMultiple();
    } else {
      this._selectSingle();
    }
  }

  _selectSingle() {
    if (!this.selected) {
      this.node.classList.add('selected');
      this.node.setAttribute('aria-selected', true);
      this.selected = true;

      if (this.nativeOption) {
        this.nativeOption.selected = true;
      }
    }
  }

  _selectMultiple() {
    if (!this.selected) {
      const checkbox = SelectorEngine.findOne('.form-check-input', this.node);
      checkbox.checked = true;
      this.node.classList.add('selected');
      this.node.setAttribute('aria-selected', true);
      this.selected = true;

      if (this.nativeOption) {
        this.nativeOption.selected = true;
      }
    }
  }

  deselect() {
    if (this.multiple) {
      this._deselectMultiple();
    } else {
      this._deselectSingle();
    }
  }

  _deselectSingle() {
    if (this.selected) {
      this.node.classList.remove('selected');
      this.node.setAttribute('aria-selected', false);
      this.selected = false;

      if (this.nativeOption) {
        this.nativeOption.selected = false;
      }
    }
  }

  _deselectMultiple() {
    if (this.selected) {
      const checkbox = SelectorEngine.findOne('.form-check-input', this.node);
      checkbox.checked = false;
      this.node.classList.remove('selected');
      this.node.setAttribute('aria-selected', false);
      this.selected = false;

      if (this.nativeOption) {
        this.nativeOption.selected = false;
      }
    }
  }

  setNode(node) {
    this.node = node;
  }

  setActiveStyles() {
    if (!this.active) {
      this.active = true;
      this.node.classList.add('active');
    }
  }

  removeActiveStyles() {
    if (this.active) {
      this.active = false;
      this.node.classList.remove('active');
    }
  }
}

export default SelectOption;
