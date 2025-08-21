import { Injectable } from '@angular/core';
declare var $: any;
import { MessagesDictionary } from '../../../environment/messages.config';

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

    error1(message: string, title = "خطا") {
        const message1 = MessagesDictionary[message] || "خطای ناشناخته رخ داده است.";

        $.NotificationApp.send(
            title,
            message1,
            "top-right",
            "#bf441d",
            "error"
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

    warning(message: string, title = "خطا") {
        $.NotificationApp.send(
            title,
            message,
            "top-right",
            "#f3da0b",
            "warning"
        );
    }



}


