import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Kharid_ROUTES: Routes = [
    {
        path: '',
        component: NotFoundComponent,


    },
    // 🚫 404
    // {
    //     path: '**',
    //     component: NotFoundComponent,
    // },

    // {
    //     path: 'forosh',
    //     loadChildren: () =>
    //         import('./features/accounting/accounting.routes')
    //             .then(m => m.Accounting_ROUTES),
    // },


    //good

    {
        path: 'good-list',
        title: 'لیست کالای کوثر  ',
        loadComponent: () =>
            import('./good/good-list/good-list.component')
                .then(m => m.GoodListComponent),
    },
    {
        path: 'good-edit',
        title: 'ایجاد کالا کوثر',
        loadComponent: () =>
            import('./good/good-edit/good-edit.component')
                .then(m => m.GoodEditComponent),
    },
    {
        path: 'good-edit/:id',
        title: 'اصلاح کالا کوثر',
        loadComponent: () =>
            import('./good/good-edit/good-edit.component')
                .then(m => m.GoodEditComponent),
    },





    //goodsgrp

    {
        path: 'goodsgrp-list',
        title: 'لیست تنظیمات کوثر',
        loadComponent: () =>
            import('./goodsgrp/goodsgrp-list/goodsgrp-list.component')
                .then(m => m.GoodsgrpListComponent),
    },




    { path: 'purchase-list', title: 'purchase-list', loadComponent: () => import('./purchase/purchase-list/purchase-list.component').then(m => m.PurchaseListComponent), },
    { path: 'purchase-edit', title: 'purchase-edit', loadComponent: () => import('./purchase/purchase-edit/purchase-edit.component').then(m => m.PurchaseEditComponent), },
    { path: 'purchase-edit/:id', title: 'purchase-edit', loadComponent: () => import('./purchase/purchase-edit/purchase-edit.component').then(m => m.PurchaseEditComponent), },
    { path: 'return-purchase-list', title: 'return-purchase-list', loadComponent: () => import('./return-purchase/return-purchase-list/return-purchase-list.component').then(m => m.ReturnPurchaseListComponent), },
    { path: 'return-purchase-edit', title: 'return-purchase-edit', loadComponent: () => import('./return-purchase/return-purchase-edit/return-purchase-edit.component').then(m => m.ReturnPurchaseEditComponent), },
    { path: 'return-purchase-edit/:id', title: 'return-purchase-edit', loadComponent: () => import('./return-purchase/return-purchase-edit/return-purchase-edit.component').then(m => m.ReturnPurchaseEditComponent), },
    { path: 'good-request-list', title: 'good-request-list', loadComponent: () => import('./good-request/good-request-list/good-request-list.component').then(m => m.GoodRequestListComponent), },
    { path: 'good-request-edit', title: 'good-request-edit', loadComponent: () => import('./good-request/good-request-edit/good-request-edit.component').then(m => m.GoodRequestEditComponent), },
    { path: 'good-request-edit/:id', title: 'good-request-edit', loadComponent: () => import('./good-request/good-request-edit/good-request-edit.component').then(m => m.GoodRequestEditComponent), },
    { path: 'purchase-order-list', title: 'purchase-order-list', loadComponent: () => import('./purchase-order/purchase-order-list/purchase-order-list.component').then(m => m.PurchaseOrderListComponent), },
    { path: 'purchase-order-edit', title: 'purchase-order-edit', loadComponent: () => import('./purchase-order/purchase-order-edit/purchase-order-edit.component').then(m => m.PurchaseOrderEditComponent), },
    { path: 'purchase-order-edit/:id', title: 'purchase-order-edit', loadComponent: () => import('./purchase-order/purchase-order-edit/purchase-order-edit.component').then(m => m.PurchaseOrderEditComponent), },
    { path: 'request-order-list', title: 'request-order-list', loadComponent: () => import('./request-order/request-order-list/request-order-list.component').then(m => m.RequestOrderListComponent), },
    { path: 'request-order-edit', title: 'request-order-edit', loadComponent: () => import('./request-order/request-order-edit/request-order-edit.component').then(m => m.RequestOrderEditComponent), },
    { path: 'request-order-edit/:id', title: 'request-order-edit', loadComponent: () => import('./request-order/request-order-edit/request-order-edit.component').then(m => m.RequestOrderEditComponent), },
    { path: 'auto-request-row-list', title: 'auto-request-row-list', loadComponent: () => import('./auto-request-row/auto-request-row-list/auto-request-row-list.component').then(m => m.AutoRequestRowListComponent), },
    { path: 'auto-request-row-edit', title: 'auto-request-row-edit', loadComponent: () => import('./auto-request-row/auto-request-row-edit/auto-request-row-edit.component').then(m => m.AutoRequestRowEditComponent), },
    { path: 'auto-request-row-edit/:id', title: 'auto-request-row-edit', loadComponent: () => import('./auto-request-row/auto-request-row-edit/auto-request-row-edit.component').then(m => m.AutoRequestRowEditComponent), },
    { path: 'purchase-payment-list', title: 'purchase-payment-list', loadComponent: () => import('./purchase-payment/purchase-payment-list/purchase-payment-list.component').then(m => m.PurchasePaymentListComponent), },
    { path: 'purchase-payment-edit', title: 'purchase-payment-edit', loadComponent: () => import('./purchase-payment/purchase-payment-edit/purchase-payment-edit.component').then(m => m.PurchasePaymentEditComponent), },
    { path: 'purchase-payment-edit/:id', title: 'purchase-payment-edit', loadComponent: () => import('./purchase-payment/purchase-payment-edit/purchase-payment-edit.component').then(m => m.PurchasePaymentEditComponent), },
    { path: 'vendor-mandeh-list', title: 'vendor-mandeh-list', loadComponent: () => import('./vendor-mandeh/vendor-mandeh-list/vendor-mandeh-list.component').then(m => m.VendorMandehListComponent), },
    { path: 'vendor-mandeh-edit', title: 'vendor-mandeh-edit', loadComponent: () => import('./vendor-mandeh/vendor-mandeh-edit/vendor-mandeh-edit.component').then(m => m.VendorMandehEditComponent), },
    { path: 'vendor-mandeh-edit/:id', title: 'vendor-mandeh-edit', loadComponent: () => import('./vendor-mandeh/vendor-mandeh-edit/vendor-mandeh-edit.component').then(m => m.VendorMandehEditComponent), },
    { path: 'vendor-list', title: 'vendor-list', loadComponent: () => import('./vendor/vendor-list/vendor-list.component').then(m => m.VendorListComponent), },
    { path: 'vendor-edit', title: 'vendor-edit', loadComponent: () => import('./vendor/vendor-edit/vendor-edit.component').then(m => m.VendorEditComponent), },
    { path: 'vendor-edit/:id', title: 'vendor-edit', loadComponent: () => import('./vendor/vendor-edit/vendor-edit.component').then(m => m.VendorEditComponent), },
    { path: 'good-analysis-list', title: 'good-analysis-list', loadComponent: () => import('./good-analysis/good-analysis-list/good-analysis-list.component').then(m => m.GoodAnalysisListComponent), },
    { path: 'good-analysis-edit', title: 'good-analysis-edit', loadComponent: () => import('./good-analysis/good-analysis-edit/good-analysis-edit.component').then(m => m.GoodAnalysisEditComponent), },
    { path: 'good-analysis-edit/:id', title: 'good-analysis-edit', loadComponent: () => import('./good-analysis/good-analysis-edit/good-analysis-edit.component').then(m => m.GoodAnalysisEditComponent), },
    { path: 'location-list', title: 'location-list', loadComponent: () => import('./location/location-list/location-list.component').then(m => m.LocationListComponent), },
    { path: 'location-edit', title: 'location-edit', loadComponent: () => import('./location/location-edit/location-edit.component').then(m => m.LocationEditComponent), },
    { path: 'location-edit/:id', title: 'location-edit', loadComponent: () => import('./location/location-edit/location-edit.component').then(m => m.LocationEditComponent), },
    { path: 'reploglink-list', title: 'reploglink-list', loadComponent: () => import('./reploglink/reploglink-list/reploglink-list.component').then(m => m.ReploglinkListComponent), },
    { path: 'reploglink-edit', title: 'reploglink-edit', loadComponent: () => import('./reploglink/reploglink-edit/reploglink-edit.component').then(m => m.ReploglinkEditComponent), },
    { path: 'reploglink-edit/:id', title: 'reploglink-edit', loadComponent: () => import('./reploglink/reploglink-edit/reploglink-edit.component').then(m => m.ReploglinkEditComponent), },
    { path: 'samane-good-list', title: 'samane-good-list', loadComponent: () => import('./samane-good/samane-good-list/samane-good-list.component').then(m => m.SamaneGoodListComponent), },
    { path: 'samane-good-edit', title: 'samane-good-edit', loadComponent: () => import('./samane-good/samane-good-edit/samane-good-edit.component').then(m => m.SamaneGoodEditComponent), },
    { path: 'samane-good-edit/:id', title: 'samane-good-edit', loadComponent: () => import('./samane-good/samane-good-edit/samane-good-edit.component').then(m => m.SamaneGoodEditComponent), },
    { path: 'personjob-list', title: 'personjob-list', loadComponent: () => import('./personjob/personjob-list/personjob-list.component').then(m => m.PersonjobListComponent), },
    { path: 'personjob-edit', title: 'personjob-edit', loadComponent: () => import('./personjob/personjob-edit/personjob-edit.component').then(m => m.PersonjobEditComponent), },
    { path: 'personjob-edit/:id', title: 'personjob-edit', loadComponent: () => import('./personjob/personjob-edit/personjob-edit.component').then(m => m.PersonjobEditComponent), },
    { path: 'good-serial-frame-list', title: 'good-serial-frame-list', loadComponent: () => import('./good-serial-frame/good-serial-frame-list/good-serial-frame-list.component').then(m => m.GoodSerialFrameListComponent), },
    { path: 'good-serial-frame-edit', title: 'good-serial-frame-edit', loadComponent: () => import('./good-serial-frame/good-serial-frame-edit/good-serial-frame-edit.component').then(m => m.GoodSerialFrameEditComponent), },
    { path: 'good-serial-frame-edit/:id', title: 'good-serial-frame-edit', loadComponent: () => import('./good-serial-frame/good-serial-frame-edit/good-serial-frame-edit.component').then(m => m.GoodSerialFrameEditComponent), },
    { path: 'close-acc-senario-list', title: 'close-acc-senario-list', loadComponent: () => import('./close-acc-senario/close-acc-senario-list/close-acc-senario-list.component').then(m => m.CloseAccSenarioListComponent), },
    { path: 'close-acc-senario-edit', title: 'close-acc-senario-edit', loadComponent: () => import('./close-acc-senario/close-acc-senario-edit/close-acc-senario-edit.component').then(m => m.CloseAccSenarioEditComponent), },
    { path: 'close-acc-senario-edit/:id', title: 'close-acc-senario-edit', loadComponent: () => import('./close-acc-senario/close-acc-senario-edit/close-acc-senario-edit.component').then(m => m.CloseAccSenarioEditComponent), },
    { path: 'stack-transfer-list', title: 'stack-transfer-list', loadComponent: () => import('./stack-transfer/stack-transfer-list/stack-transfer-list.component').then(m => m.StackTransferListComponent), },
    { path: 'stack-transfer-edit', title: 'stack-transfer-edit', loadComponent: () => import('./stack-transfer/stack-transfer-edit/stack-transfer-edit.component').then(m => m.StackTransferEditComponent), },
    { path: 'stack-transfer-edit/:id', title: 'stack-transfer-edit', loadComponent: () => import('./stack-transfer/stack-transfer-edit/stack-transfer-edit.component').then(m => m.StackTransferEditComponent), },
    { path: 'stack-enumeration-list', title: 'stack-enumeration-list', loadComponent: () => import('./stack-enumeration/stack-enumeration-list/stack-enumeration-list.component').then(m => m.StackEnumerationListComponent), },
    { path: 'stack-enumeration-edit', title: 'stack-enumeration-edit', loadComponent: () => import('./stack-enumeration/stack-enumeration-edit/stack-enumeration-edit.component').then(m => m.StackEnumerationEditComponent), },
    { path: 'stack-enumeration-edit/:id', title: 'stack-enumeration-edit', loadComponent: () => import('./stack-enumeration/stack-enumeration-edit/stack-enumeration-edit.component').then(m => m.StackEnumerationEditComponent), },
    { path: 'good-receipt-list', title: 'good-receipt-list', loadComponent: () => import('./good-receipt/good-receipt-list/good-receipt-list.component').then(m => m.GoodReceiptListComponent), },
    { path: 'good-receipt-edit', title: 'good-receipt-edit', loadComponent: () => import('./good-receipt/good-receipt-edit/good-receipt-edit.component').then(m => m.GoodReceiptEditComponent), },
    { path: 'good-receipt-edit/:id', title: 'good-receipt-edit', loadComponent: () => import('./good-receipt/good-receipt-edit/good-receipt-edit.component').then(m => m.GoodReceiptEditComponent), },
    { path: 'good-issue-list', title: 'good-issue-list', loadComponent: () => import('./good-issue/good-issue-list/good-issue-list.component').then(m => m.GoodIssueListComponent), },
    { path: 'good-issue-edit', title: 'good-issue-edit', loadComponent: () => import('./good-issue/good-issue-edit/good-issue-edit.component').then(m => m.GoodIssueEditComponent), },
    { path: 'good-issue-edit/:id', title: 'good-issue-edit', loadComponent: () => import('./good-issue/good-issue-edit/good-issue-edit.component').then(m => m.GoodIssueEditComponent), },
    { path: 'good-exchange-list', title: 'good-exchange-list', loadComponent: () => import('./good-exchange/good-exchange-list/good-exchange-list.component').then(m => m.GoodExchangeListComponent), },
    { path: 'good-exchange-edit', title: 'good-exchange-edit', loadComponent: () => import('./good-exchange/good-exchange-edit/good-exchange-edit.component').then(m => m.GoodExchangeEditComponent), },
    { path: 'good-exchange-edit/:id', title: 'good-exchange-edit', loadComponent: () => import('./good-exchange/good-exchange-edit/good-exchange-edit.component').then(m => m.GoodExchangeEditComponent), },
    { path: 'good-adjustment-list', title: 'good-adjustment-list', loadComponent: () => import('./good-adjustment/good-adjustment-list/good-adjustment-list.component').then(m => m.GoodAdjustmentListComponent), },
    { path: 'good-adjustment-edit', title: 'good-adjustment-edit', loadComponent: () => import('./good-adjustment/good-adjustment-edit/good-adjustment-edit.component').then(m => m.GoodAdjustmentEditComponent), },
    { path: 'good-adjustment-edit/:id', title: 'good-adjustment-edit', loadComponent: () => import('./good-adjustment/good-adjustment-edit/good-adjustment-edit.component').then(m => m.GoodAdjustmentEditComponent), },
    { path: 'extended-barcode-rpt-list', title: 'extended-barcode-rpt-list', loadComponent: () => import('./extended-barcode-rpt/extended-barcode-rpt-list/extended-barcode-rpt-list.component').then(m => m.ExtendedBarcodeRptListComponent), },
    { path: 'extended-barcode-rpt-edit', title: 'extended-barcode-rpt-edit', loadComponent: () => import('./extended-barcode-rpt/extended-barcode-rpt-edit/extended-barcode-rpt-edit.component').then(m => m.ExtendedBarcodeRptEditComponent), },
    { path: 'extended-barcode-rpt-edit/:id', title: 'extended-barcode-rpt-edit', loadComponent: () => import('./extended-barcode-rpt/extended-barcode-rpt-edit/extended-barcode-rpt-edit.component').then(m => m.ExtendedBarcodeRptEditComponent), },
    { path: 'stack-list', title: 'stack-list', loadComponent: () => import('./stack/stack-list/stack-list.component').then(m => m.StackListComponent), },


];
