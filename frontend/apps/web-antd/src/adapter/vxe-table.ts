import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentPropsMap, ComponentType } from './component';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { isFunction, isString } from '@vben/utils';

import { Button, Image, Popconfirm, Tag } from 'ant-design-vue';

import { $t } from '#/locales';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        return h(Image, { src: row[column.field], ...props });
      },
    });

    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          { size: 'small', type: 'link' },
          { default: () => props?.text },
        );
      },
    });

    vxeUI.renderer.add('CellTag', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const tagProps = typeof props === 'function' ? props(params) : props;
        return h(Tag, { color: tagProps?.color }, { default: () => tagProps?.text });
      },
    });

    // 标签渲染器：逗号分隔的文本 → 多个彩色 Tag
    vxeUI.renderer.add('CellTags', {
      renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        const val = row[column.field];
        if (val == null || val === '') return [h('span', '—')];
        let tags;
        if (Array.isArray(val)) {
          tags = val.filter(Boolean).map(s => String(s));
        } else {
          tags = String(val).split(',').map(s => s.trim()).filter(Boolean);
        }
        if (tags.length === 0) return [h('span', '—')];
        const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#2f54eb'];
        return tags.map((tag, i) =>
          h('span', { style: 'display:inline-block;padding:0 7px;margin:0 4px 2px 0;font-size:12px;line-height:20px;border-radius:4px;color:#fff;background:' + colors[i % colors.length] }, tag),
        );
      },
    });

    /**
     * 操作按钮渲染器
     * 用法: { field: 'action', title: '操作', slots: { default: 'action' }, cellRender: { name: 'CellOperation' } }
     * options 支持预设 edit, delete 或自定义 { code, text, danger, icon, show, confirm }
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', type: 'link', ...props };
        let align: string;
        switch (column.align) {
          case 'center': { align = 'center'; break; }
          case 'left': { align = 'start'; break; }
          default: { align = 'end'; break; }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: { danger: true, text: $t('common.delete') },
          edit: { text: $t('common.edit') },
        };
        const operations: Array<Recordable<any>> = (
          options || ['edit', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : { code: opt, text: $t(`common.${opt}`) || opt, ...defaultProps };
            }
            return { ...defaultProps, ...presets[opt.code], ...opt };
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            Button,
            {
              ...props,
              ...opt,
              icon: undefined,
              onClick: listen
                ? () => attrs?.onClick?.({ code: opt.code, row })
                : undefined,
            },
            {
              default: () => {
                const content: any[] = [];
                if (opt.icon) {
                  content.push(h(IconifyIcon, { class: 'size-5', icon: opt.icon }));
                }
                content.push(opt.text);
                return content;
              },
            },
          );
        }

        function renderConfirm(opt: Recordable<any>) {
          let viewportWrapper: HTMLElement | null = null;
          return h(
            Popconfirm,
            {
              getPopupContainer(el) {
                viewportWrapper = el.closest('.vxe-table--viewport-wrapper');
                return document.body;
              },
              placement: 'topLeft',
              title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
              ...props,
              ...opt,
              icon: undefined,
              onOpenChange: (open: boolean) => {
                if (open) {
                  viewportWrapper?.style.setProperty('pointer-events', 'none');
                } else {
                  viewportWrapper?.style.removeProperty('pointer-events');
                }
              },
              onConfirm: () => {
                attrs?.onClick?.({ code: opt.code, row });
              },
            },
            {
              default: () => renderBtn({ ...opt }, false),
              description: () =>
                h('div', { class: 'truncate' }, $t('ui.actionMessage.deleteConfirm', [row[attrs?.nameField || 'name']])),
            },
          );
        }

        const btns = operations.map((opt) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        );
        return h('div', { class: 'flex table-operations', style: { justifyContent: align } }, btns);
      },
    });
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType, ComponentPropsMap>>
) => useGrid<T, ComponentType, ComponentPropsMap>(...rest);

export type * from '@vben/plugins/vxe-table';
