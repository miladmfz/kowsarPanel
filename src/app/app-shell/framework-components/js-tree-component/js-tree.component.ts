import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { createGuid } from '../constants';
declare var $: any;

@Component({
  selector: 'app-js-tree',
  templateUrl: './js-tree.component.html',
})
export class JsTreeComponent implements OnInit {
  treeId = '#tree';

  @Input() readonly = true;
  @Input() multiple = false;

  @Output() rename = new EventEmitter<any>();
  @Output() move = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() selected = new EventEmitter<any>();
  @Output() checked = new EventEmitter<any>();
  @Output() unchecked = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  drawTree(inputData) {
    const plugins = ['types', 'search', 'sort'];
    if (!this.readonly) {
      plugins.push('dnd');
      plugins.push('contextmenu');
    }

    if (this.multiple) {
      plugins.push('checkbox');
    }

    const data = [];
    inputData.forEach((item) => {
      const node = {
        id: item.id,
        text: item.title,
        parent: item.parentId,
        state: {
          opened: false,
          disabled: item.isLocked,
          selected: false,
        },
        data: item,
        type: 'default',
      };

      if (node.parent == '#') {
        node.type = 'rootNode';
      }

      data.push(node);
    });

    var self = this;
    $(this.treeId)
      .jstree({
        core: {
          check_callback: true,
          themes: {
            responsive: !1,
          },
          data,
        },
        checkbox: {
          tie_selection: false,
        },
        types: {
          default: {
            icon: 'ki-solid ki-folder text-primary',
          },
          rootNode: {
            icon: 'ki-solid ki-folder text-success',
          },
          locked: {
            icon: 'ki-outline ki-file',
          },
          removed: {
            icon: 'ki-outline ki-file',
          },
        },
        contextmenu: {
          items: {
            create: {
              label: 'جدید',
              icon: 'fa-plus fas text-success',
              action: function (data) {
                const inst = $.jstree.reference(data.reference),
                  obj = inst.get_node(data.reference);
                inst.create_node(obj, {}, 'last', function (new_node) {
                  new_node.data = { guid: createGuid() };
                  try {
                    inst.edit(new_node);
                  } catch (ex) {
                    setTimeout(function () {
                      inst.edit(new_node);
                    }, 0);
                  }
                });
              },
            },
            rename: {
              label: 'تغییر نام',
              icon: 'fa-edit fas text-warning',
              action: function (data) {
                const inst = $.jstree.reference(data.reference);
                const obj = inst.get_node(data.reference);
                inst.edit(obj);
              },
            },
            remove: {
              label: 'حذف',
              icon: 'fa-trash fas text-danger',
              action: function (data) {
                const inst = $.jstree.reference(data.reference);
                const obj = inst.get_node(data.reference);
                inst.delete_node(obj);
              },
            },
          },
        },
        state: { key: 'demo2' },
        plugins: plugins,
      })
      .on('select_node.jstree', function (e, data) {
        self.selected.emit(data.node.data);
      })
      .on('rename_node.jstree', function (e, data) {
        if (data.old == data.text) return;

        const id = parseFloat(data.node.id) ? data.node.id : 0;
        const parent = $(self.treeId).jstree(true).get_node(data.node.parent);

        const command = {
          id,
          parentGuid: parent.data.guid,
          guid: data.node.data.guid,
          title: data.text,
        };

        self.rename.emit(command);
      })
      .on('move_node.jstree', function (e, data) {
        const id = parseFloat(data.node.id) ? data.node.id : 0;
        const parent = $(self.treeId).jstree(true).get_node(data.node.parent);

        const command = {
          id,
          parentGuid: parent.data.guid,
        };

        self.move.emit(command);
      })
      .on('delete_node.jstree', function (e, data) {
        if (parseFloat(data.node.id)) {
          self.delete.emit(data.node.id);
        }
      })
      .on('check_node.jstree', function (e, data) {
        self.checked.emit(data.node.data);
      })
      .on('uncheck_node.jstree', function (e, data) {
        self.unchecked.emit(data.node.data);
      });

    var to;
    $('#plugins4_q').keyup(function () {
      if (to) {
        clearTimeout(to);
      }
      to = setTimeout(function () {
        var v = $('#plugins4_q').val();
        $(self.treeId).jstree(true).search(v);
      }, 250);
    });
  }

  collapseAll() {
    $(this.treeId).jstree('close_all');
  }

  expandAll() {
    $(this.treeId).jstree('open_all');
  }
}
