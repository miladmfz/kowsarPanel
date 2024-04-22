import { Injectable } from '@angular/core';
import { operationSuccessful } from '../framework-components/app-messages';
declare var $: any;

@Injectable()
export class NotificationService {
    succeded(message: string = operationSuccessful) {
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

