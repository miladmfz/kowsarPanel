import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class MenuOnlineWebApiService {

    baseUrl: string;
    private readonly headerService = inject(HeaderService);
    basketItems: any[] = [];

    private readonly client = inject(HttpClient);
    private readonly config = inject(AppConfigService);
    private readonly AutoloadingService = inject(LoadingService);

    constructor() {
        // this.baseUrl = this.config.apiUrl + 'MenuOnline/';
        this.baseUrl = this.config.MenuapiUrl;





        const basket = this.session.getString('MenuOnlineBasket');

        if (basket) {
            this.basketItems = JSON.parse(basket);
        }
    }

    private withLoading<T>(obs$: Observable<T>): Observable<T> {
        this.AutoloadingService.show();
        return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
    }

    SaveBasket(): void {
        this.session.setItem(
            'MenuOnlineBasket',
            JSON.stringify(this.basketItems)
        );
    }

    GetMenuCategories(): Observable<any[]> {
        return this.withLoading(
            this.client.get<any[]>(this.baseUrl + 'GetMenuOnlinegroups', { headers: this.headerService.headers })
        );
    }

    GetMenuProducts(categoryRef: number): Observable<any[]> {
        const params = new HttpParams().append('CategoryRef', categoryRef);

        return this.withLoading(
            this.client.get<any[]>(this.baseUrl + 'GetMenuProducts', { headers: this.headerService.headers, params })
        );
    }

    GetMenuProductByCode(goodsCode: string): Observable<any[]> {
        const params = new HttpParams().append('GoodsCode', goodsCode);

        return this.withLoading(
            this.client.get<any[]>(this.baseUrl + 'GetMenuProductByCode', { headers: this.headerService.headers, params })
        );
    }

    AddToBasket(product: any): void {
        const item = this.basketItems.find(x => x.goodsRef === product.goodsRef);

        if (item) {
            item.qty++;
        } else {
            this.basketItems.push({ ...product, qty: 1 });
        }

        this.SaveBasket();
    }

    RemoveFromBasket(goodsRef: number): void {
        this.basketItems = this.basketItems.filter(x => x.goodsRef !== goodsRef);
        this.SaveBasket();
    }

    IncreaseBasketQty(goodsRef: number): void {
        const item = this.basketItems.find(x => x.goodsRef === goodsRef);

        if (item) {
            item.qty++;
            this.SaveBasket();
        }
    }

    DecreaseBasketQty(goodsRef: number): void {
        const item = this.basketItems.find(x => x.goodsRef === goodsRef);

        if (!item) {
            return;
        }

        item.qty--;

        if (item.qty <= 0) {
            this.RemoveFromBasket(goodsRef);
            return;
        }

        this.SaveBasket();
    }

    GetBasketItems(): any[] {
        return this.basketItems;
    }

    GetBasketTotal(): number {
        return this.basketItems.reduce(
            (sum, item) => sum + (item.price * item.qty),
            0
        );
    }

    GetBasketCount(): number {
        return this.basketItems.reduce(
            (sum, item) => sum + item.qty,
            0
        );
    }

    ClearBasket(): void {
        this.basketItems = [];
        this.SaveBasket();
    }

    SubmitMenuOrder(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'SubmitMenuOrder',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

}