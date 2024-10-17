import { Injectable } from '@angular/core';
declare var $: any;

@Injectable()
export class NotificationService {
    succeded(message: string = "عملیات با موفقیت انجام شد.") {
        //debugger;
        $.NotificationApp.send(
            "موفقیت",
            message,
            "top-right",
            "#5ba035",
            "success"
        );
    }

    info(message: string) {
        $.NotificationApp.send(
            "توجه",
            message,
            "top-right",
            "#3b98b5",
            "info"
        );
    }

    error(message: string, title = "خطا") {
        $.NotificationApp.send(
            title,
            message,
            "top-right",
            "#bf441d",
            "error"
        );
    }
}

